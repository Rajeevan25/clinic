'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Calendar, User, Star, Filter, Loader2, Stethoscope } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function DoctorsContent() {
  const searchParams = useSearchParams()
  const initialSpecialty = searchParams.get('specialty') || 'All'
  
  const [search, setSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty)
  const [doctors, setDoctors] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Sync selectedSpecialty when query param changes
  useEffect(() => {
    const specialty = searchParams.get('specialty')
    if (specialty) {
      setSelectedSpecialty(specialty)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // 1. Fetch Doctors with joins
        const { data: docs, error: docsError } = await supabase
          .from('doctors')
          .select(`
            *,
            profiles (full_name),
            departments!doctors_department_id_fkey (name)
          `)
          .eq('is_active', true)
        
        if (docsError) throw docsError

        // 2. Fetch Departments for specialty filter
        const { data: depts, error: deptsError } = await supabase
          .from('departments')
          .select('name')
          .order('name')
        
        if (deptsError) throw deptsError

        setDoctors(docs || [])
        setSpecialties(['All', ...(depts?.map(d => d.name) || [])])
      } catch (error: any) {
        toast.error('Failed to load clinical directory')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredDoctors = doctors.filter(doc => {
    const name = doc.profiles?.full_name || ''
    const specialty = doc.specialization || ''
    const deptName = doc.departments?.name || ''
    
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                          specialty.toLowerCase().includes(search.toLowerCase()) ||
                          deptName.toLowerCase().includes(search.toLowerCase())
    
    const matchesSpecialty = selectedSpecialty === 'All' || deptName === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="flex flex-col py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col space-y-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
            >
              Meet Our <span className="text-primary">Clinical Specialists</span>
            </motion.h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl font-medium">
              Our team of world-class medical professionals is dedicated to providing you with the best care possible in Jaffna.
            </p>
          </div>
          {selectedSpecialty !== 'All' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3 self-center lg:self-auto"
            >
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-primary italic">Filtering by {selectedSpecialty}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 text-primary"
                onClick={() => setSelectedSpecialty('All')}
              >
                ×
              </Button>
            </motion.div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-12 flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by specialist name or medical department..." 
              className="pl-12 h-14 rounded-2xl border-slate-100 shadow-sm focus:ring-primary/10 transition-all font-medium" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
             <Filter className="h-5 w-5 text-slate-500 mr-2 shrink-0" />
             {specialties.map(spec => (
               <Button 
                key={spec} 
                variant={selectedSpecialty === spec ? 'default' : 'outline'}
                size="sm"
                className={cn(
                   "shrink-0 rounded-xl px-6 font-bold transition-all",
                   selectedSpecialty === spec ? "shadow-lg shadow-primary/20" : "border-slate-100 hover:bg-slate-50"
                )}
                onClick={() => setSelectedSpecialty(spec)}
               >
                 {spec}
               </Button>
             ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
             <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
             <p className="font-black uppercase tracking-widest text-[10px]">Loading clinical registry</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all hover:shadow-2xl hover:-translate-y-1 group bg-white">
                  <div className="h-64 w-full bg-slate-50 relative flex items-center justify-center text-slate-200 overflow-hidden">
                    {doc.image_url ? (
                      <img 
                        src={doc.image_url} 
                        alt={doc.profiles?.full_name} 
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Stethoscope className="h-20 w-20 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-40 text-slate-400">Clinical Profile</span>
                      </div>
                    )}
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm font-bold text-xs hover:bg-white">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 5.0
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <div className="mb-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                      {doc.departments?.name || 'Medical Specialist'}
                    </div>
                    <h3 className="mb-2 text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">
                      {doc.profiles?.full_name}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 mb-6 flex items-center">
                      <span className="text-primary italic mr-2">•</span> {doc.specialization}
                    </p>
                    <div className="flex items-center text-xs font-bold text-slate-400 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      Available: <span className="text-slate-700 ml-1">Mon - Sat (By Appt)</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 flex gap-3">
                    <Link href={`/book?doctor=${doc.id}`} className={cn(buttonVariants({ variant: "default" }), "flex-grow rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:bg-primary/90")}>
                      Book Appointment
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
            <User className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900">No specialists found</h3>
            <p className="text-slate-500 mt-2 font-medium">Try adjusting your search or clinical filters.</p>
            <Button variant="link" className="mt-4 font-bold text-primary" onClick={() => { setSearch(''); setSelectedSpecialty('All'); }}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 py-24">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <p className="font-black uppercase tracking-widest text-[10px]">Loading clinical registry</p>
      </div>
    }>
      <DoctorsContent />
    </Suspense>
  )
}
