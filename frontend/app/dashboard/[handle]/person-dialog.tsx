'use client'

import { useState, ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { computeAvatarFallback } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, PlusCircle } from 'lucide-react'

// Dummy functions for money streams
const getMoneyStreams = async (personId: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return [
    { id: '1', monthlyRate: 1000 },
    { id: '2', monthlyRate: 1500 },
  ]
}

const createMoneyStream = async (personId: string, monthlyRate: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return { id: Date.now().toString(), monthlyRate }
}

interface PersonDialogProps {
  person: {
    id: string;
    name: string;
    email: string;
    picture: string;
    kyc_verified: boolean;
  };
  children: ReactNode;
}

export function PersonDialog({ person, children }: PersonDialogProps) {
  const [newStreamMonthlyRate, setNewStreamMonthlyRate] = useState('')

  const queryClient = useQueryClient()

  const streamsQuery = useQuery({
    queryKey: ['streams', person.id],
    queryFn: () => getMoneyStreams(person.id),
  })

  const addStreamMutation = useMutation({
    mutationFn: ({ personId, monthlyRate }: { personId: string, monthlyRate: number }) =>
      createMoneyStream(personId, monthlyRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', person.id] })
    }
  })

  const addStream = () => {
    if (newStreamMonthlyRate) {
      addStreamMutation.mutate({
        personId: person.id,
        monthlyRate: parseFloat(newStreamMonthlyRate)
      })
      setNewStreamMonthlyRate('')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{person.name || person.email}</DialogTitle>
          <DialogDescription>Manage company actions for this person</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={person.picture} alt={person.email || "Person"} />
              <AvatarFallback>{computeAvatarFallback(person.email || "Person")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{person.name || person.email}</p>
              <p className="text-sm text-muted-foreground">{person.email}</p>
              <p className="text-sm font-medium mt-1">Director</p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Money Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {streamsQuery.isPending ? (
                <div className="flex justify-center items-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : streamsQuery.data && streamsQuery.data.length > 0 ? (
                <ul className="space-y-2">
                  {streamsQuery.data.map((stream: any) => (
                    <li key={stream.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                      <span className="font-medium">${stream.monthlyRate.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">per month</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No active money streams</p>
              )}
              <div className="mt-4 space-y-2">
                <Label htmlFor="monthlyRate">New Stream Monthly Rate ($)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="monthlyRate"
                    type="number"
                    value={newStreamMonthlyRate}
                    onChange={(e) => setNewStreamMonthlyRate(e.target.value)}
                    placeholder="Enter monthly rate"
                  />
                  <Button onClick={addStream} size="icon">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}