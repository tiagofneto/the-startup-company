'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Shield, User, Workflow } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { computeAvatarFallback, createSupabaseClient } from '@/lib/utils'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { getProfile, getUserCompanies, verifyKyc, getUserStreams } from '@/services/api'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { OpenPassportQRcode, OpenPassport1StepInputs, OpenPassportVerifierReport } from '@openpassport/sdk'
import { BorderBeam } from '@/components/ui/border-beam'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const supabase = createSupabaseClient()

export default function UserDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null)

  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
      }
    })
  }, [])

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  })

  const companiesQuery = useQuery({
    queryKey: ['user_companies'],
    queryFn: getUserCompanies
  })

  const streamsQuery = useQuery({
    queryKey: ['user_streams'],
    queryFn: () => getUserStreams(user!.id)
  })

  const kycMutation = useMutation({
    mutationFn: verifyKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })

  const handleSuccessfulVerification = (proof: OpenPassport1StepInputs, verificatonResult: OpenPassportVerifierReport) => {
    kycMutation.mutate(proof)
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Group streams by company
  const groupedStreams = streamsQuery.data?.reduce((acc: any, stream: any) => {
    if (!acc[stream.companyId]) {
      acc[stream.companyId] = []
    }
    acc[stream.companyId].push(stream)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8 text-gray-800 dark:text-gray-100 pt-16">Welcome back, {user?.user_metadata.full_name.split(' ')[0]}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Your Companies</CardTitle>
                <CardDescription>Click on a company to manage</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                {companiesQuery.isPending ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto pr-2">
                    {companiesQuery.data?.map((company: { name: string, handle: string, image: string }, index: number) => (
                      <Link key={index} href={`/dashboard/${company.handle}`} passHref>
                        <div className="mb-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors duration-150">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarImage src={company.image} alt={`${company.name} logo`}/>
                              <AvatarFallback>{computeAvatarFallback(company.name || "Company")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{company.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">@{company.handle}</p>
                            </div>
                          </div>
                          <ChevronRight className="text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2" />
                  KYC Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileQuery.isPending ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span>Status:</span>
                      <span className={`px-3 py-1 ${profileQuery.data.kyc_verified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'} rounded-full text-sm font-medium`}>
                        {profileQuery.data.kyc_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    {profileQuery.data.kyc_verified ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Your KYC verification is complete. All features are unlocked.
                      </p>
                    ) : (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full">Complete KYC Verification</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>KYC Verification</DialogTitle>
                              <DialogDescription>
                                Use the OpenPassport app to complete your KYC verification.
                              </DialogDescription>
                            </DialogHeader>
                            <OpenPassportQRcode
                              appName="The Startup Company"
                              scope="@thestartupcompany"
                              userId={user.id}
                              requirements={[]}
                              onSuccess={handleSuccessfulVerification}
                              devMode={true}
                              size={300}
                            />
                          </DialogContent>
                        </Dialog>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                          Unlock all features with KYC
                        </p>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Workflow className="mr-2" />
                  Your Streams
                </CardTitle>
                <CardDescription>Visualize your income streams</CardDescription>
              </CardHeader>
              <CardContent>
                {streamsQuery.isPending ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : groupedStreams && Object.keys(groupedStreams).length > 0 ? (
                  <div className="space-y-4 h-48 overflow-y-auto pr-2">
                    {Object.entries(groupedStreams).map(([companyId, streams]: any) => {
                      const company = companiesQuery.data?.find((c: any) => c.id === companyId)
                      return (
                        <div key={companyId} className="bg-muted rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={company?.image} alt={`${company?.name} logo`}/>
                              <AvatarFallback>{computeAvatarFallback(company?.name || "Company")}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-sm">{company?.name}</h3>
                          </div>
                          <ul className="space-y-1">
                            {streams.map((stream: any) => (
                              <li key={stream.id} className="relative flex justify-between items-center p-2 bg-background rounded-md">
                                <span className="font-medium text-sm">${stream.rate.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">per month</span>
                                <BorderBeam size={50} duration={5} colorFrom='#000' colorTo='#fff'/>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active streams</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2" />
              Account Overview
            </CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Shield className="mr-2 text-gray-400" size={16} />
                  Two-Factor Authentication
                </span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Workflow className="mr-2 text-gray-400" size={16} />
                  Email Notifications
                </span>
                <Switch />
              </div>
              <Button className="w-full">Update Profile Information</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}