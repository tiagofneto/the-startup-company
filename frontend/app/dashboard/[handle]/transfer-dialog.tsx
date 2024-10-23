'use client';

import { ReactNode, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { transferTokens } from '@/services/api';

const sendMoney = async (handle: string, recipient: string, amount: number, isAztecAddress: boolean) => {
  await transferTokens(handle, recipient, amount, isAztecAddress);
};

export function SendMoneyDialog({ handle, children }: { handle: string; children: ReactNode }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('company');

  const queryClient = useQueryClient();

  const sendMoneyMutation = useMutation({
    mutationFn: () => sendMoney(handle, recipient, parseFloat(amount), activeTab === 'aztec'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', handle] });
      if (activeTab === 'company') {
        queryClient.invalidateQueries({ queryKey: ['balance', recipient] });
      }
    },
  });

  const handleSendMoney = () => {
    if (recipient && amount) {
      sendMoneyMutation.mutate();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            Enter the recipient details and amount to send money.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="company" onValueChange={(value: string) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company">Company Handle</TabsTrigger>
            <TabsTrigger value="aztec">Aztec Address</TabsTrigger>
          </TabsList>
          <TabsContent value="company">
            <div className="grid gap-2 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company-handle" className="text-right">
                  Handle
                </Label>
                <Input
                  id="company-handle"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter company handle"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="aztec">
            <div className="grid gap-2 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="aztec-address" className="text-right">
                  Address
                </Label>
                <Input
                  id="aztec-address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter Aztec address"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="grid gap-2 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="Enter amount"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSendMoney} disabled={!recipient || !amount}>
            Send Money
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
