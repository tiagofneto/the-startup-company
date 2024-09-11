import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { PlusIcon, TrashIcon } from 'lucide-react'

interface CapTableProps {
  capTable: Array<{
    shareholder: string
    email: string
    ordinaryShares: string
    percentage: string
    isDirector: boolean
  }>
  onCapTableChange: (newCapTable: CapTableProps['capTable']) => void
  totalShares: number
}

export default function CapTable({ capTable, onCapTableChange, totalShares }: CapTableProps) {
  const [localCapTable, setLocalCapTable] = useState(capTable)

  useEffect(() => {
    if (JSON.stringify(capTable) !== JSON.stringify(localCapTable)) {
      setLocalCapTable(capTable)
    }
  }, [capTable])

  const handleCapTableChange = (index: number, field: string, value: string | boolean) => {
    const newCapTable = localCapTable.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    )
    setLocalCapTable(newCapTable)
    onCapTableChange(newCapTable)
  }

  const addCapTableRow = () => {
    const newCapTable = [...localCapTable, { shareholder: '', email: '', ordinaryShares: '', percentage: '0', isDirector: false }]
    setLocalCapTable(newCapTable)
    onCapTableChange(newCapTable)
  }

  const removeCapTableRow = (index: number) => {
    const newCapTable = localCapTable.filter((_, i) => i !== index)
    setLocalCapTable(newCapTable)
    onCapTableChange(newCapTable)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Cap Table</h2>
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
          {localCapTable.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input 
                  value={row.shareholder} 
                  onChange={(e) => handleCapTableChange(index, 'shareholder', e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="email"
                  value={row.email} 
                  onChange={(e) => handleCapTableChange(index, 'email', e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number"
                  value={row.ordinaryShares} 
                  onChange={(e) => handleCapTableChange(index, 'ordinaryShares', e.target.value)}
                  className="w-full"
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
      <Button type="button" onClick={addCapTableRow} variant="outline" className="mt-2">
        <PlusIcon className="h-4 w-4 mr-2" /> Add Shareholder
      </Button>
    </div>
  )
}