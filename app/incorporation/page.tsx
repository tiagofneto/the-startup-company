'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CompanyInfoForm from '@/components/incorporation/info-form'
import CapTable from '@/components/incorporation/cap-table'
import Preview from '@/components/incorporation/preview'

export default function IncorporationPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    directorName: '',
    ordinaryShares: '',
  })

  const [capTable, setCapTable] = useState([
    { shareholder: '', email: '', ordinaryShares: '', percentage: '0', isDirector: true }
  ])

  const [isFormValid, setIsFormValid] = useState(false)

  const updatePercentages = useCallback((table: typeof capTable, totalShares: number) => {
    return table.map(row => ({
      ...row,
      percentage: totalShares > 0 
        ? ((Number(row.ordinaryShares) / totalShares) * 100).toFixed(2) 
        : '0'
    }))
  }, [])

  useEffect(() => {
    const totalShares = Number(formData.ordinaryShares)
    const updatedCapTable = updatePercentages(capTable, totalShares)
    
    const capTableTotalShares = updatedCapTable.reduce((sum, row) => sum + Number(row.ordinaryShares), 0)
    setIsFormValid(capTableTotalShares === totalShares && totalShares > 0)
    
    // Only update capTable if percentages have changed
    if (JSON.stringify(updatedCapTable) !== JSON.stringify(capTable)) {
      setCapTable(updatedCapTable)
    }
  }, [formData.ordinaryShares, capTable, updatePercentages])

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCapTableChange = (newCapTable: typeof capTable) => {
    setCapTable(newCapTable)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      console.log('Form submitted:', { ...formData, capTable })
      // Here you would typically send the data to your backend
    } else {
      alert('Please ensure the total shares in the cap table match the number of ordinary shares.')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Company Incorporation</h1>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <div className="lg:w-1/2 p-8 overflow-y-auto">
          <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Company Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <CompanyInfoForm formData={formData} onInputChange={handleInputChange} />
              <CapTable 
                capTable={capTable} 
                onCapTableChange={handleCapTableChange}
                totalShares={Number(formData.ordinaryShares)}
              />
              <Button type="submit" className="w-full" disabled={!isFormValid}>
                Create Company Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:w-1/2 p-8 bg-white shadow-lg overflow-y-auto">
        <Preview formData={formData} capTable={capTable} />
        </div>
      </div>
    </div>
  )
}