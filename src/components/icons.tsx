import React from 'react';
import { Home, Zap, Car, ShoppingCart, Clapperboard, HeartPulse, HelpCircle } from 'lucide-react';
import type { BillCategory } from '@/lib/types';

export const categoryIcons: Record<BillCategory, React.ElementType> = {
  housing: Home,
  utilities: Zap,
  transportation: Car,
  groceries: ShoppingCart,
  entertainment: Clapperboard,
  health: HeartPulse,
  other: HelpCircle,
};

export const categoryLabels: Record<BillCategory, string> = {
  housing: 'Housing',
  utilities: 'Utilities',
  transportation: 'Transportation',
  groceries: 'Groceries',
  entertainment: 'Entertainment',
  health: 'Health',
  other: 'Other',
};
