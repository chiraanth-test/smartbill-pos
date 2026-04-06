import { MOCK_INVENTORY } from '../constants';
import { VisionResult } from '../types';

// Simulates a scale reading that fluctuates slightly
export const getMockScaleWeight = (baseWeight: number): number => {
  const noise = (Math.random() - 0.5) * 0.005; // +/- 5g noise
  return Math.max(0, parseFloat((baseWeight + noise).toFixed(3)));
};

// Simulates a camera detection
export const getMockVisionDetection = (): VisionResult | null => {
  if (Math.random() > 0.7) return null; // 30% chance of no detection
  
  const product = MOCK_INVENTORY[Math.floor(Math.random() * MOCK_INVENTORY.length)];
  const confidence = 0.55 + (Math.random() * 0.44); // 0.55 to 0.99
  
  return {
    product,
    confidence
  };
};