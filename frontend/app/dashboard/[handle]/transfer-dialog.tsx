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
import { createStream, transferTokens } from '@/services/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const sendMoney = async (handle: string, recipient: string, amount: number, isAztecAddress: boolean, paymentType: 'Wire' | 'Stream') => {
  if (paymentType === 'Wire') { 
    await transferTokens(handle, recipient, amount, isAztecAddress);
  } else {
    await createStream(recipient, handle, amount);
  }
};

const StepCounter = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Payment Type', 'Recipient', 'Confirmation'];

  return (
    <div className="flex justify-between items-center w-full px-4 mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              index < currentStep ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}
          >
            {index + 1}
          </div>
          <span className="text-xs mt-1">{step}</span>
        </div>
      ))}
    </div>
  );
};

export function SendMoneyDialog({ handle, children }: { handle: string; children: ReactNode }) {
  const [step, setStep] = useState(1);
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

  const handleSendMoney = () => {
    if (recipient && amount && paymentType) {
      sendMoneyMutation.mutate();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex justify-center space-x-4">
            <Button onClick={() => { setPaymentType('Wire'); setStep(2); }} variant={paymentType === 'Wire' ? 'default' : 'outline'}>
              Wire
            </Button>
            <Button onClick={() => { setPaymentType('Stream'); setStep(2); }} variant={paymentType === 'Stream' ? 'default' : 'outline'}>
              Stream
            </Button>
          </div>
        );
      case 2:
        return (
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
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Confirm Transfer Details</h3>
            <p><strong>Payment Type:</strong> {paymentType}</p>
            <p><strong>Recipient:</strong> {recipient}</p>
            <p><strong>Amount:</strong> {amount}</p>
            <p><strong>Transfer Method:</strong> {activeTab === 'company' ? 'Company Handle' : 'Aztec Address'}</p>
          </div>
        );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            {step === 1 && "Select the payment type to begin the transfer process."}
            {step === 2 && "Enter the recipient details and amount to send money."}
            {step === 3 && "Review and confirm your transfer details."}
          </DialogDescription>
        </DialogHeader>
        <StepCounter currentStep={step} />
        <div className="h-[200px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 2 && (!recipient || !amount)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSendMoney} disabled={!recipient || !amount || !paymentType}>
              Confirm Transfer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}