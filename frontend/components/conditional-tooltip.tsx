'use client'

import * as React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ConditionalTooltipWrapperProps {
  children: React.ReactElement
  isDisabled: boolean
  tooltipContent: React.ReactNode
  className?: string
}

export default function ConditionalTooltipWrapper({
  children,
  isDisabled,
  tooltipContent,
  className = "",
}: ConditionalTooltipWrapperProps) {
  const buttonElement = React.cloneElement(children, {
    disabled: isDisabled,
    className: `transition-all duration-200 ${children.props.className || ''} ${className}`.trim()
  })

  const wrappedButton = (
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-transparent" />
      {buttonElement}
    </div>
  )

  if (isDisabled) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {wrappedButton}
          </TooltipTrigger>
          <TooltipContent className="bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return buttonElement
}