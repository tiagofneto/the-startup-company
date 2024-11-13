'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { computeAvatarFallback, createSupabaseClient } from '@/lib/utils';
import {
  createCompanyUser,
  fundCompany,
  getCompany,
  getCompanyBalance,
  getCompanyPeople,
  getKycStatus,
  getPayments,
  getShareholders,
  getShares
} from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { SendMoneyDialog } from './transfer-dialog';
import ConditionalTooltipWrapper from '@/components/conditional-tooltip';
import { FundDialog } from './fund-dialog';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
const supabase = createSupabaseClient();

export default function CompanyDashboard({
  params
}: {
  params: { handle: string };
}) {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  const companyQuery = useQuery({
    queryKey: ['company', params.handle],
    queryFn: () => getCompany(params.handle)
  });

  const balanceQuery = useQuery({
    queryKey: ['balance', params.handle],
    queryFn: () => getCompanyBalance(params.handle)
  });

  const peopleQuery = useQuery({
    queryKey: ['people', params.handle],
    queryFn: () => getCompanyPeople(params.handle)
  });

  const shareholdersQuery = useQuery({
    queryKey: ['shareholders', params.handle],
    queryFn: () => getShareholders(params.handle)
  });

  const queryClient = useQueryClient();

  const addPersonMutation = useMutation({
    mutationFn: (email: string) =>
      createCompanyUser(email, companyQuery.data?.handle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people', params.handle] });
      setEmail('');
    }
  });

  const sharesQuery = useQuery({
    queryKey: ['shares', params.handle],
    queryFn: () => getShares(params.handle)
  });

  const kycStatusQuery = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => getKycStatus()
  });

  const fundCompanyMutation = useMutation({
    mutationFn: (amount: number) => fundCompany(params.handle, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', params.handle] });
      queryClient.invalidateQueries({
        queryKey: ['shareholders', params.handle]
      });
    }
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments', params.handle],
    queryFn: () => getPayments(params.handle)
  });

  const addPerson = () => {
    const emailToAdd = email;
    addPersonMutation.mutate(emailToAdd);
  };

  const isCompanyCompliant = () => {
    return peopleQuery.data?.every((person: any) => person.kyc_verified);
  };

  const isCompanyRegistered = () => {
    return shareholdersQuery.data?.length > 0;
  };


  if (companyQuery.isPending || kycStatusQuery.isPending || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between mb-8 pt-16">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={companyQuery.data?.logo}
              alt={companyQuery.data?.name || 'Company'}
            />
            <AvatarFallback>
              {computeAvatarFallback(companyQuery.data?.name || 'Company')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {companyQuery.data?.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              @{companyQuery.data?.handle}
            </p>
            <div className="flex gap-1 mt-1">
              {isCompanyCompliant() && (
                <Badge 
                  variant="green" 
                  className="border-0"
                >
                  Compliant
                </Badge>
              )}
              {isCompanyRegistered() && (
                <Badge 
                  variant="blue" 
                  className="border-0"
                >
                  Registered
                </Badge>
              )}
            </div>
          </div>
        </div>
        {/* <Button variant="outline">Edit Profile</Button> */}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:grid-flow-dense">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)]">
              <div className="flex flex-col justify-between h-full">
                {peopleQuery.isPending ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {peopleQuery.data?.map((person: any) => (
                      <div
                        key={person.id}
                        className={`flex items-center justify-between rounded-lg`}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={person.picture}
                              alt={person.email || 'Person'}
                            />
                            <AvatarFallback>
                              {computeAvatarFallback(
                                person.email || 'Person'
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {person.name || person.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Director
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 ${
                            !person.id
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              : person.kyc_verified
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          } rounded-full text-sm font-medium`}
                        >
                          {!person.id
                            ? 'Not Registered'
                            : person.kyc_verified
                              ? 'Verified'
                              : 'Pending Verification'}
                        </span>
                      </div>
                    ))}
                    
                    {addPersonMutation.isPending && (
                      <div className="flex items-center justify-between rounded-lg animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          <div>
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                          </div>
                        </div>
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    )}
                  </div>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex justify-center mt-8">
                      <Button className="w-1/3" disabled={addPersonMutation.isPending}>
                        <Plus className="mr-2 h-4 w-4"/> Add Person
                      </Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Person</DialogTitle>
                      <DialogDescription>
                        Enter the person's email address and select their role.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="email" className="sr-only">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={email}
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <DialogFooter className="sm:justify-start">
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addPerson}
                          disabled={addPersonMutation.isPending}
                        >
                          {addPersonMutation.isPending ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                              Adding...
                            </div>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" /> Add
                            </>
                          )}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="font-semibold">NOV</div>
                    <div className="text-3xl font-bold">28</div>
                  </div>
                  <div>
                    <p className="font-medium">Annual Compliance Review</p>
                    <p className="text-sm text-muted-foreground">
                      Year-end regulatory assessment
                    </p>
                  </div>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="font-semibold">DEC</div>
                    <div className="text-3xl font-bold">15</div>
                  </div>
                  <div>
                    <p className="font-medium">Shareholder Meeting</p>
                    <p className="text-sm text-muted-foreground">
                      Q4 financial review and voting
                    </p>
                  </div>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="font-semibold">JAN</div>
                    <div className="text-3xl font-bold">05</div>
                  </div>
                  <div>
                    <p className="font-medium">Tax Filing Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      Annual tax documentation due
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <div className="w-32">
                    {/* Empty div for spacing */}
                  </div>
                  
                  <SendMoneyDialog handle={companyQuery.data?.handle}>
                    <Button className="w-1/3" disabled={!kycStatusQuery.data || !isCompanyRegistered()}>
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Send Money
                    </Button>
                  </SendMoneyDialog>

                  <div className="text-right w-32">
                    {balanceQuery.isPending ? (
                      <div className="h-10 flex items-center justify-end">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-1 border-primary-foreground"></div>
                      </div>
                    ) : (
                      <p className="text-xl font-bold">
                        ${balanceQuery.data?.balance}
                      </p>
                    )}
                    <p className="text-md font-medium">Current Balance</p>
                  </div>
                </div>

                {paymentsQuery.data?.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center -mt-5">
                      To send your first payment, you must have set up your company ownership
                    </p>
                  </div>
                )}

                {paymentsQuery.data?.length > 0 && (
                  <Table>
                    <TableHeader>
                      <p className="font-semibold text-sm">Payments History</p>
                      <TableRow>
                        <TableHead>To</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsQuery.data?.map((payment: any) => (
                        <TableRow key={payment.id} className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
                          <TableCell className="font-medium">@{payment.companyDestination}</TableCell>
                          <TableCell>{payment.description}</TableCell>
                          <TableCell>
                            <Badge>
                              {payment.type === "wire" ? "Wire" : "Stream"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">${payment.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <CardTitle>Company Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              {!isCompanyRegistered() ? (
                <div className="flex flex-col items-center space-y-4 py-4">
                  <FundDialog
                    key={peopleQuery.data?.length}
                    handle={companyQuery.data?.handle}
                    companyName={companyQuery.data?.name}
                    cofounders={peopleQuery.data?.map(
                      (person: any) => ({ email: person.email, name: person.name })
                    )}
                  >
                    <Button className="w-2/3" disabled={!kycStatusQuery.data}>Fund the Company</Button>
                  </FundDialog>
                  <p className="text-sm text-muted-foreground text-center">
                    Set up the company ownership and buy your shares to register your company. You must be verified to do this.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shareholdersQuery.data?.map((shareholder: any) => {
                    const totalShares = shareholdersQuery.data?.reduce(
                      (sum: number, s: any) => sum + s.shares,
                      0
                    );
                    const ownershipPercentage = ((shareholder.shares / totalShares) * 100).toFixed(2);

                    return (
                      <div
                        key={shareholder.id}
                        className={`flex items-center justify-between rounded-lg ${
                          !shareholder.funded && shareholder.email !== user?.email
                            ? 'opacity-50'
                            : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={shareholder.picture} alt={shareholder.name || shareholder.email} />
                            <AvatarFallback>
                              {computeAvatarFallback(shareholder.name || shareholder.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{shareholder.name || shareholder.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{ownershipPercentage}%</span>
                          {!shareholder.funded && shareholder.email === user?.email && (
                            <Button
                              size="sm"
                              onClick={() => fundCompanyMutation.mutate(shareholder.shares)}
                              disabled={!kycStatusQuery.data || fundCompanyMutation.isPending}
                            >
                              {fundCompanyMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                                  Funding...
                                </div>
                              ) : (
                                'Fund'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
