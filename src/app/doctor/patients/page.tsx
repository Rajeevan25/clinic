'use client'

import React, { useState, useEffect } from 'react'
import { User, Phone, CalendarDays, Search, Users, Loader2, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function MyPatientsPage() {
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchPatients() {
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

        // Fetch distinct patients for this doctor
        const { data: appts } = await supabase
          .from('appointments')
          .select(`
            patient_id,
            patient:profiles!appointments_patient_id_fkey(id, full_name, phone, gender, date_of_birth)
          `)
          .eq('doctor_id', doctor.id)
          .order('appointment_date', { ascending: false })

        // Process to get unique patients and visit counts
        const patientMap = new Map()
        appts?.forEach((a: any) => {
          if (!a.patient) return
          if (!patientMap.has(a.patient_id)) {
            patientMap.set(a.patient_id, {
              ...a.patient,
              visits: 1,
              lastVisit: a.appointment_date
            })
          } else {
            const existing = patientMap.get(a.patient_id)
            existing.visits += 1
          }
        })

        setPatients(Array.from(patientMap.values()))
      } catch (err) {
        toast.error('Failed to load patient list')
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Patient List</h1>
          <p className="text-slate-500 font-medium">Manage and review profiles of patients under your care.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            placeholder="Search by name..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 p-8">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Users className="h-5 w-5" /></div>
               Patient Records
            </CardTitle>
            <CardDescription className="font-medium">{filteredPatients.length} active patients total</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-5 pl-8 text-xs font-black uppercase text-slate-400 tracking-widest">Profile</TableHead>
                  <TableHead className="py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Details</TableHead>
                  <TableHead className="py-5 text-xs font-black uppercase text-slate-400 tracking-widest">History</TableHead>
                  <TableHead className="py-5 pr-8 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={4} className="h-60 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                           <User className="h-10 w-10 opacity-20 mb-3" />
                           <p className="font-bold italic">No patient records found.</p>
                        </div>
                     </TableCell>
                   </TableRow>
                ) : filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="group hover:bg-slate-50/80 transition-all border-b border-slate-50 last:border-0">
                    <TableCell className="py-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                           {patient.full_name?.charAt(0)}
                        </div>
                        <div>
                           <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{patient.full_name}</p>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                              {patient.gender || 'N/A'} • {patient.date_of_birth || 'No DOB'}
                           </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                          <Phone className="h-3.5 w-3.5 opacity-40" />
                          {patient.phone || 'N/A'}
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                             <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                             Last: {patient.lastVisit}
                          </div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{patient.visits} Total Visits</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Link href={`/doctor/patients/${patient.id}`}>
                        <Button variant="outline" className="rounded-xl font-bold h-10 px-5 hover:bg-white hover:shadow-lg transition-all border-slate-200">
                           Full File <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
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
