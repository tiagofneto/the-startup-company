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
import { Workflow, PlusCircle } from 'lucide-react'
import { createStream, getUserCompanyStreams } from '@/services/api'
import { StreamItem } from '@/components/stream-item';

interface PersonDialogProps {
  person: {
    id: string;
    name: string;
    email: string;
    picture: string;
    kyc_verified: boolean;
  };
  companyId: number;
  children: ReactNode;
}

export function PersonDialog({ person, companyId, children }: PersonDialogProps) {
  const [newStreamMonthlyRate, setNewStreamMonthlyRate] = useState('')

  const queryClient = useQueryClient()

  const streamsQuery = useQuery({
    queryKey: ['streams', companyId, person.id],
    queryFn: () => getUserCompanyStreams(companyId, person.id),
  })

  const addStreamMutation = useMutation({
    mutationFn: ({ personId, monthlyRate }: { personId: string, monthlyRate: number }) => createStream(personId, companyId, monthlyRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', companyId, person.id] })
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
                <Workflow className="mr-2 h-5 w-5" />
                Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {streamsQuery.isPending ? (
                <div className="flex justify-center items-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : streamsQuery.data && streamsQuery.data.length > 0 ? (
                <ul className="space-y-1">
                  {streamsQuery.data.map((stream: any) => (
                    <StreamItem key={stream.id} rate={stream.rate} variant="compact" />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No active streams</p>
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