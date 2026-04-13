'use client'

import { DashboardNavbar } from '@/components/layout/DashboardNavbar'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  PlusCircle, 
  History,
  LayoutDashboard,
  CalendarCheck
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)

        // Fetch history
        const { data: aptData } = await supabase
          .from('appointments')
          .select(`
            *,
            doctor:doctors(
              profiles(full_name)
            )
          `)
          .eq('patient_id', user.id)
          .order('appointment_date', { ascending: false })
          .order('start_time', { ascending: false })
        
        if (aptData) setAppointments(aptData)
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  )

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 text-slate-900">
      <DashboardNavbar role="patient" />
      
      {/* Header / Welcome Section */}
      <div className="bg-white border-b border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <User className="h-10 w-10 font-black" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Patient Dashboard</h1>
                <p className="text-slate-500 font-bold mt-2 text-lg">
                  Welcome back, <span className="text-primary font-black uppercase tracking-wide">{profile?.full_name?.split(' ')[0] || 'Member'}</span>
                </p>
              </div>
            </div>
            <Link href="/book" className={buttonVariants({ className: "h-14 px-8 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform" })}>
              <PlusCircle className="mr-2 h-5 w-5" /> Book New Appointment
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-lg bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Visits</p>
                  <p className="text-4xl font-bold mt-2">{appointments.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <History className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Upcoming</p>
                  <p className="text-4xl font-bold mt-2">{upcomingAppointments.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green-500/10 group-hover:text-green-600 transition-colors">
                  <CalendarCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden">
            <CardContent className="p-6 relative">
               <div className="relative z-10">
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Next Appt</p>
                 {upcomingAppointments.length > 0 ? (
                   <div className="mt-3">
                     <p className="text-lg font-bold">{format(new Date(upcomingAppointments[0].appointment_date), 'PPP')}</p>
                     <p className="text-sm text-slate-400 flex items-center mt-1">
                       <Clock className="h-3 w-3 mr-1" /> {upcomingAppointments[0].start_time.substring(0, 5)} with {upcomingAppointments[0].doctor?.profiles?.full_name}
                     </p>
                   </div>
                 ) : (
                   <p className="text-lg font-medium mt-3 opacity-60 italic">No scheduled visits</p>
                 )}
               </div>
               <LayoutDashboard className="absolute -bottom-4 -right-4 h-24 w-24 opacity-5" />
            </CardContent>
          </Card>
        </div>

        {/* Full History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Your Appointment History</h2>
            <Badge variant="outline" className="bg-white px-3 py-1">
               {appointments.length} Consultations
            </Badge>
          </div>

          <Card className="border-none shadow-xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-bold py-4">Date & Time</TableHead>
                  <TableHead className="font-bold py-4">Specialist</TableHead>
                  <TableHead className="font-bold py-4 text-center">Status</TableHead>
                  <TableHead className="text-right font-bold py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center text-slate-400 italic">
                       Loading your health records...
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <History className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">No appointments found</p>
                          <p className="text-sm text-slate-500">Your medical history will appear here once you book an appointment.</p>
                        </div>
                        <Link href="/book" className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Book Your First Appointment
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((apt) => (
                    <TableRow key={apt.id} className="hover:bg-slate-50/50 transition-all border-slate-100">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-900">{format(new Date(apt.appointment_date), 'PPP')}</span>
                           <span className="text-xs text-slate-500 font-medium flex items-center mt-1">
                             <Clock className="h-3 w-3 mr-1" /> {apt.start_time.substring(0, 5)}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                         <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center mr-3 border border-primary/10">
                               <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-semibold text-slate-700">{apt.doctor?.profiles?.full_name}</span>
                         </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge 
                          className={cn(
                            "font-bold uppercase text-[10px] tracking-widest px-2.5 py-0.5 border-none",
                            apt.status === 'confirmed' ? "bg-green-100 text-green-700" :
                            apt.status === 'cancelled' ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          )}
                        >
                          {apt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                         <Link 
                           href={`/book?doctor_name=${encodeURIComponent(apt.doctor?.profiles?.full_name || '')}`} 
                           className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                         >
                            Book Again <ChevronRight className="ml-1 h-3 w-3" />
                         </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  )
}
