'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getCompanies } from '@/services/api'
import { useQuery } from '@tanstack/react-query'

export default function CompaniesPage() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  })
  const [searchTerm, setSearchTerm] = useState('')

  // TODO: fix type
  const filteredCompanies = data?.filter((company: any) => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.handle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center pt-16">Discover Companies</h1>
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            type="text"
            placeholder="Search companies..."
            className="pl-10 pr-4 py-2 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {isPending ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500 text-xl">Error: {error.message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* TODO: fix type */} 
          {filteredCompanies.map((company: any) => (
            <div key={company.id} className="group">
              <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl dark:bg-gray-800">
                <div className="aspect-video relative">
                  <Image
                    src={company.imageUrl || '/placeholder.svg'}
                    alt={company.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-semibold text-white mb-2">{company.name}</h2>
                  <p className="text-sm text-gray-200 mb-3">@{company.handle}</p>
                  {company.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4">{company.description}</p>
                  )}
                  <Link href={`/dashboard/${company.handle}`} passHref>
                    <Button className="w-full bg-white text-black hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                      View Company
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}