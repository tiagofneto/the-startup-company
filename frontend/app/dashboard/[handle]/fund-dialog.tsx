'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BaseStepDialog, Step } from '@/components/base-step-dialog';
import { Separator } from '@/components/ui/separator';
import { issueShares } from '@/services/api';
import { CheckCircle } from 'lucide-react';

interface Cofounder {
  email: string;
  equity: number;
}

interface FundDialogProps {
  handle: string;
  companyName: string;
  cofounders: { email: string; name: string }[];
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
    cofounders.map((cofounder) => ({ email: cofounder.email, equity: 100 / cofounders.length }))
  );

  const queryClient = useQueryClient();

  const fundMutation = useMutation({
    mutationFn: () =>
      issueShares(handle, parseFloat(totalCapital), equitySplit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', handle] });
      queryClient.invalidateQueries({ queryKey: ['shareholders', handle] });
    }
  });

  const steps: Step[] = [
    {
      title: 'Introduction',
      description: 'Learn about funding your company.',
      component: () => (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to issue and fund the ordinary shares in {companyName}.
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
                <Label className="text-sm">{cofounders[index].name || cofounder.email}</Label>
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
          {fundMutation.isSuccess ? (
            <div className="text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-2 pb-4">
              <CheckCircle className="w-5 h-5" />
              Funding complete
            </div>
          ) : (
            <>
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
            </>
          )}
          {fundMutation.isPending && (
            <div className="flex items-center gap-2 justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 dark:border-gray-100 border-t-transparent" />
              <div>Processing funding...</div>
            </div>
          )}
        </div>
      ),
      isNextDisabled: !totalCapital || parseFloat(totalCapital) <= 0 || fundMutation.isPending
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
