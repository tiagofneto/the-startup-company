'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getCompanies } from '@/services/api'

export default function CompaniesRegistry() {
  const [searchTerm, setSearchTerm] = useState('')
  const companiesQuery = useQuery({ queryKey: ['companies'], queryFn: getCompanies })

  const filteredCompanies = companiesQuery.data?.map((company: any) => {
    const labels = [...(company.labels || [])]
    if (company.directors.every((director: any) => director.kyc_verified)) {
      labels.push('Compliant')
    }
    if (company.hasShareholders) {
      labels.push('Registered')
    }
    return { ...company, labels }
  }).filter((company: any) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.directors.some((director: any) => director.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    company.labels.some((label: string) => label.toLowerCase().includes(searchTerm.toLowerCase())) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col">
      <h1 className="text-4xl font-bold mb-16 text-center">Sark Company Register</h1>
      
      <div className="flex justify-center mb-16">
        <div className="relative w-[600px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 z-10" />
          <Input
            type="text"
            placeholder="Search companies by their name, number, founder or compliance status"
            className="pl-10 pr-4 py-2 rounded-full bg-gray-200/50 backdrop-blur-sm border-0 dark:bg-gray-800/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-t-2xl bg-gray-200/50 backdrop-blur-sm p-6 px-12 dark:bg-gray-800/50 w-full max-w-7xl mx-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-300 dark:border-gray-700">
              <TableHead className="text-base font-semibold text-center text-black dark:text-black">Name</TableHead>
              <TableHead className="text-base font-semibold text-center text-black dark:text-black">Labels</TableHead>
              <TableHead className="text-base font-semibold text-center text-black dark:text-black">Directors</TableHead>
              <TableHead className="text-base font-semibold text-center text-black dark:text-black">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies?.map((company: any) => (
              <TableRow key={company.companyId} className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
                <TableCell className="font-medium text-center">{company.name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center flex-wrap gap-1">
                    {company.labels?.map((label: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant={label === 'Compliant' ? 'green' : label === 'Registered' ? 'blue' : 'secondary'} 
                        className="border-0"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">{company.directors.map((director: any) => director.name).join(', ')}</TableCell>
                <TableCell className="text-center">{company.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}