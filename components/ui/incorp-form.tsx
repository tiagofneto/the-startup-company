'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { PlusIcon, TrashIcon } from 'lucide-react'

type CapTableRow = {
  shareholder: string;
  email: string;
  ordinaryShares: string;
  percentage: string;
  isDirector: boolean;
};

export default function CompanyProfileForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    directorName: '',
    ordinaryShares: '',
  })

  const [capTable, setCapTable] = useState<CapTableRow[]>([
    { shareholder: '', email: '', ordinaryShares: '', percentage: '100', isDirector: true }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCapTableChange = (index: number, field: keyof CapTableRow, value: string | boolean) => {
    const newCapTable = [...capTable] as CapTableRow[];
    (newCapTable[index] as any)[field] = value;
    updatePercentages(newCapTable);
    setCapTable(newCapTable);
  }

  const updatePercentages = (table: any[]) => {
    const totalShares = table.reduce((sum, row) => sum + Number(row.ordinaryShares), 0)
    table.forEach(row => {
      row.percentage = totalShares ? ((Number(row.ordinaryShares) / totalShares) * 100).toFixed(2) : '0'
    })
  }

  const addCapTableRow = () => {
    setCapTable([...capTable, { shareholder: '', email: '', ordinaryShares: '', percentage: '0', isDirector: false }])
  }

  const removeCapTableRow = (index: number) => {
    const newCapTable = capTable.filter((_, i) => i !== index)
    updatePercentages(newCapTable)
    setCapTable(newCapTable)
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Form Section */}
      <div className="lg:w-1/2 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Create Company Profile</h1>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Company Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="directorName">Director Name</Label>
            <Input id="directorName" name="directorName" value={formData.directorName} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ordinaryShares">Number of Ordinary Shares</Label>
            <Input id="ordinaryShares" name="ordinaryShares" type="number" value={formData.ordinaryShares} onChange={handleInputChange} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cap Table</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shareholder</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ordinary Shares</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Director</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capTable.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input 
                        value={row.shareholder} 
                        onChange={(e) => handleCapTableChange(index, 'shareholder', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="email"
                        value={row.email} 
                        onChange={(e) => handleCapTableChange(index, 'email', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        value={row.ordinaryShares} 
                        onChange={(e) => handleCapTableChange(index, 'ordinaryShares', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>{row.percentage}%</TableCell>
                    <TableCell>
                      <Switch 
                        checked={row.isDirector}
                        onCheckedChange={(checked) => handleCapTableChange(index, 'isDirector', checked)}
                        disabled={index === 0}
                      />
                    </TableCell>
                    <TableCell>
                      {index !== 0 && (
                        <Button variant="ghost" size="icon" onClick={() => removeCapTableRow(index)}>
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button type="button" onClick={addCapTableRow} className="mt-2">
              <PlusIcon className="h-4 w-4 mr-2" /> Add Shareholder
            </Button>
          </div>

          <Button type="submit" className="w-full">Create Company Profile</Button>
        </form>
      </div>

      {/* Contract Preview Section */}
      <div className="lg:w-1/2 p-8 bg-white shadow-lg overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6">Company Profile</h2>
          {formData.companyName && (
            <p><strong>Company Name:</strong> {formData.companyName}</p>
          )}
          {formData.email && (
            <p><strong>Company Email:</strong> {formData.email}</p>
          )}
          {formData.directorName && (
            <p><strong>Director Name:</strong> {formData.directorName}</p>
          )}
          {formData.ordinaryShares && (
            <p><strong>Number of Ordinary Shares:</strong> {formData.ordinaryShares}</p>
          )}
          {capTable.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Cap Table</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shareholder</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ordinary Shares</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Director</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capTable.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.shareholder}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.ordinaryShares}</TableCell>
                      <TableCell>{row.percentage}%</TableCell>
                      <TableCell>{row.isDirector ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}