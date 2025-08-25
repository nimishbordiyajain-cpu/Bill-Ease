'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  DollarSign,
  PlusCircle,
  CalendarDays,
  ListFilter,
  ArrowUpDown,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BillForm } from '@/components/bill-form';
import type { Bill, BillCategory } from '@/lib/types';
import { SavingsTipsCard } from '@/components/savings-tips-card';
import { categoryIcons } from '@/components/icons';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const initialBills: Bill[] = [
  {
    id: '1',
    description: 'Netflix Subscription',
    amount: 15.49,
    dueDate: new Date(2024, 6, 20),
    category: 'entertainment',
    isPaid: true,
    reminders: true,
  },
  {
    id: '2',
    description: 'Electricity Bill',
    amount: 75.2,
    dueDate: new Date(2024, 6, 25),
    category: 'utilities',
    isPaid: false,
    reminders: true,
  },
  {
    id: '3',
    description: 'Car Payment',
    amount: 350.0,
    dueDate: new Date(2024, 7, 1),
    category: 'transportation',
    isPaid: false,
    reminders: true,
  },
  {
    id: '4',
    description: 'Groceries',
    amount: 120.55,
    dueDate: new Date(2024, 6, 15),
    category: 'groceries',
    isPaid: true,
    reminders: false,
  },
    {
    id: '5',
    description: 'Internet Bill',
    amount: 60.0,
    dueDate: new Date(2024, 6, 28),
    category: 'housing',
    isPaid: false,
    reminders: true,
  },
];

type SortOption = 'dueDate' | 'amount' | 'category';

export default function Home() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | undefined>(undefined);
  const [sortOption, setSortOption] = useState<SortOption>('dueDate');
  const [spendingLimit, setSpendingLimit] = useState(1000);
  const { toast } = useToast();

  const handleAddBill = (bill: Omit<Bill, 'id'>) => {
    setBills([...bills, { ...bill, id: new Date().toISOString() }]);
  };

  const handleUpdateBill = (updatedBill: Bill) => {
    setBills(bills.map((b) => (b.id === updatedBill.id ? updatedBill : b)));
    setEditingBill(undefined);
  };
  
  const handleDeleteBill = (id: string) => {
    setBills(bills.filter((b) => b.id !== id));
  };
  
  const handleTogglePaid = (id: string) => {
    setBills(bills.map((b) => (b.id === id ? { ...b, isPaid: !b.isPaid } : b)));
  };
  
  const handleToggleReminder = (id: string, newReminderState: boolean) => {
    const bill = bills.find(b => b.id === id);
    if(bill) {
      setBills(bills.map((b) => (b.id === id ? { ...b, reminders: newReminderState } : b)));
      toast({
        title: `Reminders ${newReminderState ? 'Enabled' : 'Disabled'}`,
        description: `You will ${newReminderState ? '' : 'no longer '}receive reminders for ${bill.description}.`,
      });
    }
  };

  const openEditForm = (bill: Bill) => {
    setEditingBill(bill);
    setFormOpen(true);
  };

  const openNewForm = () => {
    setEditingBill(undefined);
    setFormOpen(true);
  };

  const { totalExpenses, upcomingBillsCount, overdueBillsCount } = useMemo(() => {
    const now = new Date();
    return {
      totalExpenses: bills
        .filter((b) => !b.isPaid)
        .reduce((acc, bill) => acc + bill.amount, 0),
      upcomingBillsCount: bills.filter((b) => !b.isPaid && !isPast(b.dueDate)).length,
      overdueBillsCount: bills.filter((b) => !b.isPaid && isPast(b.dueDate) && !isToday(b.dueDate)).length,
    };
  }, [bills]);

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => {
      if (a.isPaid && !b.isPaid) return 1;
      if (!a.isPaid && b.isPaid) return -1;
      switch (sortOption) {
        case 'dueDate':
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }, [bills, sortOption]);

  const BillCard = React.memo(({ bill }: { bill: Bill }) => {
    const CategoryIcon = categoryIcons[bill.category];
    const daysUntilDue = differenceInDays(bill.dueDate, new Date());
    const isOverdue = !bill.isPaid && isPast(bill.dueDate) && !isToday(bill.dueDate);
    const isDueSoon = !isOverdue && !bill.isPaid && daysUntilDue >= 0 && daysUntilDue <= 3;

    const dueDateText = isOverdue
      ? `Overdue by ${Math.abs(daysUntilDue)} days`
      : isToday(bill.dueDate)
      ? 'Due today'
      : `Due in ${daysUntilDue + 1} days`;

    return (
      <Card className={cn('transition-all duration-300', bill.isPaid ? 'bg-muted/50 opacity-70' : 'bg-card')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CategoryIcon className="w-4 h-4 text-muted-foreground" />
            <span className={cn(bill.isPaid && 'line-through')}>{bill.description}</span>
          </CardTitle>
          <span className="text-lg font-bold">
            ${bill.amount.toFixed(2)}
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
             <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium',
                isOverdue ? 'text-destructive-foreground bg-destructive/80' : 
                isDueSoon ? 'text-amber-800 bg-amber-100' : 'text-foreground'
              )}
            >
              <CalendarDays className="w-3 h-3" />
              {format(bill.dueDate, 'MMM d, yyyy')} ({dueDateText})
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <ListFilter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleTogglePaid(bill.id)}>
                  {bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleReminder(bill.id, !bill.reminders)}>
                  {bill.reminders ? 'Disable Reminders' : 'Enable Reminders'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditForm(bill)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteBill(bill.id)} className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  });
  BillCard.displayName = 'BillCard';


  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">BillEase</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button onClick={openNewForm} className="shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bills</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBillsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <CalendarDays className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueBillsCount}</div>
            </CardContent>
          </Card>
          <SavingsTipsCard
            bills={bills}
            spendingLimit={spendingLimit}
            setSpendingLimit={setSpendingLimit}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Bills</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Sort by: {sortOption}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOption('dueDate')}>Due Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('amount')}>Amount</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('category')}>Category</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {sortedBills.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        ) : (
          <Card className="col-span-full flex flex-col items-center justify-center p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Bills Yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first bill.</p>
            <Button onClick={openNewForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Bill
            </Button>
          </Card>
        )}
      </main>

      <BillForm
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSubmit={editingBill ? handleUpdateBill : handleAddBill}
        bill={editingBill}
      />
    </div>
  );
}
