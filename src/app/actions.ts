'use server';

import { generateSavingTips } from '@/ai/flows/generate-saving-tips';
import type { Bill } from '@/lib/types';

export async function getSavingsTipsAction(
  bills: Bill[],
  spendingLimit: number
): Promise<{ tips: string } | { error: string }> {
  try {
    const currentSpending = bills
      .filter(bill => !bill.isPaid)
      .reduce((sum, bill) => sum + bill.amount, 0);

    const expenseData = JSON.stringify(
      bills.map(b => ({
        category: b.category,
        amount: b.amount,
        description: b.description,
      })),
      null,
      2
    );

    const result = await generateSavingTips({
      expenseData,
      spendingLimit,
      currentSpending,
    });
    
    return { tips: result.savingsTips };

  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to generate savings tips.' };
  }
}
