import { ReactNode, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fundCompany } from '@/services/api';

export function FundDialog({ children, handle, totalShares, mintedShares }: { children: ReactNode; handle: string; totalShares?: number; mintedShares?: number }) {
  const [fundingAmount, setFundingAmount] = useState('');

  const queryClient = useQueryClient();

  const fundCompanyMutation = useMutation({
    mutationFn: (amount: number) => fundCompany(handle, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', handle] });
      queryClient.invalidateQueries({ queryKey: ['shareholders', handle] });
    }
  });

  const handleFundCompany = () => {
    const amount = parseInt(fundingAmount);
    if (!isNaN(amount) && amount > 0) {
      fundCompanyMutation.mutate(amount);
      setFundingAmount('');
    }
  };

  const setPresetAmount = (amount: number) => {
    setFundingAmount(amount.toString());
  };

  const setPercentageAmount = (percentage: number) => {
    const amount = Math.round((percentage / 100) * totalShares!);
    setFundingAmount(amount.toString());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fund the Company</DialogTitle>
          <DialogDescription>
            Specify the funding amount you wish to contribute to the company. $1 = 1 share.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="flex col-span-3">
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
              />
              <Button 
                variant="outline" 
                className="ml-2"
                onClick={() => setPresetAmount(totalShares! - mintedShares!)}
              >
                Remaining
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => setPresetAmount(1000)}>1,000</Button>
            <Button variant="outline" onClick={() => setPresetAmount(10000)}>10,000</Button>
            <Button variant="outline" onClick={() => setPresetAmount(1000000)}>1,000,000</Button>
          </div>
          {totalShares && (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => setPercentageAmount(10)}>10%</Button>
              <Button variant="secondary" onClick={() => setPercentageAmount(25)}>25%</Button>
              <Button variant="secondary" onClick={() => setPercentageAmount(50)}>50%</Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleFundCompany}>Buy Shares</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}