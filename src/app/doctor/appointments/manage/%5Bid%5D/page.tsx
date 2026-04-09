'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Stethoscope, 
  Pill, 
  CheckCircle2, 
  Loader2,
  Calendar,
  Clock,
  History,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createMedicalRecordAction, getPatientMedicalHistory } from '@/app/doctor/actions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function ConsultationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [appointment, setAppointment] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [formData, setFormData] = useState({
    diagnosis: '',
    prescription: '',
    clinicalNotes: ''
  })
  
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        // 1. Fetch Appointment Details
        const { data: appt, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(*)
          `)
          .eq('id', id)
          .single()
        
        if (error || !appt) {
          toast.error('Appointment not found')
          router.push('/doctor/appointments')
          return
        }
        setAppointment(appt)

        // 2. Fetch Patient History if they have an account
        if (appt.patient_id) {
           const historyData = await getPatientMedicalHistory(appt.patient_id)
           setHistory(historyData)
        }

      } catch (error) {
        toast.error('Error loading consultation')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.diagnosis || !formData.prescription) {
      toast.error('Diagnosis and Prescription are required')
      return
    }

    setSubmitting(true)
    try {
      const result = await createMedicalRecordAction({
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        clinicalNotes: formData.clinicalNotes
      })

      if (result.success) {
        toast.success('Consultation completed successfully!')
        router.push('/doctor/appointments')
      } else {
        toast.error(result.error || 'Failed to save record')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule
          </Button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Consultation</h1>
          <p className="text-slate-500 font-medium">Record clinical findings and prescribe treatments.</p>
       </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-8">
               <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-white border-b border-slate-50 p-8">
                     <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Stethoscope className="h-6 w-6 text-blue-600" /> Clinical Assessment
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Diagnosis / Impression*</Label>
                        <textarea 
                           className="w-full min-h-[120px] rounded-2xl border-slate-100 p-5 text-sm font-medium focus:ring-primary focus:border-primary border focus:outline-none transition-all"
                           placeholder="Primary clinical diagnosis..."
                           value={formData.diagnosis}
                           onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                        />
                     </div>

                     <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Clinical Notes</Label>
                        <textarea 
                           className="w-full min-h-[150px] rounded-2xl border-slate-100 p-5 text-sm font-medium focus:ring-primary focus:border-primary border focus:outline-none transition-all"
                           placeholder="Symptoms, exam findings, and observations..."
                           value={formData.clinicalNotes}
                           onChange={(e) => setFormData({...formData, clinicalNotes: e.target.value})}
                        />
                     </div>

                     <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Prescription & Plan*</Label>
                        <div className="relative">
                           <Pill className="absolute left-4 top-5 h-5 w-5 text-slate-400" />
                           <textarea 
                              className="w-full min-h-[150px] rounded-2xl border-slate-100 p-5 pl-12 text-sm font-bold text-blue-700 bg-blue-50/30 border-blue-100 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-blue-300"
                              placeholder="Medicines, dosage, and next steps..."
                              value={formData.prescription}
                              onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                           />
                        </div>
                        <p className="text-[10px] text-slate-400 italic">This will be shared with the patient via their portal.</p>
                     </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 p-8 justify-end">
                     <Button 
                       onClick={handleSubmit} 
                       disabled={submitting}
                       className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
                     >
                        {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                        Complete & Save Record
                     </Button>
                  </CardFooter>
               </Card>
            </div>

            {/* Patient Context Sidebar */}
            <div className="space-y-6">
               <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white p-6">
                     <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">Patient File</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center font-black text-blue-600 text-xl">
                           {(appointment?.patient_name || appointment?.patient?.full_name || '?').charAt(0)}
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900 text-lg leading-tight">
                              {appointment?.patient_name || appointment?.patient?.full_name}
                           </h3>
                           <p className="text-xs font-medium text-slate-500">{appointment?.patient?.gender || 'N/A'} • {appointment?.patient?.date_of_birth || 'No DOB'}</p>
                        </div>
                     </div>
                     
                     <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-black uppercase text-slate-400">Phone</span>
                           <span className="text-sm font-bold text-slate-700">{appointment?.patient_phone || appointment?.patient?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-black uppercase text-slate-400">Visit Reason</span>
                           <span className="text-sm font-bold text-slate-700">{appointment?.notes || 'General Visit'}</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 pb-0">
                     <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <History className="h-4 w-4" /> Medical History
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                     <div className="space-y-6">
                        {history.length === 0 ? (
                           <div className="text-center py-6 text-slate-400 italic text-xs font-medium bg-slate-50 rounded-2xl border border-dashed">
                              No previous records found.
                           </div>
                        ) : history.map((record, idx) => (
                           <div key={record.id} className="relative pl-6 pb-6 last:pb-0 border-l border-slate-100">
                              <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-blue-500" />
                              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">
                                 {record.appointment?.appointment_date || format(new Date(record.created_at), 'yyyy-MM-dd')}
                              </p>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1">{record.diagnosis}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 italic">{record.prescription}</p>
                           </div>
                        ))}
                     </div>
                  </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
