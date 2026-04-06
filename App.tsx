import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Transaction, UnitType, Customer, Stats } from './types';
import { api } from './services/api';
import { InvoiceModal } from './components/InvoiceModal';
import { ScaleModal } from './components/ScaleModal';
import { VisionModal } from './components/VisionModal';
import {
  Camera, Search, Trash2, Plus, Save, History, Edit,
  ShoppingBag, Server, Monitor, FileText, ChevronLeft, ChevronRight, Keyboard
} from 'lucide-react';
import { formatDate, formatTime, formatDateTime } from './utils';

// --- SUB-COMPONENTS (Internal to keep single file structure as requested for some parts) ---

const Navbar = ({ view, setView }: { view: string, setView: (v: string) => void }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 text-white h-14 px-6 flex items-center justify-between shadow-md shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <h1 className="text-lg font-bold tracking-wide">SightBill <span className="text-slate-500"></span> <span className="text-slate-400 font-normal"></span></h1>
        </div>

        <nav className="flex gap-1 ml-8">
          {['POS', 'Item Master', 'Transactions'].map((item) => (
            <button
              key={item}
              onClick={() => setView(item.toLowerCase().replace(' ', '-'))}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === item.toLowerCase().replace(' ', '-')
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1">


        </div>
        <span>{formatTime(time)}</span>
      </div>
    </header>
  );
};

// --- MAIN APP COMPONENT ---

// --- REFACTORED COMPONENTS ---

const ItemMaster = ({ inventory, onUpdate }: { inventory: Product[], onUpdate: () => void }) => {
  const [newItem, setNewItem] = useState<Partial<Product>>({ unit: UnitType.UNIT });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return alert("Fill required fields");
    try {
      await api.saveProduct({
        id: crypto.randomUUID(),
        name: newItem.name,
        price: Number(newItem.price),
        unit: newItem.unit as UnitType,
        category: 'General' // Default to General internally
      });
      alert("Item Saved Successfully!");
      onUpdate();
      setNewItem({ unit: UnitType.UNIT, name: '', price: undefined }); // Explicit reset
    } catch (e) {
      alert("Failed to save item");
      console.error(e);
    }
  };

  const handleSaveEdit = async (product: Product) => {
    try {
      await api.saveProduct({
        ...product,
        price: parseFloat(editPrice)
      });
      setEditingId(null);
      onUpdate();
    } catch (e) {
      alert("Failed to update price");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete item?")) {
      await api.deleteProduct(id);
      onUpdate();
    }
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add Item Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus size={20} /> Add New Item</h2>
          <div className="grid grid-cols-4 gap-4">
            <input
              className="p-2 border rounded"
              placeholder="Item Name"
              value={newItem.name || ''}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
            />
            <input
              className="p-2 border rounded"
              placeholder="Price"
              type="number"
              value={newItem.price || ''}
              onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
            />
            <select
              className="p-2 border rounded"
              value={newItem.unit}
              onChange={e => setNewItem({ ...newItem, unit: e.target.value as UnitType })}
            >
              <option value="unit">Unit</option>
              <option value="kg">Kg</option>
            </select>
            <button
              onClick={handleAddItem}
              className="bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
            >
              Save Item
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3 text-right font-mono">
                    {editingId === p.id ? (
                      <input
                        autoFocus
                        type="number"
                        className="w-24 p-1 border border-blue-500 rounded text-right"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        onBlur={() => handleSaveEdit(p)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit(p)}
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => { setEditingId(p.id); setEditPrice(p.price.toString()); }}
                      >
                        ₹{p.price.toFixed(2)}/{p.unit}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => { setEditingId(p.id); setEditPrice(p.price.toString()); }}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TransactionsView = ({
  onViewInvoice
}: {
  onViewInvoice: (tx: Transaction) => void
}) => {
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<Stats | null>(null);

  const loadData = async () => {
    const [transactions, currentStats] = await Promise.all([
      api.fetchTransactions(date),
      api.fetchStats()
    ]);
    setTxList(transactions);
    setStats(currentStats);
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const totalSales = txList.reduce((acc, tx) => acc + tx.total, 0);

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-10 items-center justify-between">
          <div className="flex gap-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customers Today</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalCustomers || 0}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Sales ({formatDate(date)})</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalSales.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors flex items-center gap-2"
              title="Reload"
            >
              <History size={18} />
            </button>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {txList.length === 0 && <p className="text-center text-slate-400 py-10 italic">No transactions found for this date.</p>}
          {txList.map(tx => (
            <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-blue-200 transition-colors">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="font-mono uppercase">ID: {tx.id}</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {formatTime(tx.timestamp)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-slate-900">₹{tx.total.toFixed(2)}</div>
                <button
                  onClick={() => onViewInvoice(tx)}
                  className="text-xs text-blue-600 font-bold hover:underline mt-1"
                >
                  View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('pos');
  const [inventory, setInventory] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [weightingProduct, setWeightingProduct] = useState<Product | null>(null);
  const [detectedProduct, setDetectedProduct] = useState<Product | null>(null);
  const [detectedLabel, setDetectedLabel] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- INITIAL DATA FETCH ---
  const loadInventory = async () => {
    try {
      const data = await api.fetchInventory();
      setInventory(data);
    } catch (e) {
      console.error("Backend Error", e);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.fetchStats();
      setStats(data);
    } catch (e) {
      console.error("Stats Error", e);
    }
  };

  useEffect(() => {
    loadInventory();
    loadStats();
    const intv = setInterval(loadStats, 10000);
    return () => clearInterval(intv);
  }, []);

  // --- F1 KEY LOGIC ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsCameraOpen(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsCameraOpen(false);
      } else if (e.code === 'Space' && isCameraOpen) {
        // Only trigger scan if no modals are open
        if (!detectedProduct && !detectedLabel && !weightingProduct && !showInvoice) {
          e.preventDefault();
          handleScan();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCameraOpen]);

  // --- CAMERA LOGIC ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOpen && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Camera error", err));
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isCameraOpen]);

  const handleScan = async () => {
    if (!videoRef.current) return;

    // Capture frame
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const image = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const result = await api.detectItem(image);
      setDetectedLabel(result.label || 'Unknown Item');
      setDetectedProduct(result.product || null);
      setIsCameraOpen(false);

      if (!result.label && !result.product) {
        alert("No item detected clearly. Please try again.");
      }
    } catch (e) {
      console.error("Detection failed", e);
      alert("Backend error during detection.");
    }
  };

  const handleVerificationConfirm = (p: Product) => {
    setDetectedProduct(null);
    setDetectedLabel('');
    addToCart(p);
  }

  // --- CART LOGIC ---
  const addToCart = (product: Product) => {
    if (product.unit === UnitType.KG) {
      setWeightingProduct(product);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        unit: product.unit
      }];
    });
    setSearchQuery('');
  };

  const updateCartItem = (id: string, field: 'quantity' | 'totalPrice', value: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;

      if (field === 'quantity') {
        return {
          ...item,
          quantity: value,
          totalPrice: value * item.unitPrice
        };
      } else {
        // Edit Total Price -> Recalculate Quantity? Or just override Total?
        // Usually in POS, Price Override is changing Unit Price.
        // But user asked to "edit weight and price".
        // If we edit Total Price directly, we implies we are giving a discount/override.
        // Let's assume we update the Total Price and keep Quantity constant (changing effective unit price)
        // OR update Unit Price. 
        // Standard behavior: Edit Unit Price OR Quantity.
        // If user edits "Price", they usually mean the final price.
        // Let's implement updating TotalPrice directly, which implies an implied unit price change.
        return {
          ...item,
          totalPrice: value,
          unitPrice: value / item.quantity, // derived
          isEdited: true
        };
      }
    }));
  };

  const handleWeightConfirm = (weight: number) => {
    if (!weightingProduct) return;

    const product = weightingProduct;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + weight, totalPrice: (item.quantity + weight) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        quantity: weight,
        unitPrice: product.price,
        totalPrice: product.price * weight,
        unit: product.unit
      }];
    });
    setWeightingProduct(null);
    setSearchQuery('');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const sequence = (stats?.todayBillCount || 0) + 1;
    const receiptId = `${day}${month}${sequence.toString().padStart(3, '0')}`; // 7 digits for safety: DDMMSSS

    const tx: Transaction = {
      id: receiptId,
      timestamp: Date.now(),
      items: cart,
      total,
      // Removed generic customer placeholders as they are no longer displayed.
    };

    await api.saveTransaction(tx);
    await loadStats(); // Immediate update
    setLastTransaction(tx);
    setShowInvoice(true);
    setCart([]);
  };

  // --- VIEW RENDERERS ---

  const renderPOS = () => {
    const filteredProducts = inventory.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalPayable = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    return (
      <div className="flex h-full bg-slate-100 p-4 gap-4 overflow-hidden">

        {/* Left Column: Camera & Info */}
        <div className="w-[35%] flex flex-col gap-4 shrink-0">
          {/* Camera Preview */}
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center shadow-lg border border-slate-700">
            {isCameraOpen ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  LIVE VISION
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-[10px] font-bold bg-black/50 py-1 rounded-full px-3 inline-block">
                    Camera Active • Press <span className="text-blue-400 font-mono bg-white/20 px-1.5 rounded mx-1">SPACE</span> to Scan Item
                  </p>
                </div>
              </>
            ) : (
              <div className="text-slate-500 flex flex-col items-center p-8 text-center">
                <div className="p-4 bg-slate-800 rounded-full mb-3">
                  <Camera size={40} />
                </div>
                <h3 className="font-bold text-slate-400 text-lg">Camera Inactive</h3>
                <p className="text-xs mt-1 text-slate-600">Press <span className="bg-slate-700 px-1 py-0.5 rounded text-white font-mono">F1</span> to activate vision</p>
              </div>
            )}
          </div>

          {/* Dashboard Stats / History */}
          <div className="bg-white flex-1 rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
              <History size={20} className="text-blue-600" />
              Recent Activity
            </h3>

            <div className="mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bills Today</p>
                <p className="text-2xl font-bold text-slate-800">{stats?.todayBillCount || 0}</p>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Last 3 Transactions</p>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {stats?.recentHistory?.map(tx => (
                <div key={tx.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-colors">
                  <div>
                    <p className="font-bold text-slate-700 text-sm">₹{tx.total.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{formatTime(tx.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => { setLastTransaction(tx); setShowInvoice(true); }}
                    className="text-[10px] font-bold text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    RE-PRINT
                  </button>
                </div>
              ))}
              {(!stats?.recentHistory || stats.recentHistory.length === 0) && (
                <p className="text-center text-slate-300 py-10 text-xs italic">No recent history</p>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 text-center shrink-0">
              <p className="text-xs text-slate-400"></p>
              <div className="flex justify-center gap-4 mt-1">
                <p className="text-[10px] text-slate-400">Server: <span className="text-green-600 font-bold">Online</span></p>
                <p className="text-[10px] text-slate-400">YOLOv8: <span className="text-blue-600 font-bold">Ready</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search & Cart */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">

          {/* Search Bar - Visually Prominent */}
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-600 flex items-center gap-3 shrink-0 relative z-10">
            <Search className="text-blue-600" size={28} />
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                className="w-full text-xl font-medium placeholder:text-slate-300 focus:outline-none text-slate-800"
                placeholder="Scan or Search Product..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredProducts.length > 0) {
                    addToCart(filteredProducts[0]);
                  }
                }}
                autoFocus
              />
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No products found</div>
                  ) : (
                    filteredProducts.map(p => (
                      <div
                        key={p.id}
                        className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between border-b border-slate-50 last:border-0 items-center group"
                        onClick={() => addToCart(p)}
                      >
                        <div>
                          <div className="font-bold text-slate-800 text-lg group-hover:text-blue-700">{p.name}</div>
                        </div>
                        <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded group-hover:bg-white">
                          ₹{p.price.toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Container */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag size={18} className="text-slate-400" /> Current Cart
              </h3>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {cart.length} items
              </span>
            </div>

            {/* Cart List */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-500 uppercase bg-white sticky top-0 shadow-sm z-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium text-right">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">Price</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center flex flex-col items-center text-slate-400 italic">
                        <ShoppingBag size={48} className="mb-4 opacity-20" />
                        <p>Cart is empty</p>
                        <p className="text-xs mt-1">Use Search or F1 to Scan</p>
                      </td>
                    </tr>
                  )}
                  {cart.map(item => (
                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group" onDoubleClick={() => setEditingItemId(item.id)}>
                      <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">
                        {editingItemId === item.id ? (
                          <input
                            className="w-20 p-1 border rounded text-right"
                            type="number"
                            autoFocus
                            defaultValue={item.quantity}
                            onBlur={(e) => {
                              updateCartItem(item.id, 'quantity', parseFloat(e.target.value));
                              setEditingItemId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCartItem(item.id, 'quantity', parseFloat((e.target as HTMLInputElement).value));
                                setEditingItemId(null);
                              }
                            }}
                          />
                        ) : (
                          `${item.quantity.toFixed(3)} ${item.unit}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800 text-lg">
                        {editingItemId === item.id ? (
                          <input
                            className="w-24 p-1 border rounded text-right"
                            type="number"
                            defaultValue={item.totalPrice}
                            onBlur={(e) => {
                              updateCartItem(item.id, 'totalPrice', parseFloat(e.target.value));
                              setEditingItemId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCartItem(item.id, 'totalPrice', parseFloat((e.target as HTMLInputElement).value));
                                setEditingItemId(null);
                              }
                            }}
                          />
                        ) : (
                          `₹${item.totalPrice.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cart Footer / Checkout */}
            <div className="bg-slate-900 text-white p-6 shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1">Total Payable</div>
                  <div className="text-5xl font-bold tracking-tight">₹{totalPayable.toFixed(2)}</div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  CHECKOUT <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };





  return (
    <div className="h-screen flex flex-col font-sans bg-slate-100">
      <Navbar view={currentView} setView={setCurrentView} />

      <main className="flex-1 overflow-hidden">
        {currentView === 'pos' && renderPOS()}

        {currentView === 'item-master' && <ItemMaster inventory={inventory} onUpdate={loadInventory} />}
        {currentView === 'transactions' && (
          <TransactionsView
            onViewInvoice={(tx) => {
              setLastTransaction(tx);
              setShowInvoice(true);
            }}
          />
        )}
      </main>

      {lastTransaction && (
        <InvoiceModal
          isOpen={showInvoice}
          onClose={() => { setShowInvoice(false); window.location.reload(); }}
          transaction={lastTransaction}
        />
      )}

      {weightingProduct && (
        <ScaleModal
          isOpen={!!weightingProduct}
          product={weightingProduct}
          onConfirm={handleWeightConfirm}
          onClose={() => setWeightingProduct(null)}
        />
      )}

      {(detectedProduct || detectedLabel) && (
        <VisionModal
          isOpen={!!(detectedProduct || detectedLabel)}
          product={detectedProduct}
          detectedLabel={detectedLabel}
          inventory={inventory}
          onConfirm={handleVerificationConfirm}
          onClose={() => { setDetectedProduct(null); setDetectedLabel(''); }}
        />
      )}
    </div>
  );
};

export default App;