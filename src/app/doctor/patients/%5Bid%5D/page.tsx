'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  History, 
  Calendar, 
  Stethoscope, 
  Pill,
  MapPin,
  Clock,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { getPatientMedicalHistory } from '@/app/doctor/actions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function PatientFilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        // 1. Fetch Profile
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error || !prof) {
          toast.error('Patient record not found')
          router.push('/doctor/patients')
          return
        }
        setPatient(prof)

        // 2. Fetch full history
        const historyData = await getPatientMedicalHistory(id as string)
        setRecords(historyData)

      } catch (err) {
        toast.error('Failed to load patient history')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-blue-600 shadow-xl shadow-blue-500/20 flex items-center justify-center font-black text-white text-3xl">
                   {patient?.full_name?.charAt(0)}
                </div>
                <div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{patient?.full_name}</h1>
                   <div className="flex items-center gap-3 mt-2">
                      <Badge className="bg-blue-50 text-blue-600 border-blue-100 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-none">
                         {patient?.gender || 'N/A'}
                      </Badge>
                      <span className="text-slate-400 font-bold text-sm">•</span>
                      <p className="text-slate-500 font-bold text-sm">Born: {patient?.date_of_birth || 'Not Recorded'}</p>
                   </div>
                </div>
             </div>
             <div className="flex gap-3">
                <Button className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-blue-500/10">
                   Schedule Follow-up
                </Button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Basic Info Sidebar */}
           <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                 <CardHeader className="p-6 pb-0">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Details</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Phone className="h-4 w-4" /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400">Phone</p>
                          <p className="text-sm font-bold text-slate-700">{patient?.phone || 'Not available'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin className="h-4 w-4" /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400">Address</p>
                          <p className="text-sm font-bold text-slate-700">{patient?.address || 'Not available'}</p>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-slate-900 text-white">
                 <CardHeader className="p-6">
                    <CardTitle className="text-2xl font-black tracking-tight">{records.length}</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Consultations</CardDescription>
                 </CardHeader>
              </Card>
           </div>

           {/* Medical History Timeline */}
           <div className="lg:col-span-3 space-y-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <History className="h-6 w-6 text-blue-600" /> Medical History Timeline
                 </h2>
              </div>

              {records.length === 0 ? (
                 <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-20 text-center">
                    <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic">No medical records found for this patient.</p>
                 </Card>
              ) : (
                <div className="space-y-6">
                   {records.map((record) => (
                      <Card key={record.id} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group hover:scale-[1.01] transition-all">
                         <div className="bg-white p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-1 border-r border-slate-50 pr-4">
                               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Session Date</p>
                               <p className="text-lg font-black text-slate-900">{record.appointment?.appointment_date || format(new Date(record.created_at), 'MMM dd, yyyy')}</p>
                               <div className="mt-4 flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                     <Stethoscope className="h-3 w-3 text-blue-500" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">Dr. {record.doctor?.profiles?.full_name}</span>
                               </div>
                            </div>
                            <div className="md:col-span-3 space-y-6">
                               <div>
                                  <Badge className="bg-red-50 text-red-600 border-red-100 mb-2 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter shadow-none">Diagnosis</Badge>
                                  <p className="text-xl font-black text-slate-800 leading-tight">{record.diagnosis}</p>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div>
                                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1 mb-2">
                                        <FileText className="h-3 w-3" /> Clinical Notes
                                     </p>
                                     <p className="text-xs font-medium text-slate-500 leading-relaxed italic">{record.clinical_notes || 'No detailed notes provided.'}</p>
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-1 mb-2">
                                        <Pill className="h-3 w-3" /> Prescriptions
                                     </p>
                                     <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-50">
                                        <p className="text-xs font-bold text-blue-700 leading-relaxed whitespace-pre-wrap">{record.prescription}</p>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </Card>
                   ))}
                </div>
              )}
           </div>
        </div>
    </div>
  )
}
