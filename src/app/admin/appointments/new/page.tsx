'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Building2, 
  Stethoscope, 
  PlusCircle, 
  Search,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { createAdministrativeAppointmentAction } from '@/app/admin/appointments/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function AdminNewAppointmentPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  
  // Data for selects
  const [departments, setDepartments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  
  const [isGuest, setIsGuest] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    departmentId: '',
    doctorId: '',
    date: '',
    time: '',
    notes: '',
  })

  useEffect(() => {
    async function initData() {
      try {
        setFetchingData(true)
        
        // 1. Fetch Departments
        const { data: depts } = await supabase.from('departments').select('id, name').order('name')
        setDepartments(depts || [])

        // 2. Fetch Doctors
        const { data: docs } = await supabase
          .from('doctors')
          .select('id, department_id, profiles(full_name)')
          .eq('is_active', true)
        
        const formattedDocs = docs?.map((d: any) => ({
          id: d.id,
          name: d.profiles?.full_name || 'Unknown',
          departmentId: d.department_id
        })) || []
        setDoctors(formattedDocs)

        // 3. Fetch Existing Patients
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('role', 'patient')
          .order('full_name')
        setPatients(profs || [])

      } catch (error) {
        toast.error('Failed to load clinical data')
      } finally {
        setFetchingData(false)
      }
    }
    initData()
  }, [])

  const filteredDoctors = doctors.filter(d => d.departmentId === formData.departmentId)
  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePatientSelect = (patient: any) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: patient.full_name,
      // For phone/email we'd need more profile fields, but name is enough for now
    })
    setSearchQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patientName || !formData.date || !formData.time || !formData.doctorId) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Automatic conversion of 12h time to 24h if needed? 
      // For now we'll assume the input is correct or add a simple picker.
      
      const result = await createAdministrativeAppointmentAction({
        patientId: isGuest ? null : formData.patientId,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        doctorId: formData.doctorId,
        departmentId: formData.departmentId,
        appointmentDate: formData.date,
        startTime: formData.time + ":00", // Ensure HH:mm:ss
        status: 'confirmed', // Admin bookings are confirmed
        notes: formData.notes
      })

      if (result.success) {
        toast.success('Appointment created successfully!')
        router.push('/admin/appointments')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to create appointment')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-0">
      <div className="mb-8 pl-1">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-4 text-slate-500 hover:text-slate-900 -ml-2 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
          </Button>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-600">
               <PlusCircle className="h-8 w-8" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Appointment</h1>
               <p className="text-slate-500 font-medium tracking-tight">Register a physical walk-in session.</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
          <div className="lg:col-span-2 space-y-8">
            {/* Patient Selection Card */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6">
                <CardTitle className="text-lg flex items-center gap-2">
                   <User className="h-5 w-5 text-blue-400" /> Patient Details
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                   <Button 
                    type="button"
                    variant={!isGuest ? "default" : "ghost"}
                    size="sm"
                    className={cn("rounded-lg text-xs font-bold uppercase", !isGuest && "bg-blue-500")}
                    onClick={() => setIsGuest(false)}
                   >
                     Existing Account
                   </Button>
                   <Button 
                    type="button"
                    variant={isGuest ? "default" : "ghost"}
                    size="sm"
                    className={cn("rounded-lg text-xs font-bold uppercase", isGuest && "bg-blue-500")}
                    onClick={() => setIsGuest(true)}
                   >
                     New Walk-in (Guest)
                   </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {!isGuest ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search existing patients by name..."
                        className="pl-10 h-12 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <Card className="absolute z-50 w-full mt-2 shadow-2xl rounded-xl border-slate-100 max-h-[200px] overflow-y-auto">
                           {filteredPatients.length > 0 ? (
                             filteredPatients.map(p => (
                               <div 
                                key={p.id} 
                                onClick={() => handlePatientSelect(p)}
                                className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b last:border-0"
                               >
                                 <span className="font-bold text-slate-700">{p.full_name}</span>
                                 <CheckCircle2 className={cn("h-4 w-4", formData.patientId === p.id ? "text-green-500" : "text-slate-200")} />
                               </div>
                             ))
                           ) : (
                             <div className="p-4 text-center text-slate-400 text-sm">No patients found</div>
                           )}
                        </Card>
                      )}
                    </div>
                    {formData.patientName && (
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] uppercase font-black text-green-600 tracking-widest">Selected Patient</p>
                            <p className="text-lg font-bold text-slate-800">{formData.patientName}</p>
                         </div>
                         <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, patientId: '', patientName: '' })}>Change</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-black uppercase text-slate-400">Patient Full Name*</Label>
                       <Input 
                        placeholder="e.g. John Doe"
                        className="rounded-xl h-12"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        required
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-black uppercase text-slate-400">Phone Number*</Label>
                       <div className="relative">
                         <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                         <Input 
                          placeholder="+94 XX XXX XXXX"
                          className="rounded-xl h-12 pl-10"
                          value={formData.patientPhone}
                          onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                          required
                         />
                       </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase text-slate-400">Email Address (Optional)</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                     <Input 
                      placeholder="patient@example.com"
                      className="rounded-xl h-12 pl-10"
                      value={formData.patientEmail}
                      onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                     />
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Selection Card */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 p-6">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                   <Stethoscope className="h-5 w-5 text-blue-500" /> Clinical Service
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Department*
                  </Label>
                  <Select 
                    value={formData.departmentId || ''} 
                    onValueChange={(val) => setFormData({ ...formData, departmentId: val || '', doctorId: '' })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" /> Specialist Doctor*
                  </Label>
                  <Select 
                    value={formData.doctorId || ''} 
                    onValueChange={(val) => setFormData({ ...formData, doctorId: val || '' })}
                    disabled={!formData.departmentId}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder={!formData.departmentId ? "Select department first" : "Select Doctor"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {filteredDoctors.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                      {filteredDoctors.length === 0 && formData.departmentId && (
                         <div className="p-2 text-xs text-slate-400 text-center italic">No doctors in this dept.</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Schedule Card */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden sticky top-8">
              <CardHeader className="bg-blue-600 text-white p-6">
                <CardTitle className="text-lg flex items-center gap-2">
                   <Calendar className="h-5 w-5" /> Schedule Session
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                   <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Appointment Date*</Label>
                   <Input 
                    type="date"
                    className="h-12 rounded-xl font-bold"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                   />
                </div>

                <div className="space-y-2">
                   <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time Slot*</Label>
                   <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map(t => (
                        <button 
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, time: t })}
                          className={cn(
                            "py-2 px-3 rounded-lg border-2 text-xs font-bold transition-all",
                            formData.time === t 
                              ? "bg-blue-600 border-blue-600 text-white" 
                              : "border-slate-100 hover:border-blue-200 text-slate-600"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                   <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Clinical Notes
                   </Label>
                   <textarea 
                    className="w-full rounded-xl border-slate-100 min-h-[100px] p-4 text-xs focus:ring-primary focus:border-primary border focus:outline-none transition-all"
                    placeholder="Walk-in reason or symptoms..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                   />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 p-6">
                 <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
                 >
                   {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...
                    </>
                   ) : (
                    'Confirm Walk-in'
                   )}
                 </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
    </div>
  )
}
