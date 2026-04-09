'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Image as ImageIcon, 
  Loader2,
  X,
  Plus,
  HeartPulse,
  Baby,
  Stethoscope,
  Smile,
  Eye,
  Microscope,
  Activity,
  Ear,
  Brain,
  Scissors
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/layout/Sidebar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const AVAILABLE_ICONS = [
  { name: 'Stethoscope', icon: Stethoscope },
  { name: 'HeartPulse', icon: HeartPulse },
  { name: 'Baby', icon: Baby },
  { name: 'Smile', icon: Smile },
  { name: 'Eye', icon: Eye },
  { name: 'Microscope', icon: Microscope },
  { name: 'Activity', icon: Activity },
  { name: 'Ear', icon: Ear },
  { name: 'Brain', icon: Brain },
  { name: 'Scissors', icon: Scissors },
]

export default function EditDepartmentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [doctors, setDoctors] = useState<any[]>([])
  const [fetchingDoctors, setFetchingDoctors] = useState(true)
  const [currentService, setCurrentService] = useState('')

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    head_doctor_id: string;
    image_url: string;
    icon: string;
    services: string[];
  }>({
    name: '',
    description: '',
    head_doctor_id: '',
    image_url: '',
    icon: 'Stethoscope',
    services: [],
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setFetching(true)
        
        // 1. Fetch Department Details
        const { data: dept, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .eq('id', id)
          .single()

        if (deptError) throw deptError
        if (dept) {
          setFormData({
            name: dept.name,
            description: dept.description || '',
            head_doctor_id: dept.head_doctor_id || 'none',
            image_url: dept.image_url || '',
            icon: dept.icon || 'Stethoscope',
            services: dept.services || [],
          })
        }

        // 2. Fetch Doctors for the dropdown
        const { data: docs, error: docsError } = await supabase
          .from('doctors')
          .select(`
            id,
            profiles (
              full_name
            )
          `)
          .eq('is_active', true)
          .eq('department_id', id)

        if (docsError) throw docsError
        
        const formattedDoctors = docs?.map((doc: any) => ({
          id: doc.id,
          name: doc.profiles?.full_name || 'Unknown Doctor'
        })) || []
        
        setDoctors(formattedDoctors)
      } catch (error: any) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load department details')
        router.push('/admin/departments')
      } finally {
        setFetching(false)
        setFetchingDoctors(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, supabase, router])

  const handleAddService = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return
    if (e.type === 'keydown') e.preventDefault()
    
    if (currentService.trim()) {
      if (!formData.services.includes(currentService.trim())) {
        setFormData({
          ...formData,
          services: [...formData.services, currentService.trim()]
        })
      }
      setCurrentService('')
    }
  }

  const removeService = (serviceToRemove: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s !== serviceToRemove)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Department name is required')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('departments')
        .update({
          name: formData.name,
          description: formData.description || null,
          head_doctor_id: formData.head_doctor_id === 'none' ? null : formData.head_doctor_id,
          image_url: formData.image_url || null,
          icon: formData.icon,
          services: formData.services,
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Department updated successfully!')
      router.push('/admin/departments')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating department:', error)
      toast.error(error.message || 'Failed to update department')
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Departments
          </Button>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-primary/10 rounded-2xl">
               <Building2 className="h-8 w-8 text-primary" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Department</h1>
               <p className="text-slate-500 font-medium tracking-tight">Modify "{formData.name}" unit details.</p>
             </div>
          </div>
        </div>

        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 px-8 py-6">
                  <CardTitle className="text-xl">Primary Information</CardTitle>
                  <CardDescription>Update the core details for this department.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-bold text-slate-700">Department Name*</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g. Cardiology" 
                        className="h-12 rounded-xl focus:ring-primary/20 border-slate-200"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="head" className="text-sm font-bold text-slate-700">Head of Department</Label>
                      <Select 
                        value={formData.head_doctor_id} 
                        onValueChange={(value: string | null) => setFormData({ ...formData, head_doctor_id: value ?? 'none' })}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-slate-200">
                          <SelectValue placeholder={fetchingDoctors ? "Loading..." : "Assign a head"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none">No head assigned</SelectItem>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold text-slate-700">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Briefly describe the clinical focus..." 
                      className="min-h-[120px] rounded-xl border-slate-200 focus:ring-primary/20"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <Label className="text-sm font-bold text-slate-700 block">Department Icon</Label>
                    <div className="grid grid-cols-5 gap-3">
                      {AVAILABLE_ICONS.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: item.name })}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                            formData.icon === item.name 
                              ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                              : 'border-slate-50 hover:border-slate-200 text-slate-400'
                          }`}
                        >
                          <item.icon className="h-6 w-6 mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <Label htmlFor="services" className="text-sm font-bold text-slate-700">Key Services</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="services" 
                        placeholder="Type a service and press Enter..." 
                        value={currentService}
                        onChange={(e) => setCurrentService(e.target.value)}
                        onKeyDown={handleAddService}
                        className="h-12 rounded-xl border-slate-200"
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={handleAddService}
                        className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {formData.services.map((service) => (
                        <Badge 
                          key={service} 
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border-none hover:bg-slate-200 flex items-center gap-2 group"
                        >
                          <span className="font-medium">{service}</span>
                          <X 
                            className="h-3 w-3 cursor-pointer text-slate-400 group-hover:text-red-500 transition-colors" 
                            onClick={() => removeService(service)}
                          />
                        </Badge>
                      ))}
                      {formData.services.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No services added yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 px-8 py-6 flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => router.back()}
                    disabled={loading}
                    className="rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="rounded-xl font-black px-8 h-12 shadow-lg shadow-primary/20">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden sticky top-8">
              <CardHeader className="bg-primary text-white p-6">
                <CardTitle className="text-lg">Image & Branding</CardTitle>
                <CardDescription className="text-primary-foreground/70">Visual assets for the department.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-sm font-bold text-slate-700">Cover Image URL</Label>
                  <Input 
                    id="image_url" 
                    placeholder="Unsplash or direct URL..." 
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="rounded-xl border-slate-200"
                  />
                </div>
                
                <div className="rounded-2xl border-2 border-dashed border-slate-200 aspect-video overflow-hidden bg-slate-50 flex items-center justify-center group relative shadow-inner">
                  {formData.image_url ? (
                    <>
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL')}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-white text-xs font-bold uppercase tracking-wider">Image Preview</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-tight">No image<br/>selected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
