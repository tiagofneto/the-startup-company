import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CompanyInfoFormProps {
  formData: {
    companyName: string
    email: string
    directorName: string
    ordinaryShares: string
  }
  onInputChange: (name: string, value: string) => void
}

export default function CompanyInfoForm({ formData, onInputChange }: CompanyInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input 
          id="companyName" 
          value={formData.companyName} 
          onChange={(e) => onInputChange('companyName', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Company Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={formData.email} 
          onChange={(e) => onInputChange('email', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="directorName">Director Name</Label>
        <Input 
          id="directorName" 
          value={formData.directorName} 
          onChange={(e) => onInputChange('directorName', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ordinaryShares">Number of Ordinary Shares</Label>
        <Input 
          id="ordinaryShares" 
          type="number" 
          value={formData.ordinaryShares} 
          onChange={(e) => onInputChange('ordinaryShares', e.target.value)}
        />
      </div>
    </div>
  )
}