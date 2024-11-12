import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface StepComponentProps {
  onNext: () => void;
  onBack: () => void;
  isNextDisabled?: boolean;
}

export interface Step {
  title: string;
  description: string;
  component: (props: StepComponentProps) => ReactNode;
  isNextDisabled?: boolean;
}

interface BaseStepDialogProps {
  title: string;
  steps: Step[];
  onComplete: () => void;
  children: ReactNode;
  contentHeight?: string;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const StepCounter = ({
  currentStep,
  steps
}: {
  currentStep: number;
  steps: string[];
}) => {
  return (
    <div className="flex justify-between items-center w-full px-4 mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              index < currentStep
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
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

export function BaseStepDialog({
  title,
  steps,
  onComplete,
  children,
  contentHeight = '200px',
  currentStep,
  onStepChange
}: BaseStepDialogProps) {
  const [internalStep, setInternalStep] = useState(1);
  const step = currentStep ?? internalStep;

  const handleStepChange = (newStep: number) => {
    if (onStepChange) {
      onStepChange(newStep);
    } else {
      setInternalStep(newStep);
    }
  };

  const renderStepContent = () => {
    const currentStep = steps[step - 1];
    return currentStep.component({
      onNext: () => handleStepChange(step + 1),
      onBack: () => handleStepChange(step - 1),
      isNextDisabled: currentStep.isNextDisabled
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{steps[step - 1].description}</DialogDescription>
        </DialogHeader>
        <StepCounter currentStep={step} steps={steps.map((s) => s.title)} />
        <div className={`h-[${contentHeight}] flex items-center justify-center overflow-hidden`}>
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
            <Button variant="outline" onClick={() => handleStepChange(step - 1)}>
              Back
            </Button>
          )}
          {step < steps.length ? (
            <Button 
              onClick={() => handleStepChange(step + 1)}
              disabled={steps[step - 1].isNextDisabled}
            >
              Next
            </Button>
          ) : (
            <Button onClick={onComplete} disabled={steps[step - 1].isNextDisabled}>Confirm</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
