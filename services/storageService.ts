import { Transaction, TrainingLog } from '../types';

const STORAGE_KEY_TRANSACTIONS = 'sb_transactions';
const STORAGE_KEY_TRAINING = 'sb_training_logs';

// --- TRANSACTIONS ---

export const saveTransaction = (transaction: Transaction): void => {
  try {
    const existing = getTransactions();
    const updated = [transaction, ...existing];
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save transaction", error);
  }
};

export const getTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load transactions", error);
    return [];
  }
};

export const clearTransactions = (): void => {
  localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
};

// --- TRAINING DATA ---

export const saveTrainingLog = (log: TrainingLog): void => {
    try {
        const existing = getTrainingLogs();
        const updated = [...existing, log];
        localStorage.setItem(STORAGE_KEY_TRAINING, JSON.stringify(updated));
    } catch (error) {
        console.error("Failed to save training log", error);
    }
};

export const getTrainingLogs = (): TrainingLog[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_TRAINING);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
};

// --- UTILS ---

export const exportTrainingDataCSV = (): void => {
    const logs = getTrainingLogs();
    if (logs.length === 0) {
        alert("No training data to export.");
        return;
    }

    const headers = ['Timestamp', 'DetectedItem', 'FinalItem', 'Confidence', 'IsCorrected'];
    const rows = logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.detectedItemName,
        log.finalItemName,
        log.confidence.toFixed(4),
        log.isCorrected ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `training_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};