'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Trash2,
  Filter,
  MoreVertical,
  Check,
  PlusCircle,
  Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { updateAppointmentStatusAction, deleteAppointmentAction } from '@/app/admin/appointments/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { sendNotificationAction } from '@/app/actions/notifications'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [notifData, setNotifData] = useState({ title: '', message: '', type: 'info' })
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!patient_id(full_name),
          doctor:doctors(
            profiles(full_name)
          ),
          department:departments(name)
        `)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data || [])
    } catch (error: any) {
      toast.error('Failed to load appointments')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [filterStatus])

  const handleStatusChange = async (appt: any, newStatus: any) => {
    try {
      const result = await updateAppointmentStatusAction(
        appt.id,
        newStatus,
        appt.patient_id,
        appt.doctor?.profiles?.full_name || 'Medical Specialist',
        appt.appointment_date
      )

      if (result.success) {
        toast.success(`Appointment ${newStatus}`)
        // Update local state
        setAppointments(appointments.map(a => 
          a.id === appt.id ? { ...a, status: newStatus } : a
        ))
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment record?')) return
    
    try {
      const result = await deleteAppointmentAction(id)
      if (result.success) {
        toast.success('Appointment deleted')
        setAppointments(appointments.filter(a => a.id !== id))
      } else {
        toast.error(result.error || 'Failed to delete')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    }
  }

  const statusStyles: Record<string, string> = {
    confirmed: 'text-green-600 bg-green-50 border-green-200',
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
    completed: 'text-blue-600 bg-blue-50 border-blue-200',
  }

  const handleSendNotification = async () => {
    if (!selectedPatient || !notifData.title || !notifData.message) {
      toast.error('Please fill all fields')
      return
    }

    setIsSending(true)
    const result = await sendNotificationAction(
      selectedPatient.id,
      notifData.title,
      notifData.message,
      notifData.type
    )
    setIsSending(false)

    if (result.success) {
      toast.success('Notification sent to patient')
      setIsNotifyDialogOpen(false)
      setNotifData({ title: '', message: '', type: 'info' })
    } else {
      toast.error('Failed to send notification: ' + result.error)
    }
  }

  return (
    <div className="p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 font-medium">Manage and schedule clinical sessions.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-50">
          {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
                filterStatus === status ? "bg-primary text-white" : "text-slate-400 hover:text-slate-900"
              )}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </Button>
          ))}
        </div>
        <Link href="/admin/appointments/new">
          <Button className="shadow-lg shadow-blue-500/20 rounded-xl h-12 px-6 font-bold">
            <PlusCircle className="mr-2 h-5 w-5" /> New Appointment
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Appointment Records</CardTitle>
                <CardDescription>
                  {appointments.length} appointments {filterStatus !== 'all' ? `marked as ${filterStatus}` : 'total'}
                </CardDescription>
              </div>
              <Filter className="h-5 w-5 text-slate-300" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="font-medium">Syncing appointment data...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
                 <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-500 font-bold text-lg text-slate-400">No appointments found</p>
                 <p className="text-slate-400">There are no records matching your current filter.</p>
              </div>
            ) : (
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-bold">Patient</TableHead>
                      <TableHead className="font-bold">Specialist & Dept</TableHead>
                      <TableHead className="font-bold">Schedule</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appt) => (
                      <TableRow key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                              <User className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-slate-900">{appt.patient?.full_name || 'Patient'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700 flex items-center gap-1">
                              <Stethoscope className="h-3 w-3 text-slate-400" /> {appt.doctor?.profiles?.full_name || 'Unassigned'}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {appt.department?.name || 'Medical'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-blue-500" /> {appt.appointment_date}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1.5 ml-0.5">
                              <Clock className="h-3 w-3 text-slate-400" /> {appt.start_time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-lg px-2.5 py-0.5 capitalize font-bold",
                              statusStyles[appt.status] || 'text-slate-600 bg-slate-50'
                            )}
                          >
                            {appt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                             {appt.status === 'pending' && (
                               <>
                                 <Button 
                                   size="icon" 
                                   variant="ghost" 
                                   className="h-8 w-8 text-green-600 hover:bg-green-50"
                                   onClick={() => handleStatusChange(appt, 'confirmed')}
                                 >
                                   <CheckCircle2 className="h-4 w-4" />
                                 </Button>
                                 <Button 
                                   size="icon" 
                                   variant="ghost" 
                                   className="h-8 w-8 text-red-600 hover:bg-red-50"
                                   onClick={() => handleStatusChange(appt, 'cancelled')}
                                 >
                                   <XCircle className="h-4 w-4" />
                                 </Button>
                               </>
                             )}
                             <DropdownMenu>
                               <DropdownMenuTrigger
                                 render={
                                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400">
                                     <MoreVertical className="h-4 w-4" />
                                   </Button>
                                 }
                               />
                               <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                 <DropdownMenuItem onClick={() => handleStatusChange(appt, 'completed')} className="gap-2">
                                    <Check className="h-4 w-4 text-blue-600" /> Mark Completed
                                 </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(appt, 'cancelled')} className="gap-2 text-red-600">
                                     <XCircle className="h-4 w-4" /> Cancel Session
                                  </DropdownMenuItem>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedPatient({ id: appt.patient_id, name: appt.patient?.full_name })
                                      setNotifData({
                                        title: 'Update regarding your appointment',
                                        message: `Hello ${appt.patient?.full_name || 'Patient'}, `,
                                        type: 'info'
                                      })
                                      setIsNotifyDialogOpen(true)
                                    }} 
                                    className="gap-2 text-primary focus:text-primary"
                                  >
                                     <Bell className="h-4 w-4" /> Send Notification
                                  </DropdownMenuItem>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <DropdownMenuItem onClick={() => handleDelete(appt.id)} className="gap-2 text-red-600">
                                     <Trash2 className="h-4 w-4" /> Delete Record
                                  </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Notify Dialog */}
      <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Send Notification</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Sending to: <span className="text-primary font-bold">{selectedPatient?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Alert Title</Label>
              <Input 
                value={notifData.title} 
                onChange={(e) => setNotifData({...notifData, title: e.target.value})}
                placeholder="e.g., Appointment Update"
                className="h-12 rounded-2xl bg-slate-50 border-none font-bold focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Message</Label>
              <textarea 
                className="min-h-[120px] rounded-2xl bg-slate-50 border-none p-4 font-medium text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                value={notifData.message}
                onChange={(e) => setNotifData({...notifData, message: e.target.value})}
                placeholder="Write your clinical alert message here..."
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Type</Label>
              <div className="flex gap-2">
                 {['info', 'warning', 'success', 'error'].map(t => (
                   <button
                    key={t}
                    onClick={() => setNotifData({...notifData, type: t})}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      notifData.type === t ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                   >
                     {t}
                   </button>
                 ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsNotifyDialogOpen(false)} className="rounded-xl font-bold text-slate-400">Cancel</Button>
            <Button onClick={handleSendNotification} disabled={isSending} className="rounded-xl px-8 font-black uppercase tracking-widest text-xs h-12">
              {isSending ? 'Sending...' : 'Transmit Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
