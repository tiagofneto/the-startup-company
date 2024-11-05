'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { createStream, transferTokens } from "@/services/api";
import { BaseStepDialog, Step } from "../../../components/base-step-dialog";
import { Label } from "@/components/ui/label";

const sendMoney = async (handle: string, recipient: string, amount: number, isAztecAddress: boolean, paymentType: 'Wire' | 'Stream') => {
  if (paymentType === 'Wire') { 
    await transferTokens(handle, recipient, amount, isAztecAddress);
  } else {
    await createStream(recipient, handle, amount);
  }
};

export function SendMoneyDialog({ handle, children }: { handle: string; children: ReactNode }) {
  const [paymentType, setPaymentType] = useState<'Wire' | 'Stream' | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('company');

  const queryClient = useQueryClient();

  const sendMoneyMutation = useMutation({
    mutationFn: () => sendMoney(handle, recipient, parseFloat(amount), activeTab === 'aztec', paymentType!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', handle] });
      if (activeTab === 'company') {
        queryClient.invalidateQueries({ queryKey: ['balance', recipient] });
      }
    },
  });

  const steps: Step[] = [
    {
      title: 'Payment Type',
      description: 'Select the payment type to begin the transfer process.',
      component: ({ onNext }) => (
        <div className="flex justify-center space-x-4">
          <Button onClick={() => { setPaymentType('Wire'); onNext(); }} variant="default">Wire</Button>
          <Button onClick={() => { setPaymentType('Stream'); onNext(); }} variant="outline">Stream</Button>
        </div>
      ),
    },
    {
      title: 'Recipient',
      description: 'Enter the recipient details and amount to send money.',
      component: ({ onNext }) => (
        <>
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
          </>
      ),
    },
    {
      title: 'Confirmation',
      description: 'Review and confirm your transfer details.',
      component: ({ onNext }) => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Confirm Transfer Details</h3>
            <p><strong>Payment Type:</strong> {paymentType}</p>
            <p><strong>Recipient:</strong> {recipient}</p>
            <p><strong>Amount:</strong> {amount}</p>
            <p><strong>Transfer Method:</strong> {activeTab === 'company' ? 'Company Handle' : 'Aztec Address'}</p>
          </div>
      ),
    }
  ];

  return (
    <BaseStepDialog
      title="Send Money"
      steps={steps}
      onComplete={() => sendMoneyMutation.mutate()}
    >
      {children}
    </BaseStepDialog>
  );
}