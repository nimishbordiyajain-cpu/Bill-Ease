export type BillCategory = 'housing' | 'utilities' | 'transportation' | 'groceries' | 'entertainment' | 'health' | 'other';

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  category: BillCategory;
  isPaid: boolean;
  reminders: boolean;
}
