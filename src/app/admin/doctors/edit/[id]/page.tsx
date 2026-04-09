'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Building2, 
  Stethoscope, 
  Image as ImageIcon, 
  Loader2,
  Settings,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/layout/Sidebar'
import { Switch } from '../../../../../components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { updateDoctorAction } from '@/app/admin/doctors/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function EditDoctorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [departments, setDepartments] = useState<any[]>([])
  const [fetchingDepts, setFetchingDepts] = useState(true)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    departmentId: '',
    specialization: '',
    bio: '',
    imageUrl: '',
    isActive: true,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setFetching(true)
        
        // 1. Fetch Doctor Details
        const { data: doc, error: docError } = await supabase
          .from('doctors')
          .select(`
            *,
            profiles(full_name)
          `)
          .eq('id', id)
          .single()

        if (docError) throw docError
        if (doc) {
          setFormData({
            fullName: doc.profiles?.full_name || '',
            phone: doc.phone || '',
            departmentId: doc.department_id || 'none',
            specialization: doc.specialization || '',
            bio: doc.bio || '',
            imageUrl: doc.image_url || '',
            isActive: doc.is_active ?? true,
          })
        }

        // 2. Fetch Departments
        const { data: depts, error: deptsError } = await supabase
          .from('departments')
          .select('id, name')
          .order('name')
        
        if (deptsError) throw deptsError
        setDepartments(depts || [])
      } catch (error: any) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load doctor details')
        router.push('/admin/doctors')
      } finally {
        setFetching(false)
        setFetchingDepts(false)
      }
    }

    if (id) fetchData()
  }, [id, supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.departmentId || formData.departmentId === 'none') {
      toast.error('Department is required')
      return
    }

    setLoading(true)
    try {
      const result = await updateDoctorAction(id, formData)
      
      if (result.success) {
        toast.success('Doctor profile updated successfully!')
        router.push('/admin/doctors')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update doctor')
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar role="admin" />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar role="admin" />

      <main className="flex-grow p-6 lg:p-10 w-full max-w-full overflow-x-hidden">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-4 text-slate-500 hover:text-slate-900 -ml-2 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctors
          </Button>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-600">
               <Stethoscope className="h-8 w-8" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Specialist</h1>
               <p className="text-slate-500 font-medium tracking-tight">Updating profile for {formData.fullName}</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 px-8 py-6">
                <CardTitle className="text-xl flex items-center gap-2">
                   <Settings className="h-5 w-5 text-blue-500" /> Specialist Information
                </CardTitle>
                <CardDescription>Modify clinical and personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-bold text-slate-700">Full Name*</Label>
                    <Input 
                      id="fullName" 
                      placeholder="e.g. Dr. Jane Smith" 
                      className="h-12 rounded-xl focus:ring-primary/20 border-slate-200"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Phone Number*</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="phone" 
                        placeholder="+94 XX XXX XXXX" 
                        className="pl-10 h-12 rounded-xl border-slate-200"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-bold text-slate-700">Department*</Label>
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
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-sm font-bold text-slate-700">Specialization*</Label>
                    <Input 
                      id="specialization" 
                      placeholder="e.g. Consultant Cardiologist" 
                      className="h-12 rounded-xl border-slate-200"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-bold text-slate-700">Doctor's Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Describe professional experience..." 
                    className="min-h-[150px] rounded-xl border-slate-200"
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-slate-700">Active Status</Label>
                      <p className="text-xs text-slate-400">Determines if the doctor appears in the public directory.</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-bold uppercase tracking-wider", formData.isActive ? "text-green-500" : "text-slate-400")}>
                        {formData.isActive ? "Active" : "Inactive"}
                      </span>
                      <Switch 
                        checked={formData.isActive}
                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                      />
                   </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 px-8 py-6 flex justify-end gap-3 border-t">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.back()}
                  disabled={loading}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-500/20">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden sticky top-8">
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
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Image Preview</span>
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
      </main>
    </div>
  )
}
