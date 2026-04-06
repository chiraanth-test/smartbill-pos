export enum UnitType {
  KG = 'kg',
  UNIT = 'unit',
}

export enum AppMode {
  MANUAL = 'manual',
  AUTO = 'auto',
}

export enum LogType {
  DETECTED = 'detected',
  CONFIRMED = 'confirmed',
  FLAGGED = 'flagged',
  REMOVED = 'removed',
  UNDO = 'undo',
  EDITED = 'edited',
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: UnitType;
  category: string;
  expectedWeightRange?: number[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: UnitType;
  isEdited?: boolean;
  isManual?: boolean;
}

export interface Customer {
  phone: string;
  name?: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  customer?: Customer;
  hasAnomalies?: boolean;
}

export interface VisionResult {
  product: Product;
  confidence: number;
}

export interface SessionLog {
  id: string;
  type: LogType;
  message: string;
  timestamp: number;
  anomalyReason?: string;
}

export interface TrainingLog {
  timestamp: number;
  detectedItemName: string;
  finalItemName: string;
  confidence: number;
  isCorrected: boolean;
}

export interface Stats {
  todayBillCount: number;
  todayTotalSales: number;
  recentHistory: Transaction[];
  totalCustomers: number;
}