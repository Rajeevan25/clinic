'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building2, 
  Stethoscope, 
  Image as ImageIcon, 
  Loader2, 
  RefreshCw,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { createDoctorAction } from '@/app/admin/doctors/actions'
import { toast } from 'sonner'

export default function NewDoctorPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [fetchingDepts, setFetchingDepts] = useState(true)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    departmentId: '',
    specialization: '',
    bio: '',
    imageUrl: '',
  })

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
          .order('name')
        if (error) throw error
        setDepartments(data || [])
      } catch (err) {
        toast.error('Failed to load departments')
      } finally {
        setFetchingDepts(false)
      }
    }
    fetchDepartments()
  }, [])

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let retVal = ""
    for (let i = 0; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData({ ...formData, password: retVal })
    toast.info('Random password generated!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validations
    if (!formData.departmentId || formData.departmentId === 'none') {
      toast.error('Department is required')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const result = await createDoctorAction(formData)
      
      if (result.success) {
        toast.success('Doctor account and profile created successfully!')
        router.push('/admin/doctors')
      } else {
        toast.error(result.error || 'Failed to create doctor')
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-0">
      <div className="mb-8 pl-1">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-4 text-slate-500 hover:text-slate-900 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctors
          </Button>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600/10 rounded-2xl">
               <Stethoscope className="h-8 w-8 text-blue-600" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-slate-900">Add New Doctor</h1>
               <p className="text-slate-500">Create a login account and clinical profile for a specialist.</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
          <div className="lg:col-span-2 space-y-8">
            {/* Account Credentials */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 p-6">
                <CardTitle className="text-xl flex items-center gap-2">
                   <Lock className="h-5 w-5 text-blue-500" /> Login Credentials
                </CardTitle>
                <CardDescription>Setup the doctor's access to the portal.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-slate-700">Email Address*</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="doctor@clinic.com" 
                        className="pl-10 h-12 rounded-xl"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-bold text-slate-700">Login Password*</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          id="password" 
                          type="text" // Visible for admin creation
                          placeholder="Min 6 characters" 
                          className="pl-10 h-12 rounded-xl"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={generatePassword}
                        className="h-12 rounded-xl px-3 bg-slate-100 hover:bg-slate-200"
                        title="Generate random password"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100 mt-4">
                   <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-700 leading-relaxed">
                     The doctor will be able to log in immediately using these credentials. Ensure you share the password securely with them.
                   </p>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Profile */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 p-6">
                <CardTitle className="text-xl flex items-center gap-2">
                   <User className="h-5 w-5 text-blue-500" /> Clinical Profile
                </CardTitle>
                <CardDescription>Professional details for the public directory.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-bold text-slate-700">Full Name*</Label>
                    <Input 
                      id="fullName" 
                      placeholder="e.g. Dr. Jane Smith" 
                      className="h-12 rounded-xl"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold text-slate-700">Phone Number*</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="phone" 
                        placeholder="+94 XX XXX XXXX" 
                        className="pl-10 h-12 rounded-xl"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="font-bold text-slate-700">Department*</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Select 
                        value={formData.departmentId} 
                        onValueChange={(val: string | null) => setFormData({ ...formData, departmentId: val ?? '' })}
                      >
                        <SelectTrigger className="pl-10 h-12 rounded-xl border-slate-200">
                          <SelectValue placeholder={fetchingDepts ? "Loading..." : "Select Department"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none" disabled>Choose a department</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="font-bold text-slate-700">Specialization*</Label>
                    <Input 
                      id="specialization" 
                      placeholder="e.g. Consultant Cardiologist" 
                      className="h-12 rounded-xl"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="font-bold text-slate-700">Doctor's Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Describe professional experience and certifications..." 
                    className="min-h-[150px] rounded-xl"
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-6 flex justify-end gap-3 border-t">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-8 h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving specialist...
                    </>
                  ) : (
                    'Create Specialist Account'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar Info & Image */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
               <CardHeader className="bg-blue-600 text-white p-6">
                 <CardTitle className="text-lg">Specialist Image</CardTitle>
                 <CardDescription className="text-blue-100">Professional portrait URL.</CardDescription>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-sm font-bold text-slate-700">Image URL</Label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="imageUrl" 
                        placeholder="https://..." 
                        className="pl-10 rounded-xl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="aspect-[4/5] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group relative">
                    {formData.imageUrl ? (
                      <>
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x500?text=Invalid+Image')}
                        />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold uppercase">Image Preview</span>
                         </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                         <User className="h-12 w-12 text-slate-200 mx-auto mb-2" />
                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-tight">Portrait Preview</p>
                      </div>
                    )}
                  </div>
               </CardContent>
            </Card>
          </div>
        </form>
    </div>
  )
}
