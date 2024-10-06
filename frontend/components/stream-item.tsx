import React from 'react';
import { BorderBeam } from '@/components/ui/border-beam';
import { cn } from '@/lib/utils'; // Assuming you have a utility function for class names

interface StreamItemProps {
  rate: number;
  variant?: 'default' | 'compact';
  className?: string;
}

export const StreamItem: React.FC<StreamItemProps> = ({ 
  rate, 
  variant = 'default',
  className
}) => {
  const isCompact = variant === 'compact';

  return (
    <li className={cn(
      "relative flex justify-between items-center p-2 rounded-md",
      isCompact ? "bg-muted" : "bg-background",
      className
    )}>
      <span className={cn(
        "font-medium",
        isCompact ? "" : "text-sm"
      )}>${rate.toFixed(2)}</span>
      <span className={cn(
        "text-muted-foreground",
        isCompact ? "text-sm" : "text-xs"
      )}>per month</span>
      <BorderBeam 
        size={isCompact ? 75 : 50} 
        duration={5} 
        colorFrom='#000' 
        colorTo='#fff'
      />
    </li>
  );
};