import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PreviewProps {
  formData: {
    companyName: string
    email: string
    directorName: string
    ordinaryShares: string
  }
  capTable: Array<{
    shareholder: string
    email: string
    ordinaryShares: string
    percentage: string
    isDirector: boolean
  }>
}

export default function Preview({ formData, capTable }: PreviewProps) {
  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-center">Company Profile</h2>
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
  )
}