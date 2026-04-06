from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import datetime
import base64
import io
from PIL import Image
from ultralytics import YOLO
import numpy as np

app = FastAPI()

# Load YOLOv8 Model
try:
    model = YOLO("best.pt")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    model = None

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB Helper
def get_db_connection():
    conn = sqlite3.connect('smartpos.db')
    conn.row_factory = sqlite3.Row
    return conn

# Init DB
def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        unit TEXT NOT NULL,
        category TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        total REAL NOT NULL,
        customer_name TEXT,
        customer_phone TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS transaction_items (
        id TEXT PRIMARY KEY,
        transaction_id TEXT,
        product_id TEXT,
        name TEXT,
        quantity REAL,
        unit_price REAL,
        total_price REAL,
        unit TEXT,
        FOREIGN KEY(transaction_id) REFERENCES transactions(id)
    )''')
    
    # Migration: Add unit column to transaction_items if missing
    try:
        c.execute("ALTER TABLE transaction_items ADD COLUMN unit TEXT")
    except sqlite3.OperationalError:
        pass # Column already exists
    
    # Seed if empty
    product_count = c.execute("SELECT count(*) FROM products").fetchone()[0]
    if product_count == 0:
        c.execute("INSERT INTO products VALUES ('p1', 'Red Apple', 4.50, 'kg', 'Fruits')")
        c.execute("INSERT INTO products VALUES ('p2', 'Banana', 1.20, 'kg', 'Fruits')")
        c.execute("INSERT INTO products VALUES ('p3', 'Milk 1L', 2.50, 'unit', 'Dairy')")
    
    conn.commit()
    conn.close()

init_db()

# Models
class ProductModel(BaseModel):
    id: str
    name: str
    price: float
    unit: str
    category: Optional[str] = None

class CartItemModel(BaseModel):
    id: str
    productId: str
    name: str
    quantity: float
    unitPrice: float
    totalPrice: float
    unit: str

class CustomerModel(BaseModel):
    phone: str
    name: Optional[str] = None

class TransactionModel(BaseModel):
    id: str
    timestamp: int
    items: List[CartItemModel]
    total: float
    customer: Optional[CustomerModel] = None

# Routes
@app.get("/api/products")
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    return products

@app.post("/api/detect")
async def detect_product(data: dict):
    if model is None:
        raise HTTPException(status_code=500, detail="YOLO model not loaded")
    
    try:
        # Decode base64 image
        image_data = data.get("image")
        if not image_data:
            raise HTTPException(status_code=400, detail="No image provided")
            
        header, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Run inference
        results = model.predict(image, conf=0.25)
        
        if len(results) == 0 or len(results[0].boxes) == 0:
            return {"detected": None}
            
        # Get highest confidence detection
        box = results[0].boxes[0]
        label = results[0].names[int(box.cls[0])]
        
        # Map labels to DB product names (fuzzy match or direct lookup)
        conn = get_db_connection()
        product = conn.execute('SELECT * FROM products WHERE name LIKE ? OR category LIKE ? LIMIT 1', 
                             (f"%{label}%", f"%{label}%")).fetchone()
        conn.close()
        
        return {
            "label": label,
            "confidence": float(box.conf[0]),
            "product": dict(product) if product else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
def get_stats():
    conn = get_db_connection()
    todayStr = datetime.datetime.now().strftime("%Y-%m-%d")
    dt = datetime.datetime.strptime(todayStr, "%Y-%m-%d")
    start_ts = dt.timestamp() * 1000
    
    # Count bills today
    count = conn.execute('SELECT count(*) FROM transactions WHERE timestamp >= ?', (start_ts,)).fetchone()[0]
    
    # Total revenue today
    total = conn.execute('SELECT sum(total) FROM transactions WHERE timestamp >= ?', (start_ts,)).fetchone()[0] or 0
    
    # Recent history (last 3)
    history = conn.execute('SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 3').fetchall()
    result_history = []
    for tx in history:
        items = conn.execute('SELECT * FROM transaction_items WHERE transaction_id = ?', (tx['id'],)).fetchall()
        result_history.append({
            "id": tx['id'],
            "timestamp": tx['timestamp'],
            "total": tx['total'],
            "items": [{
                "id": i['id'],
                "productId": i['product_id'],
                "name": i['name'],
                "quantity": i['quantity'],
                "unitPrice": i['unit_price'],
                "totalPrice": i['total_price'],
                "unit": i['unit']
            } for i in items]
        })
        
    conn.close()
    return {
        "todayBillCount": count,
        "todayTotalSales": total,
        "recentHistory": result_history,
        "totalCustomers": count # Assuming 1 tx per customer for now
    }

@app.post("/api/products")
def save_product(product: ProductModel):
    conn = get_db_connection()
    conn.execute('''INSERT INTO products (id, name, price, unit, category) 
                    VALUES (?, ?, ?, ?, ?) 
                    ON CONFLICT(id) DO UPDATE SET 
                    name=excluded.name, price=excluded.price, unit=excluded.unit, category=excluded.category''', 
                 (product.id, product.name, product.price, product.unit, product.category))
    conn.commit()
    conn.close()
    return product

@app.delete("/api/products/{id}")
def delete_product(id: str):
    conn = get_db_connection()
    conn.execute('DELETE FROM products WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}

@app.get("/api/transactions")
def get_transactions(date: Optional[str] = None):
    conn = get_db_connection()
    if date:
        # Date string 'YYYY-MM-DD' to start/end timestamp ms
        dt = datetime.datetime.strptime(date, "%Y-%m-%d")
        start_ts = dt.timestamp() * 1000
        end_ts = (dt + datetime.timedelta(days=1)).timestamp() * 1000
        
        txs = conn.execute('SELECT * FROM transactions WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC', (start_ts, end_ts)).fetchall()
    else:
        txs = conn.execute('SELECT * FROM transactions ORDER BY timestamp DESC').fetchall()
    
    result = []
    for tx in txs:
        items = conn.execute('SELECT * FROM transaction_items WHERE transaction_id = ?', (tx['id'],)).fetchall()
        # Handle potential NULL customers
        customer = None
        if tx['customer_phone']:
             customer = {"name": tx['customer_name'], "phone": tx['customer_phone']}
             
        result.append({
            "id": tx['id'],
            "timestamp": tx['timestamp'],
            "total": tx['total'],
            "customer": customer,
            "items": [{
                "id": i['id'],
                "productId": i['product_id'],
                "name": i['name'],
                "quantity": i['quantity'],
                "unitPrice": i['unit_price'],
                "totalPrice": i['total_price'],
                "unit": i['unit']
            } for i in items]
        })
    conn.close()
    return result

@app.post("/api/transactions")
def save_transaction(tx: TransactionModel):
    conn = get_db_connection()
    try:
        cust_name = tx.customer.name if tx.customer else None
        cust_phone = tx.customer.phone if tx.customer else None
        
        conn.execute('INSERT INTO transactions VALUES (?, ?, ?, ?, ?)', 
                     (tx.id, tx.timestamp, tx.total, cust_name, cust_phone))
        
        for item in tx.items:
            conn.execute('INSERT INTO transaction_items VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                         (item.id, tx.id, item.productId, item.name, item.quantity, item.unitPrice, item.totalPrice, item.unit))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
    return {"message": "Saved"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
