'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BaseStepDialog, Step } from '@/components/base-step-dialog';
import { Separator } from '@/components/ui/separator';
import { issueShares } from '@/services/api';

interface Cofounder {
  email: string;
  equity: number;
}

interface FundDialogProps {
  handle: string;
  companyName: string;
  cofounders: string[];
  currentCofounder: string;
  children: React.ReactNode;
}

export function FundDialog({
  handle,
  companyName,
  cofounders,
  children
}: FundDialogProps) {
  const [totalCapital, setTotalCapital] = useState('200');
  const [equitySplit, setEquitySplit] = useState<Cofounder[]>(
    cofounders.map((email) => ({ email, equity: 100 / cofounders.length }))
  );

  const queryClient = useQueryClient();

  const fundMutation = useMutation({
    mutationFn: () =>
      issueShares(handle, parseFloat(totalCapital), equitySplit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', handle] });
    }
  });

  const steps: Step[] = [
    {
      title: 'Introduction',
      description: 'Learn about funding your company.',
      component: () => (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to purchase your shares of {companyName}. The capital
            you use to buy your shares will fund {companyName}'s bank account.
          </p>
        </div>
      )
    },
    {
      title: 'Equity Split',
      description: 'Review or adjust the equity split.',
      component: () => (
        <div className="space-y-4">
          {equitySplit.map((cofounder, index) => (
            <div key={cofounder.email} className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm">{cofounder.email}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={cofounder.equity}
                    onChange={(e) => {
                      const newEquitySplit = [...equitySplit];
                      newEquitySplit[index].equity = Number(e.target.value);
                      setEquitySplit(newEquitySplit);
                    }}
                    className="w-20 h-8 text-sm pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </div>
              <Progress value={cofounder.equity} className="h-1" />
            </div>
          ))}
        </div>
      ),
      isNextDisabled: equitySplit.reduce((sum, cofounder) => sum + cofounder.equity, 0) !== 100
    },
    {
      title: 'Total Capital',
      description: 'Set the total capital contribution.',
      component: () => (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="total-capital" className="text-sm">
              Total Capital ($)
            </Label>
            <Input
              id="total-capital"
              type="number"
              value={totalCapital}
              onChange={(e) => setTotalCapital(e.target.value)}
              className="text-sm"
            />
          </div>
          <Separator className="my-2" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Individual Contributions:</h3>
            {equitySplit.map((cofounder) => (
              <div
                key={cofounder.email}
                className="flex justify-between items-center text-sm"
              >
                <span>{cofounder.email}</span>
                <span className="font-medium">
                  $
                  {(
                    parseFloat(totalCapital) *
                    (cofounder.equity / 100)
                  ).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
      isNextDisabled: !totalCapital || parseFloat(totalCapital) <= 0
    }
  ];

  return (
    <BaseStepDialog
      title="Fund Company"
      steps={steps}
      onComplete={() => fundMutation.mutate()}
    >
      {children}
    </BaseStepDialog>
  );
}
