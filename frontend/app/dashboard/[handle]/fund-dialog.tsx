import { ReactNode, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';

async function fundCompany(amount: number) {
  console.log('Funding company', amount);
}

export function FundDialog({ children }: { children: ReactNode }) {
  const [fundingAmount, setFundingAmount] = useState('');

  const fundCompanyMutation = useMutation({
    mutationFn: (amount: number) => fundCompany(amount),
  });

  const handleFundCompany = () => {
    const amount = parseInt(fundingAmount);
    if (!isNaN(amount) && amount > 0) {
      fundCompanyMutation.mutate(amount);
      setFundingAmount('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fund the Company</DialogTitle>
          <DialogDescription>
            Enter the amount of shares you want to buy. 1 share = $1
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shares" className="text-right">
            Shares
          </Label>
            <Input
              id="shares"
              type="number"
              className="col-span-3"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleFundCompany}>Buy Shares</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
