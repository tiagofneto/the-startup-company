'use client'

import Image from 'next/image'
import { ChevronRight, FileText, Shield, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/utils'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { getProfile, getUserCompanies } from '@/services/api'
import Link from 'next/link'

const supabase = createSupabaseClient()

export default function UserDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null)

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

  const documentsQuery = useQuery({
    queryKey: ['user_documents'],
    queryFn: async () => {
        return [
            { name: 'Articles of Incorporation - TechCorp Inc.', id: 'doc1' },
            { name: 'Operating Agreement - InnovateLLC', id: 'doc2' },
            { name: 'Shareholder Agreement - FutureTech Solutions', id: 'doc3' },
            { name: 'Business License - Quantum Dynamics', id: 'doc4' },
            { name: 'Partnership Agreement - Nexus Innovations', id: 'doc5' },
        ]}
  })

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
                    {companiesQuery.data?.map((company: { name: string, handle: string, image: string }, index: any) => (
                      <Link href={`/dashboard`} passHref>
                        <div
                          key={index}
                          className="mb-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors duration-150"
                        >
                          <div className="flex items-center">
                            <Image
                              src={company.image || '/placeholder.svg'}
                              alt={`${company.name} logo`}
                              width={40}
                              height={40}
                              className="rounded-full mr-4"
                            />
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
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-full text-sm font-medium">
                        {profileQuery.data.kyc_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <Button className="w-full">Complete KYC Verification</Button>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                      Unlock all features with KYC
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2" />
                  Legal Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {documentsQuery.isPending ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ul className="h-48 overflow-y-auto">
                    {documentsQuery.data?.map((doc) => (
                      <li 
                        key={doc.id}
                        className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center transition-colors duration-150"
                      >
                        <FileText className="mr-2 text-gray-400" size={16} />
                        <span>{doc.name}</span>
                      </li>
                    ))}
                  </ul>
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
                  <FileText className="mr-2 text-gray-400" size={16} />
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