'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Copy, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { 
  addAvailabilitySlotAction, 
  deleteSlotAction, 
  copySlotsToNextDayAction 
} from '@/app/doctor/actions'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [slots, setSlots] = useState<any[]>([])
  const [doctorInfo, setDoctorInfo] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    availableDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '09:30'
  })

  const supabase = createClient()

  const fetchSlots = async (doctorId: string) => {
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('available_date', { ascending: true })
      .order('start_time', { ascending: true })
    setSlots(data || [])
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: doctor } = await supabase
          .from('doctors')
          .select('id')
          .eq('profile_id', user.id)
          .single()
        
        if (!doctor) return
        setDoctorInfo(doctor)
        await fetchSlots(doctor.id)
      } catch (err) {
        toast.error('Failed to load availability')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await addAvailabilitySlotAction({
        doctorId: doctorInfo.id,
        availableDate: formData.availableDate,
        startTime: formData.startTime,
        endTime: formData.endTime
      })

      if (result.success) {
        toast.success('Slot added successfully')
        await fetchSlots(doctorInfo.id)
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('Error adding slot')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    try {
      const result = await deleteSlotAction(id)
      if (result.success) {
        toast.success('Slot removed')
        setSlots(slots.filter(s => s.id !== id))
      }
    } catch (err) {
      toast.error('Failed to remove slot')
    }
  }

  const handleCopyDay = async (sourceDate: string) => {
    setSubmitting(true)
    try {
      const result = await copySlotsToNextDayAction(doctorInfo.id, sourceDate)
      if (result.success) {
        toast.success(`Slots copied to ${format(addDays(new Date(sourceDate), 1), 'MMM dd')}`)
        await fetchSlots(doctorInfo.id)
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('Failed to copy slots')
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

  // Group slots by date for the UI
  const groupedSlots = slots.reduce((acc: any, slot: any) => {
    if (!acc[slot.available_date]) acc[slot.available_date] = []
    acc[slot.available_date].push(slot)
    return acc
  }, {})

  return (
    <div className="p-0">
      <div className="mb-8 pl-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Availability Manager</h1>
          <p className="text-slate-500 font-medium">Define your consultation slots and manage your weekly schedule.</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Form Area */}
           <div className="lg:col-span-1">
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden sticky top-8">
                 <CardHeader className="bg-slate-900 text-white p-8">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                       <Plus className="h-5 w-5 text-blue-400" /> New Time Slot
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Date</Label>
                       <Input 
                        type="date" 
                        className="rounded-xl h-12 font-bold"
                        value={formData.availableDate}
                        onChange={(e) => setFormData({...formData, availableDate: e.target.value})}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Start Time</Label>
                          <Input 
                            type="time" 
                            className="rounded-xl h-12 font-bold"
                            value={formData.startTime}
                            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">End Time</Label>
                          <Input 
                            type="time" 
                            className="rounded-xl h-12 font-bold"
                            value={formData.endTime}
                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                          />
                       </div>
                    </div>
                 </CardContent>
                 <CardFooter className="p-8 pt-0">
                    <Button 
                      onClick={handleAddSlot} 
                      disabled={submitting}
                      className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
                    >
                       {submitting ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-5 w-5" />}
                       Create Slot
                    </Button>
                 </CardFooter>
              </Card>
           </div>

           {/* Slots Timeline Area */}
           <div className="lg:col-span-2 space-y-8">
              {Object.keys(groupedSlots).length === 0 ? (
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-32 text-center bg-white/50 backdrop-blur-sm">
                   <Clock className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold italic">You haven't configured any availability yet.</p>
                   <p className="text-slate-300 text-xs mt-1">Start by adding a slot for today on the left.</p>
                </Card>
              ) : Object.keys(groupedSlots).sort().map(date => (
                <Card key={date} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group">
                   <div className="bg-white p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                         <div className="h-14 w-14 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
                            <span className="text-[10px] font-black uppercase leading-none opacity-60">{format(new Date(date), 'MMM')}</span>
                            <span className="text-xl font-black">{format(new Date(date), 'dd')}</span>
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">{format(new Date(date), 'EEEE, MMMM do')}</h3>
                            <p className="text-xs font-bold text-slate-400">{groupedSlots[date].length} active slots configured</p>
                         </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleCopyDay(date)}
                        className="rounded-xl border-slate-200 font-bold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all group-hover:border-blue-200"
                      >
                         <Copy className="h-4 w-4 mr-2" /> Copy to Next Day
                      </Button>
                   </div>
                   <div className="bg-slate-50/50 border-t border-slate-50 p-6 flex flex-wrap gap-3">
                      {groupedSlots[date].map((slot: any) => (
                         <div 
                          key={slot.id} 
                          className={cn(
                            "flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border transition-all group/slot",
                            slot.is_booked ? "border-green-100 bg-green-50/20" : "border-slate-100 hover:border-blue-200 hover:shadow-md"
                          )}
                         >
                            <div className="flex flex-col">
                               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Duration</p>
                               <div className="flex items-center font-black text-slate-800">
                                  {slot.start_time.substring(0,5)}
                                  <ArrowRight className="h-3 w-3 mx-2 text-slate-300" />
                                  {slot.end_time.substring(0,5)}
                               </div>
                            </div>
                            
                            <div className="h-8 border-r border-slate-100" />

                            <div className="flex items-center gap-2">
                               {slot.is_booked ? (
                                 <Badge className="bg-green-100 text-green-700 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter shadow-none">Booked</Badge>
                               ) : (
                                 <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                </Card>
              ))}
           </div>
        </div>
    </div>
  )
}
