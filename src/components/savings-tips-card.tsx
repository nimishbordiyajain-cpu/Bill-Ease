'use client';

import React, { useState, useTransition } from 'react';
import { Lightbulb, Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSavingsTipsAction } from '@/app/actions';
import type { Bill } from '@/lib/types';

interface SavingsTipsCardProps {
  bills: Bill[];
  spendingLimit: number;
  setSpendingLimit: (limit: number) => void;
}

export function SavingsTipsCard({ bills, spendingLimit, setSpendingLimit }: SavingsTipsCardProps) {
  const [isPending, startTransition] = useTransition();
  const [tips, setTips] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleGenerateTips = () => {
    startTransition(async () => {
      setError('');
      setTips('');
      const result = await getSavingsTipsAction(bills, spendingLimit);
      if (result.tips) {
        setTips(result.tips);
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Smart Savings Tips</CardTitle>
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="spending-limit" className="text-xs">
              Monthly Spending Limit
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">₹</span>
              <Input
                id="spending-limit"
                type="number"
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>
          <Button onClick={handleGenerateTips} disabled={isPending} className="w-full">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Get AI Tips
          </Button>

          {isPending && (
             <div className="space-y-2 pt-2">
              <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded-full w-full animate-pulse"></div>
              <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse"></div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {tips && (
             <Alert>
              <Wand2 className="h-4 w-4" />
              <AlertTitle>Your Personalized Tips!</AlertTitle>
              <AlertDescription>
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: tips.replace(/\*/g, '•').replace(/\n/g, '<br/>') }}/>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
