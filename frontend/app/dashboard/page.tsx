import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Inbox, 
  FileText, 
  PieChart, 
  DollarSign, 
  Users, 
  Settings,
  BarChart3,
  Calendar,
  HelpCircle,
  AlertCircle
} from 'lucide-react'

export default function CompanyDashboard() {
  const companyName = "TechNova Solutions"
  const missingActions = [
    { id: 1, action: "Complete KYC verification", priority: "high" },
    { id: 2, action: "Set up cap table", priority: "medium" },
    { id: 3, action: "Add company logo", priority: "low" },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{companyName}</h1>
        <p className="text-xl text-muted-foreground">@technova</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company Stats</CardTitle>
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
        </aside>

        <main className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Missing Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missingActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-4">
                      <AlertCircle className={`h-6 w-6 ${
                        action.priority === 'high' ? 'text-red-500' :
                        action.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <span>{action.action}</span>
                    </div>
                    <Button size="sm">Complete</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">New team member added</p>
                      <p className="text-sm text-muted-foreground">John Doe joined as Developer</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2h ago</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Invoice paid</p>
                      <p className="text-sm text-muted-foreground">$5,000 received from Client X</p>
                    </div>
                    <span className="text-sm text-muted-foreground">1d ago</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">New project started</p>
                      <p className="text-sm text-muted-foreground">Project Y kicked off</p>
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
                      <p className="text-sm text-muted-foreground">Annual strategy review</p>
                    </div>
                  </li>
                  <li className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="font-semibold">JUN</div>
                      <div className="text-3xl font-bold">22</div>
                    </div>
                    <div>
                      <p className="font-medium">Team Offsite</p>
                      <p className="text-sm text-muted-foreground">Quarterly team building event</p>
                    </div>
                  </li>
                  <li className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="font-semibold">JUL</div>
                      <div className="text-3xl font-bold">01</div>
                    </div>
                    <div>
                      <p className="font-medium">Product Launch</p>
                      <p className="text-sm text-muted-foreground">Release of new feature set</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}