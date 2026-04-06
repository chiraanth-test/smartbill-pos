import { Product, Transaction, Stats } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  detectItem: async (image: string): Promise<{ product: Product | null, label?: string, confidence?: number }> => {
    const res = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });
    return await res.json();
  },

  fetchStats: async (): Promise<Stats> => {
    const res = await fetch(`${API_BASE_URL}/stats`);
    return await res.json();
  },
  fetchInventory: async (): Promise<Product[]> => {
    const res = await fetch(`${API_BASE_URL}/products`);
    return await res.json();
  },

  saveProduct: async (product: Product): Promise<void> => {
    await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
  },

  saveTransaction: async (transaction: Transaction): Promise<void> => {
    await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
  },

  fetchTransactions: async (date?: string): Promise<Transaction[]> => {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE_URL}/transactions${query}`);
    return await res.json();
  }
};