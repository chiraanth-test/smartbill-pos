import { Product, UnitType } from './types';

export const MOCK_INVENTORY: Product[] = [
  { id: 'p1', name: 'Red Apple', price: 4.50, unit: UnitType.KG, category: 'Fruits', expectedWeightRange: [0.1, 0.3] },
  { id: 'p2', name: 'Banana', price: 1.20, unit: UnitType.KG, category: 'Fruits' },
  { id: 'p3', name: 'Sourdough Bread', price: 3.50, unit: UnitType.UNIT, category: 'Bakery' },
  { id: 'p4', name: 'Organic Milk 1L', price: 2.10, unit: UnitType.UNIT, category: 'Dairy' },
  { id: 'p5', name: 'Carrot', price: 0.80, unit: UnitType.KG, category: 'Vegetables' },
  { id: 'p6', name: 'Chicken Breast', price: 8.90, unit: UnitType.KG, category: 'Meat' },
  { id: 'p7', name: 'Orange Juice', price: 4.00, unit: UnitType.UNIT, category: 'Beverages' },
  { id: 'p8', name: 'Avocado', price: 1.50, unit: UnitType.UNIT, category: 'Fruits' },
];

export const ANOMALY_THRESHOLDS = {
  PRICE_OVERRIDE_PERCENT: 0.20, // 20% difference triggers flag
  LOW_CONFIDENCE: 0.65, // Below 65% triggers warning
  MAX_UNDO_PER_SESSION: 3,
};

export const MOCK_CUSTOMERS = [
  { phone: '555-0101', name: 'Alice Smith' },
  { phone: '555-0102', name: 'Bob Jones' },
];