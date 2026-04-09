'use client'

import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  Check, 
  CheckCircle2, 
  X, 
  MoreVertical, 
  Loader2, 
  Calendar as CalendarIcon,
  ChevronRight,
  Search,
  Filter as FilterIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format, isToday, isFuture, isPast } from 'date-fns'
import Link from 'next/link'

export default function DoctorAppointmentsPage() {
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctorInfo, setDoctorInfo] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: doctor } = await supabase
          .from('doctors')
          .select('*, profiles(full_name)')
          .eq('profile_id', user.id)
          .single()
        
        if (!doctor) return
        setDoctorInfo(doctor)

        const { data: appts } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(full_name, phone, gender, date_of_birth)
          `)
          .eq('doctor_id', doctor.id)
          .order('appointment_date', { ascending: false })
          .order('start_time', { ascending: true })
        
        setAppointments(appts || [])
      } catch (err) {
        toast.error('Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status: newStatus } : apt
      ))
      toast.success(`Appointment ${newStatus}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  }

  const today = appointments.filter(a => isToday(new Date(a.appointment_date)))
  const upcoming = appointments.filter(a => isFuture(new Date(a.appointment_date)) && !isToday(new Date(a.appointment_date)))
  const past = appointments.filter(a => isPast(new Date(a.appointment_date)) && !isToday(new Date(a.appointment_date)))

  const AppointmentTable = ({ data }: { data: any[] }) => (
    <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-transparent">
            <TableHead className="py-4 pl-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Schedule</TableHead>
            <TableHead className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Patient & Contact</TableHead>
            <TableHead className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</TableHead>
            <TableHead className="py-4 pr-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-slate-400 py-20 italic font-medium">No appointments found in this category.</TableCell>
            </TableRow>
          ) : data.map((apt) => (
            <TableRow key={apt.id} className="group hover:bg-slate-50/80 transition-all border-b border-slate-50 last:border-0">
              <TableCell className="py-6 pl-8">
                <div className="flex flex-col">
                   <span className="font-black text-slate-900 text-sm">{format(new Date(apt.appointment_date), 'MMM dd, yyyy')}</span>
                   <div className="flex items-center text-blue-600 text-xs font-bold mt-1">
                      <Clock className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                      {apt.start_time.substring(0, 5)}
                   </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                     {apt.patient_name ? apt.patient_name.charAt(0) : apt.patient?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                     <Link 
                      href={apt.patient_id ? `/doctor/patients/${apt.patient_id}` : '#'} 
                      className={cn("font-bold text-slate-900 block", apt.patient_id ? "hover:text-blue-600 hover:underline" : "cursor-default")}
                     >
                       {apt.patient_name || apt.patient?.full_name || 'Guest Patient'}
                     </Link>
                     <p className="text-[10px] text-slate-500 font-medium">{apt.patient_phone || apt.patient?.phone || 'No phone recorded'}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge className={cn("rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter shadow-none border", statusStyles[apt.status])}>
                  {apt.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-8">
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "rounded-full h-9 w-9")}>
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl p-1.5 border-slate-100 shadow-xl min-w-[160px]">
                    {apt.status !== 'completed' && (
                      <DropdownMenuItem className="rounded-lg p-2.5 text-blue-600 font-bold focus:bg-blue-50" onClick={() => updateStatus(apt.id, 'confirmed')}>
                        <Check className="mr-3 h-4 w-4" /> Confirm
                      </DropdownMenuItem>
                    )}
                    <Link href={`/doctor/appointments/manage/${apt.id}`}>
                      <DropdownMenuItem className="rounded-lg p-2.5 text-green-600 font-bold focus:bg-green-50">
                        <CheckCircle2 className="mr-3 h-4 w-4" /> Consultation
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="rounded-lg p-2.5 text-red-600 font-bold focus:bg-red-50" onClick={() => updateStatus(apt.id, 'cancelled')}>
                      <X className="mr-3 h-4 w-4" /> Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-0">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pl-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Appointments</h1>
          <p className="text-slate-500 font-medium">Analyze and manage your schedule across all sessions.</p>
        </div>
          <div className="flex items-center gap-2">
             <div className="bg-white p-1 rounded-2xl shadow-sm border flex items-center border-slate-100">
               <div className="p-2 border-r border-slate-100">
                  <Search className="h-4 w-4 text-slate-400" />
               </div>
               <input 
                placeholder="Search patient..." 
                className="bg-transparent border-none text-xs font-bold px-3 py-2 focus:outline-none min-w-[200px]"
               />
             </div>
          </div>
        </div>

        <Tabs defaultValue="today" className="space-y-8">
          <TabsList className="bg-white border border-slate-50 rounded-2xl p-1.5 shadow-sm inline-flex">
            <TabsTrigger value="today" className="rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg shadow-blue-500/20">
              Today ({today.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
              Archives ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-0 outline-none">
             <AppointmentTable data={today} />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0 outline-none">
             <AppointmentTable data={upcoming} />
          </TabsContent>

          <TabsContent value="past" className="mt-0 outline-none">
             <AppointmentTable data={past} />
          </TabsContent>
        </Tabs>
    </div>
  )
}
