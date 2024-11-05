'use client'

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BaseStepDialog, Step } from "@/components/base-step-dialog"
import { Separator } from "@/components/ui/separator"
import { Users } from "lucide-react"

interface Cofounder {
  handle: string
  equity: number
}

interface FundDialogProps {
  handle: string
  companyName: string
  cofounders: string[]
  currentCofounder: string
  children: React.ReactNode
}

export function FundDialog({
  handle,
  companyName,
  cofounders,
  currentCofounder,
  children,
}: FundDialogProps) {
  const [totalCapital, setTotalCapital] = useState('200')
  const [equitySplit, setEquitySplit] = useState<Cofounder[]>(
    cofounders.map(handle => ({ handle, equity: 100 / cofounders.length }))
  )

  const queryClient = useQueryClient()

  const fundMutation = useMutation({
    mutationFn: () => {
      // Implement your fund API call here
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', handle] })
    },
  })

  const steps: Step[] = [
    {
      title: 'Cofounders',
      description: 'Review the list of cofounders.',
      component: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {cofounders.map((cofounder) => (
              <Card key={cofounder}>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-medium">{cofounder}</span>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Funding</h3>
            <p className="text-muted-foreground">
              You are about to purchase your shares of {companyName}. 
              The capital you use to buy your shares will fund {companyName}'s bank account.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Equity Split',
      description: 'Review or adjust the equity split between cofounders.',
      component: () => (
        <div className="space-y-6">
          {equitySplit.map((cofounder, index) => (
            <div key={cofounder.handle} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{cofounder.handle}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={cofounder.equity}
                    onChange={(e) => {
                      const newEquitySplit = [...equitySplit]
                      newEquitySplit[index].equity = Number(e.target.value)
                      setEquitySplit(newEquitySplit)
                    }}
                    className="w-24 pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              <Progress value={cofounder.equity} className="h-2" />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Total Capital',
      description: 'Set the total capital contribution.',
      component: () => (
        <div className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="total-capital">Total Capital ($)</Label>
            <Input
              id="total-capital"
              type="number"
              value={totalCapital}
              onChange={(e) => setTotalCapital(e.target.value)}
              className="text-lg"
            />
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold">Individual Contributions:</h3>
            {equitySplit.map((cofounder) => (
              <div key={cofounder.handle} className="flex justify-between items-center">
                <span>{cofounder.handle}</span>
                <span className="font-medium">
                  ${(parseFloat(totalCapital) * (cofounder.equity / 100)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Payment',
      description: 'Review and complete your share purchase.',
      component: () => {
        const cofounderEquity = equitySplit.find(c => c.handle === currentCofounder)?.equity || 0
        const contribution = (parseFloat(totalCapital) * (cofounderEquity / 100)).toFixed(2)
        
        return (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Payment Summary</h3>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Your equity:</span>
                  <span className="font-medium">{cofounderEquity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Your contribution:</span>
                  <span className="font-medium">${contribution}</span>
                </div>
              </div>
              <Separator />
              <Button className="w-full" onClick={() => fundMutation.mutate()}>
                Complete Purchase
              </Button>
            </CardContent>
          </Card>
        )
      },
    }
  ]

  return (
    <BaseStepDialog
      title="Fund Company"
      steps={steps}
      onComplete={() => fundMutation.mutate()}
    >
      {children}
    </BaseStepDialog>
  )
}