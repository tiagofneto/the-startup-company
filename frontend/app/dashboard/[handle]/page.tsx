'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Inbox,
  FileText,
  PieChart,
  DollarSign,
  Users,
  Settings,
  BarChart3,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
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
import { PersonDialog } from './person-dialog';
import { SendMoneyDialog } from './transfer-dialog';
import ConditionalTooltipWrapper from '@/components/conditional-tooltip';
import { FundDialog } from './fund-dialog';
import { User as SupabaseUser } from '@supabase/supabase-js';

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

  const missingActions = [
    { id: 1, action: 'Complete KYC verification', priority: 'high' },
    { id: 2, action: 'Set up cap table', priority: 'medium' },
    { id: 3, action: 'Add company logo', priority: 'low' }
  ];

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

  const addPerson = () => {
    const emailToAdd = email;
    setEmail('');
    addPersonMutation.mutate(emailToAdd);
  };

  if (companyQuery.isPending || kycStatusQuery.isPending || !user) {
    return (
      <div className="flex justify-center items-center h-64">
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
              {companyQuery.data?.handle}
            </p>
          </div>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="ghost">
                <Inbox className="mr-2 h-4 w-4" />
                Inbox
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <FileText className="mr-2 h-4 w-4" />
                Documents
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <PieChart className="mr-2 h-4 w-4" />
                Cap Table
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <DollarSign className="mr-2 h-4 w-4" />
                Transactions
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <Users className="mr-2 h-4 w-4" />
                Team
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <TrendingUp className="mr-2 h-4 w-4" />
                Fundraising
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Company Stats
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-medium">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employees</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Customers</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Growth</span>
                <span className="font-medium text-green-500">+15%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">New team member added</p>
                    <p className="text-sm text-muted-foreground">
                      John Doe joined as Developer
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">2h ago</span>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Invoice paid</p>
                    <p className="text-sm text-muted-foreground">
                      $5,000 received from Client X
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">1d ago</span>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">New project started</p>
                    <p className="text-sm text-muted-foreground">
                      Project Y kicked off
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">3d ago</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="font-semibold">JUN</div>
                    <div className="text-3xl font-bold">15</div>
                  </div>
                  <div>
                    <p className="font-medium">Board Meeting</p>
                    <p className="text-sm text-muted-foreground">
                      Annual strategy review
                    </p>
                  </div>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="font-semibold">JUN</div>
                    <div className="text-3xl font-bold">22</div>
                  </div>
                  <div>
                    <p className="font-medium">Team Offsite</p>
                    <p className="text-sm text-muted-foreground">
                      Quarterly team building event
                    </p>
                  </div>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="font-semibold">JUL</div>
                    <div className="text-3xl font-bold">01</div>
                  </div>
                  <div>
                    <p className="font-medium">Product Launch</p>
                    <p className="text-sm text-muted-foreground">
                      Release of new feature set
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="text-center md:text-left">
                  <p className="text-lg font-medium">Current Balance</p>
                  {balanceQuery.isPending ? (
                    <div className="h-10 flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-foreground"></div>
                    </div>
                  ) : (
                    <p className="text-4xl font-bold">
                      ${balanceQuery.data?.balance}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <ConditionalTooltipWrapper
                    isDisabled={!kycStatusQuery.data}
                    tooltipContent="You must complete KYC verification to send money"
                  >
                    <SendMoneyDialog handle={companyQuery.data?.handle}>
                      <Button variant="secondary" size="lg">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Send Money
                      </Button>
                    </SendMoneyDialog>
                  </ConditionalTooltipWrapper>
                  <ConditionalTooltipWrapper
                    isDisabled={!kycStatusQuery.data}
                    tooltipContent="You must complete KYC verification to receive money"
                  >
                    <Button variant="secondary" size="lg">
                      <ArrowDownLeft className="mr-2 h-4 w-4" />
                      Receive Money
                    </Button>
                  </ConditionalTooltipWrapper>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>People</CardTitle>
              </CardHeader>
              <CardContent>
                {peopleQuery.isPending ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {peopleQuery.data?.map((person: any) => {
                      const PersonContent = (
                        <div
                          className={`flex items-center justify-between bg-background rounded-lg ${person.id ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
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
                      );

                      return person.id ? (
                        <PersonDialog
                          key={person.id}
                          person={person}
                          handle={companyQuery.data?.handle}
                        >
                          {PersonContent}
                        </PersonDialog>
                      ) : (
                        PersonContent
                      );
                    })}
                  </div>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Add Person
                    </Button>
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
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Missing Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missingActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <AlertCircle
                          className={`h-6 w-6 ${
                            action.priority === 'high'
                              ? 'text-red-500'
                              : action.priority === 'medium'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                          }`}
                        />
                        <span>{action.action}</span>
                      </div>
                      <Button size="sm">Complete</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cap Table</CardTitle>
            </CardHeader>
            <CardContent>
              {shareholdersQuery.data?.length === 0 ? (
                <FundDialog
                  handle={companyQuery.data?.handle}
                  companyName={companyQuery.data?.name}
                  cofounders={peopleQuery.data?.map(
                    (person: any) => person.email
                  )}
                  currentCofounder={companyQuery.data?.current_cofounder}
                >
                  <Button>Fund the Company</Button>
                </FundDialog>
              ) : (
                <div className="container mx-auto p-4">
                  {(() => {
                    const totalShares =
                      shareholdersQuery.data?.reduce(
                        (sum: number, shareholder: any) =>
                          sum + shareholder.shares,
                        0
                      ) || 0;

                    return (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-left font-bold">
                              Shareholder
                            </TableHead>
                            <TableHead className="text-right font-bold">
                              Shares
                            </TableHead>
                            <TableHead className="text-right font-bold">
                              Percentage
                            </TableHead>
                            <TableHead className="text-right font-bold">
                              Status
                            </TableHead>
                            <TableHead className="text-right font-bold">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shareholdersQuery.data?.map((shareholder: any) => (
                            <TableRow
                              key={shareholder.id}
                              className={
                                !shareholder.funded &&
                                shareholder.email !== user?.email
                                  ? 'opacity-50'
                                  : ''
                              }
                            >
                              <TableCell className="font-medium">
                                {shareholder.email}
                              </TableCell>
                              <TableCell className="text-right">
                                {shareholder.shares.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {(
                                  (shareholder.shares / totalShares) *
                                  100
                                ).toFixed(2)}
                                %
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${
                      shareholder.funded
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}
                                >
                                  {shareholder.funded ? 'Funded' : 'Unfunded'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {!shareholder.funded &&
                                  shareholder.email === user?.email && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        fundCompanyMutation.mutate(
                                          shareholder.shares
                                        )
                                      }
                                    >
                                      Fund
                                    </Button>
                                  )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
