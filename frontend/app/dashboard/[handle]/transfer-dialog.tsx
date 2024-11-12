'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { createStream, transferTokens } from '@/services/api';
import { BaseStepDialog, Step } from '../../../components/base-step-dialog';
import { Label } from '@/components/ui/label';

const sendMoney = async (
  handle: string,
  recipient: string,
  amount: number,
  description: string,
  isAztecAddress: boolean,
  paymentType: 'Wire' | 'Stream'
) => {
  if (paymentType === 'Wire') {
    await transferTokens(handle, recipient, amount, description, isAztecAddress);
  } else {
    await createStream(recipient, handle, amount);
  }
};

export function SendMoneyDialog({
  handle,
  children
}: {
  handle: string;
  children: ReactNode;
}) {
  const [paymentType, setPaymentType] = useState<'Wire' | 'Stream' | null>(
    null
  );
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const queryClient = useQueryClient();

  const sendMoneyMutation = useMutation({
    mutationFn: () =>
      sendMoney(
        handle,
        recipient,
        parseFloat(amount),
        description,
        false,
        paymentType!
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', handle] });
      queryClient.invalidateQueries({ queryKey: ['balance', recipient] });
      queryClient.invalidateQueries({ queryKey: ['payments', handle] });
    }
  });

  const steps: Step[] = [
    {
      title: 'Payment Type',
      description: 'Select the payment type to begin the transfer process.',
      component: ({ onNext }) => (
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => {
              setPaymentType('Wire');
              onNext();
              setCurrentStep(2);
            }}
            variant="default"
          >
            Wire
          </Button>
          <Button
            onClick={() => {
              setPaymentType('Stream');
              onNext();
              setCurrentStep(2);
            }}
            variant="outline"
          >
            Stream
          </Button>
        </div>
      ),
      isNextDisabled: !paymentType
    },
    {
      title: 'Recipient',
      description: 'Enter the recipient details and amount to send money.',
      component: ({ onNext }) => (
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="handle" className="text-right">
              Handle
            </Label>
            <Input
              id="handle"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="col-span-3"
              placeholder="Enter recipient handle"
            />
          </div>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter payment description"
            />
          </div>
        </div>
      ),
      isNextDisabled: !recipient || !amount || !description
    },
    {
      title: 'Confirmation',
      description: 'Review and confirm your transfer details.',
      component: ({ onNext }) => (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Summary</h3>
          <p>
            <strong>Payment Type:</strong> {paymentType}
          </p>
          <p>
            <strong>Recipient:</strong> {recipient}
          </p>
          <p>
            <strong>Amount:</strong> {amount}$
          </p>
          <p>
            <strong>Description:</strong> {description}
          </p>
        </div>
      ),
      isNextDisabled: !recipient || !amount || !description || !paymentType
    }
  ];

  return (
    <BaseStepDialog
      title="Send Money"
      steps={steps}
      onComplete={() => sendMoneyMutation.mutate()}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
    >
      {children}
    </BaseStepDialog>
  );
}
