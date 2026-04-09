'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Stethoscope, 
  Clock, 
  User, 
  Building2,
  CalendarCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

const steps = [
  { id: 1, name: 'Department', icon: Building2 },
  { id: 2, name: 'Doctor', icon: Stethoscope },
  { id: 3, name: 'Date & Time', icon: Clock },
  { id: 4, name: 'Your Details', icon: User },
]

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
]

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [dbDepartments, setDbDepartments] = useState<any[]>([])
  const [dbDoctors, setDbDoctors] = useState<any[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  
  const [formData, setFormData] = useState({
    departmentId: '',
    departmentName: '',
    doctorId: '',
    doctorName: '',
    date: undefined as Date | undefined,
    time: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  // Initial Data Fetching
  useEffect(() => {
    const initBookingData = async () => {
      setLoadingContent(true)
      
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setFormData(prev => ({
            ...prev,
            patientName: profile.full_name,
            patientEmail: user.email || '',
          }))
        }
      }

      // 2. Fetch Departments
      const { data: depts, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('name')
      
      if (deptError) {
        toast.error('Failed to load departments')
      } else {
        setDbDepartments(depts || [])
      }

      // 3. Fetch Doctors
      const { data: docs, error: docError } = await supabase
        .from('doctors')
        .select(`
          id,
          department_id,
          specialization,
          profiles (
            full_name
          )
        `)
        .eq('is_active', true)
      
      if (docError) {
        toast.error('Failed to load doctors')
      } else {
        const formattedDocs = docs?.map((d: any) => ({
          id: d.id,
          name: d.profiles?.full_name || 'Unknown',
          departmentId: d.department_id,
          specialization: d.specialization
        })) || []
        setDbDoctors(formattedDocs)
      }

      // 4. Handle Query Params
      const params = new URLSearchParams(window.location.search)
      const doctorId = params.get('doctor')
      const doctorName = params.get('doctor_name')

      if (doctorId || doctorName) {
        const doctor = (docs || []).find((d: any) => d.id === doctorId || (Array.isArray(d.profiles) ? d.profiles[0]?.full_name : d.profiles?.full_name) === doctorName)
        if (doctor) {
          const dept = (depts || []).find((dep: any) => dep.id === doctor.department_id)
          const profile = Array.isArray(doctor.profiles) ? doctor.profiles[0] : doctor.profiles
          setFormData(prev => ({ 
            ...prev, 
            doctorId: doctor.id, 
            doctorName: profile?.full_name || '',
            departmentId: doctor.department_id || '',
            departmentName: dept?.name || ''
          }))
          setCurrentStep(3)
        }
      }
      
      setLoadingContent(false)
    }

    initBookingData()
  }, [])

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const toastId = toast.loading('Booking your appointment...')

    const convertTo24h = (time: string) => {
      const [timePart, period] = time.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)
      if (period === 'PM' && hours !== 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
    }

    const { error } = await supabase.from('appointments').insert({
      patient_id: user?.id || null,
      patient_name: formData.patientName,
      patient_phone: formData.patientPhone,
      patient_email: formData.patientEmail || null,
      doctor_id: formData.doctorId || null,
      department_id: formData.departmentId || null,
      appointment_date: formData.date ? format(formData.date, 'yyyy-MM-dd') : null,
      start_time: convertTo24h(formData.time),
      status: 'pending'
    })

    setLoading(false)
    if (error) {
      toast.error(error.message, { id: toastId })
      return
    }

    toast.success('Appointment booked successfully!', { id: toastId })
    setCurrentStep(5)
  }

  const filteredDoctors = dbDoctors.filter(d => d.departmentId === formData.departmentId)

  if (loadingContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Initializing booking portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 text-slate-900">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Book Appointment</h1>
            {currentStep < 5 && (
              <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border">
                Step {currentStep} of 4
              </span>
            )}
          </div>
          
          <div className="flex justify-between relative mt-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep >= step.id
              const isCompleted = currentStep > step.id
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted ? "bg-primary border-primary text-white" :
                    isActive ? "bg-white border-primary text-primary shadow-lg shadow-primary/20" :
                    "bg-white border-slate-200 text-slate-400"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "mt-2 text-xs font-bold uppercase tracking-wider hidden md:block",
                    isActive ? "text-primary" : "text-slate-400"
                  )}>
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden bg-white mb-12">
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="p-8"
            >
              <CardDescription className="mb-6 text-base">Select the medical department you wish to visit.</CardDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dbDepartments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setFormData({ ...formData, departmentId: dept.id, departmentName: dept.name, doctorId: '', doctorName: '' })
                      setCurrentStep(2)
                    }}
                    className={cn(
                      "p-6 text-left rounded-2xl border-2 transition-all group scale-100 hover:scale-[1.02] active:scale-[0.98]",
                      formData.departmentId === dept.id 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-slate-100 hover:border-primary/20 hover:bg-slate-50"
                    )}
                  >
                    <Building2 className={cn(
                      "mb-3 h-6 w-6 transition-colors",
                      formData.departmentId === dept.id ? "text-primary" : "text-slate-400 group-hover:text-primary/60"
                    )} />
                    <span className="font-bold block text-slate-900">{dept.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <CardDescription className="text-base">Choose a specialist in {formData.departmentName}.</CardDescription>
                <Button variant="ghost" size="sm" onClick={handleBack} className="text-primary font-bold">Change Dept</Button>
              </div>
              
              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setFormData({ ...formData, doctorId: doc.id, doctorName: doc.name })
                        setCurrentStep(3)
                      }}
                      className={cn(
                        "p-6 text-left rounded-2xl border-2 transition-all flex items-center group scale-100 hover:scale-[1.02] active:scale-[0.98]",
                        formData.doctorId === doc.id 
                          ? "border-primary bg-primary/5" 
                          : "border-slate-100 hover:border-primary/20 hover:bg-slate-50"
                      )}
                    >
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-primary/10 transition-colors">
                        <User className="h-6 w-6 text-slate-400 group-hover:text-primary" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">{doc.name}</span>
                        <span className="text-sm text-slate-500">{doc.specialization || 'Specialist'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed">
                   <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                   <p className="text-slate-500 font-medium">No doctors currently available in this department.</p>
                   <Button variant="link" onClick={handleBack} className="mt-2">Try another department</Button>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <Label className="mb-4 block text-lg font-bold">Pick a Date</Label>
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    className="rounded-2xl border border-slate-100 shadow-sm"
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                  />
                </div>
                <div>
                  <Label className="mb-4 block text-lg font-bold">Available Times</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, time: t })}
                        className={cn(
                          "py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all shadow-sm",
                          formData.time === t 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-slate-50 bg-white hover:border-slate-200"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-12 flex justify-between h-14">
                <Button variant="ghost" onClick={handleBack} className="flex-1 mr-4 h-full text-slate-500 font-bold border-2 border-slate-100">Back</Button>
                <Button 
                  disabled={!formData.date || !formData.time} 
                  onClick={handleNext} 
                  className="flex-1 h-full font-bold text-lg"
                >
                  Confirm Details <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="font-bold">Full Name</Label>
                    <Input 
                      id="patientName" 
                      placeholder="Your full name"
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientPhone" className="font-bold">Phone Number</Label>
                    <Input 
                      id="patientPhone" 
                      placeholder="+94 XX XXX XXXX"
                      value={formData.patientPhone}
                      onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="font-bold">Notes (Optional)</Label>
                    <textarea 
                      id="notes" 
                      className="w-full rounded-xl border-slate-200 min-h-[100px] p-4 text-sm focus:ring-primary focus:border-primary border focus:outline-none transition-all"
                      placeholder="Mention any symptoms or specific requests..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center text-primary">
                      <CheckCircle2 className="mr-2 h-6 w-6" /> Appointment Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Specialist</span>
                        <span className="font-bold">{formData.doctorName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Department</span>
                        <span className="font-bold">{formData.departmentName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Date</span>
                        <span className="font-bold">{formData.date ? format(formData.date, 'PPP') : ''}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Time</span>
                        <span className="font-bold">{formData.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col gap-4">
                    <Button onClick={handleNext} disabled={loading || !formData.patientName || !formData.patientPhone} className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20">
                      {loading ? 'Confirming...' : 'Confirm Appointment'}
                    </Button>
                    <Button variant="ghost" onClick={handleBack} disabled={loading} className="w-full text-slate-500 font-bold">Edit Details</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center"
            >
              <div className="mb-8 inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 text-green-600">
                <CalendarCheck className="h-12 w-12" />
              </div>
              <h2 className="text-4xl font-black mb-4">You're All Set!</h2>
              <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto">
                Your appointment has been booked. You will receive a confirmation message shortly.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "font-bold rounded-2xl h-14 px-10")}>
                   Go to My Appointments
                </Link>
                <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "font-bold rounded-2xl h-14 px-10")}>
                   Back to Home
                </Link>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  )
}
