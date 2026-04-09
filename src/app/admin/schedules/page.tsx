'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, Calendar, Clock, User, Building2, Search, FilterX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function SchedulesPage() {
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const supabase = createClient()

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDoctor, setFilterDoctor] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Fetch Doctors
      const { data: docData } = await supabase
        .from('doctors')
        .select('id, profiles(full_name)')
      setDoctors(docData || [])

      // Fetch Departments
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
      setDepartments(deptData || [])

      await fetchSchedules()
    } catch (err) {
      toast.error('Failed to load filter data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      let query = supabase
        .from('schedules')
        .select(`
          *,
          doctor:doctors(
            id,
            profiles(full_name),
            department:departments!doctors_department_id_fkey(name, id)
          )
        `)
        .order('available_date', { ascending: true })
        .order('start_time', { ascending: true })

      // Note: Advanced filtering like filtering by nested doctor profile name is easier on client side 
      // for this layout, or we can use Supabase filters if we structure correctly.
      // I'll apply primary DB filters here and refine in UI.

      if (filterDoctor !== 'all') {
        query = query.eq('doctor_id', filterDoctor)
      }

      if (filterStatus !== 'all') {
        query = query.eq('is_booked', filterStatus === 'booked')
      }

      if (filterDate) {
        query = query.eq('available_date', filterDate)
      }

      const { data, error } = await query
      if (error) throw error
      setSchedules(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load schedules')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Refetch when primary DB filters change
  useEffect(() => {
    fetchSchedules()
  }, [filterDoctor, filterStatus, filterDate])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this availability slot?')) return

    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id)
      if (error) throw error
      
      toast.success('Schedule slot removed')
      setSchedules(schedules.filter(s => s.id !== id))
    } catch (err) {
      toast.error('Failed to delete schedule')
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setFilterDoctor('all')
    setFilterDepartment('all')
    setFilterStatus('all')
    setFilterDate('')
  }

  // Client-side refinement (e.g. searching and department name match)
  const displaySchedules = schedules.filter(s => {
    const matchesSearch = s.doctor?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = filterDepartment === 'all' || s.doctor?.department?.id === filterDepartment
    return matchesSearch && matchesDept
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Doctor Schedules</h1>
          <p className="text-slate-500 font-medium">Global view of clinical availability and working hours.</p>
        </div>
      </div>

        {/* Filter Bar */}
        <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl mb-8 overflow-visible">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search Doctor..." 
                  className="pl-9 h-10 rounded-xl bg-slate-50/50 border-slate-100 text-xs font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={filterDoctor} onValueChange={(v) => setFilterDoctor(v || 'all')}>
                <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 border-slate-100 text-xs font-bold">
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all" className="text-xs font-bold">All Doctors</SelectItem>
                  {doctors.map(doc => (
                    <SelectItem key={doc.id} value={doc.id} className="text-xs font-bold">{doc.profiles?.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDepartment} onValueChange={(v) => setFilterDepartment(v || 'all')}>
                <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 border-slate-100 text-xs font-bold">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                   <SelectItem value="all" className="text-xs font-bold">All Departments</SelectItem>
                   {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id} className="text-xs font-bold">{dept.name}</SelectItem>
                   ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                 <Input 
                  type="date" 
                  className="rounded-xl h-10 bg-slate-50/50 border-slate-100 text-xs font-bold flex-grow"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                 />
                 <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v || 'all')}>
                  <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 border-slate-100 text-xs font-bold w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all" className="text-xs font-bold">Any Status</SelectItem>
                    <SelectItem value="available" className="text-xs font-bold">Available</SelectItem>
                    <SelectItem value="booked" className="text-xs font-bold">Booked</SelectItem>
                  </SelectContent>
                 </Select>
              </div>

              <Button 
                variant="ghost" 
                onClick={resetFilters}
                className="rounded-xl h-10 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              >
                <FilterX className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedules Table */}
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 p-8">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Clock className="h-5 w-5" /></div>
               Schedule List
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">Showing {displaySchedules.length} results based on active filters.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-5 pl-8 text-xs font-black uppercase text-slate-400 tracking-widest">Doctor</TableHead>
                  <TableHead className="py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Department</TableHead>
                  <TableHead className="py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Date & Day</TableHead>
                  <TableHead className="py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Time Slot</TableHead>
                  <TableHead className="py-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Status</TableHead>
                  <TableHead className="py-5 pr-8 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displaySchedules.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                           <Calendar className="h-8 w-8 opacity-20 mb-2" />
                           <p className="font-bold italic">No matching schedules found.</p>
                        </div>
                     </TableCell>
                   </TableRow>
                ) : displaySchedules.map((schedule) => (
                  <TableRow key={schedule.id} className="group hover:bg-slate-50/80 transition-all border-b border-slate-50 last:border-0">
                    <TableCell className="py-6 pl-8">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             <User className="h-4 w-4" />
                          </div>
                          <div>
                             <p className="font-black text-slate-900 leading-tight">{schedule.doctor?.profiles?.full_name}</p>
                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Specialist</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                          <Building2 className="h-3.5 w-3.5 opacity-40" />
                          {schedule.doctor?.department?.name || 'General'}
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <p className="text-sm font-black text-slate-900">{schedule.available_date || 'Recurring'}</p>
                          {schedule.available_date && (
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                               {format(new Date(schedule.available_date), 'EEEE')}
                            </p>
                          )}
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 font-black text-blue-600">
                          <Clock className="h-4 w-4 opacity-40" />
                          {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge
                        className={cn(
                          "rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-tighter shadow-none border",
                          schedule.is_booked 
                            ? "bg-amber-100 text-amber-700 border-amber-200" 
                            : "bg-green-100 text-green-700 border-green-200"
                        )}
                       >
                         {schedule.is_booked ? 'Booked' : 'Available'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(schedule.id)}
                        className="h-9 w-9 rounded-full text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                       >
                          <Trash2 className="h-4 w-4" />
                       </Button>
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
