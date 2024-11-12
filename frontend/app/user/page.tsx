'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { computeAvatarFallback, createSupabaseClient } from '@/lib/utils';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  getProfile,
  getUserCompanies,
  getUserStreams
} from '@/services/api';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { KYCDialog } from './kyc-dialog';

const supabase = createSupabaseClient();

export default function UserDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  });

  const companiesQuery = useQuery({
    queryKey: ['user_companies'],
    queryFn: getUserCompanies
  });

  const streamsQuery = useQuery({
    queryKey: ['user_streams'],
    queryFn: () => getUserStreams(user!.id)
  });

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group streams by company
  const groupedStreams = streamsQuery.data?.reduce((acc: any, stream: any) => {
    if (!acc[stream.companyId]) {
      acc[stream.companyId] = [];
    }
    acc[stream.companyId].push(stream);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8 text-gray-800 dark:text-gray-100 pt-16">
          Welcome back, {user?.user_metadata.full_name.split(' ')[0]}
        </h1>

        <div className="grid grid-cols-3 gap-8">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Your Companies</CardTitle>
              <CardDescription>Click on a company to manage</CardDescription>
            </CardHeader>
            <CardContent>
              {companiesQuery.isPending ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-y-auto pr-2">
                  {companiesQuery.data?.map(
                    (
                      company: {
                        name: string;
                        handle: string;
                        image: string;
                      },
                      index: number
                    ) => (
                      <Link
                        key={index}
                        href={`/dashboard/${company.handle}`}
                        passHref
                      >
                        <div className="mb-4 p-4 border rounded-lg cursor-pointer bg-card hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors duration-150">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarImage
                                src={company.image}
                                alt={`${company.name} logo`}
                              />
                              <AvatarFallback>
                                {computeAvatarFallback(
                                  company.name || 'Company'
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">
                                {company.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                @{company.handle}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="text-gray-400" />
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Information
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user?.user_metadata.picture}
                      alt={user?.user_metadata.full_name || user?.email}
                    />
                    <AvatarFallback>
                      {computeAvatarFallback(user?.user_metadata.full_name || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileQuery.isPending ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{user?.user_metadata.full_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <span
                          className={`px-3 py-1 ${
                            profileQuery.data.kyc
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          } rounded-full text-sm font-medium`}
                        >
                          {profileQuery.data.kyc ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      {!profileQuery.data.kyc && (
                        <div className="mt-6">
                          <KYCDialog userId={user.id}>
                            <div className="relative w-full">
                              <Button className="w-full">
                                Complete Identity Verification
                              </Button>
                              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                              </span>
                            </div>
                          </KYCDialog>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                            Unlock all features with identity verification
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
