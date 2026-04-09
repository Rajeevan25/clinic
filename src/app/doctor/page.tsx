'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  MoreVertical,
  Check,
  X,
  Stethoscope,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [stats, setStats] = useState({ today: 0, patients: 0, completed: 0 })
  const [doctorInfo, setDoctorInfo] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        
        // 1. Get current doctor
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: doctor } = await supabase
          .from('doctors')
          .select('*, profiles(full_name)')
          .eq('profile_id', user.id)
          .single()
        
        if (!doctor) return
        setDoctorInfo(doctor)

        const todayDate = format(new Date(), 'yyyy-MM-dd')

        // 2. Fetch Today's Appointments
        const { data: appts } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(full_name)
          `)
          .eq('doctor_id', doctor.id)
          .eq('appointment_date', todayDate)
          .order('start_time', { ascending: true })
        
        setAppointments(appts || [])

        // 3. Fetch Stats
        // a. Today's count
        const todayCount = appts?.length || 0
        
        // b. Total unique patients
        const { count: patientsCount } = await supabase
          .from('appointments')
          .select('patient_id', { count: 'exact', head: true })
          .eq('doctor_id', doctor.id)
          
        // c. Completed today
        const completedCount = appts?.filter(a => a.status === 'completed').length || 0

        setStats({
          today: todayCount,
          patients: patientsCount || 0,
          completed: completedCount
        })

      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
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
      
      // Update stats if completed
      if (newStatus === 'completed') {
        setStats(prev => ({ ...prev, completed: prev.completed + 1 }))
      }
      
      toast.success(`Appointment ${newStatus} successfully`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!doctorInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
        <AlertCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Doctor Profile Not Found</h2>
        <p className="text-slate-500 font-medium">Please contact the administrator to assign your profile to a doctor record.</p>
      </div>
    )
  }

  return (
    <div className="p-0">
      <div className="mb-8 flex items-end justify-between pl-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {doctorInfo.profiles?.full_name}</h1>
          <p className="text-slate-500 font-medium tracking-tight">You have {stats.today} appointments scheduled for today.</p>
        </div>
          <div className="text-right hidden md:block">
             <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Today’s Bookings', value: stats.today, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Patients', value: stats.patients, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Completed Today', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all">
              <CardContent className="p-8 flex items-center space-x-6">
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                  <stat.icon className={cn("h-8 w-8", stat.color)} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Appointments Table */}
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 bg-white border-b border-slate-50">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Today's Schedule</CardTitle>
              <CardDescription className="font-medium text-slate-500">Manage and track your appointments for {format(new Date(), 'MMM dd')}.</CardDescription>
            </div>
            <Link href="/doctor/appointments">
              <Button variant="outline" className="rounded-xl border-slate-200 font-bold hover:bg-slate-50">View Full Schedule</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-5 pl-8 text-xs font-black uppercase text-slate-400 tracking-widest">Time</TableHead>
                  <TableHead className="py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Patient Name</TableHead>
                  <TableHead className="py-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Status</TableHead>
                  <TableHead className="py-5 pr-8 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="h-40 text-center text-slate-400 italic font-medium">
                        No appointments found for today.
                     </TableCell>
                  </TableRow>
                ) : appointments.map((apt) => (
                  <TableRow key={apt.id} className="group hover:bg-slate-50 transition-colors">
                    <TableCell className="py-6 pl-8 font-black text-blue-600 text-lg">
                      <div className="flex items-center">
                        <Clock className="mr-3 h-5 w-5 opacity-40" />
                        {apt.start_time.substring(0, 5)}
                      </div>
                    </TableCell>
                    <TableCell>
                       <p className="font-bold text-slate-900 mb-0.5">{apt.patient_name || apt.patient?.full_name || 'Guest Patient'}</p>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Click to view records</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-none border", getStatusColor(apt.status))}>
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full h-10 w-10")}>
                            <MoreVertical className="h-5 w-5 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-2 border-slate-100 shadow-2xl">
                          <DropdownMenuItem className="rounded-lg p-3 text-blue-600 font-bold focus:bg-blue-50" onClick={() => updateStatus(apt.id, 'confirmed')}>
                            <Check className="mr-3 h-4 w-4" /> Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg p-3 text-green-600 font-bold focus:bg-green-50" onClick={() => updateStatus(apt.id, 'completed')}>
                            <CheckCircle2 className="mr-3 h-4 w-4" /> Start Consultation
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg p-3 text-red-600 font-bold focus:bg-red-50" onClick={() => updateStatus(apt.id, 'cancelled')}>
                            <X className="mr-3 h-4 w-4" /> Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  )
}
