'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Baby, 
  HeartPulse, 
  Smile, 
  Eye, 
  Ear, 
  Brain, 
  Microscope,
  Stethoscope,
  Scissors,
  Loader2,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Icon mapping for dynamic departments
const iconMap: { [key: string]: any } = {
  Stethoscope,
  Baby,
  HeartPulse,
  Smile,
  Eye,
  Microscope,
  Activity,
  Ear,
  Brain,
  Scissors
}

export default function ServicesPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name')
        
        if (error) throw error
        setDepartments(data || [])
      } catch (error: any) {
        console.error('Error fetching services:', error)
        toast.error('Failed to load medical services')
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  return (
    <div className="flex flex-col py-16 lg:py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            Our <span className="text-primary">Medical Departments</span>
          </motion.h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Explore our comprehensive range of specialized medical services designed to meet all your healthcare needs.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="font-medium">Loading clinical services...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed">
            <Building2 className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No departments found</h3>
            <p className="text-slate-500">Service information will appear once departments are added in the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => {
              const IconComponent = iconMap[dept.icon] || Stethoscope
              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  id={dept.name.toLowerCase().replace(' ', '-')}
                >
                  <Card className="h-full border-none shadow-lg overflow-hidden transition-all hover:shadow-xl group">
                    <CardHeader className="bg-white pb-2 flex flex-row items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl font-bold">{dept.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-white pt-4">
                      <p className="text-slate-600 mb-6 line-clamp-3 font-medium">{dept.description}</p>
                      
                      {dept.services && dept.services.length > 0 && (
                        <div className="space-y-3 mb-8">
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest text-[10px]">Key Services:</h4>
                          <ul className="grid grid-cols-1 gap-2">
                            {dept.services.map((service: string) => (
                              <li key={service} className="flex items-center text-sm text-slate-600 font-medium">
                                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                {service}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Link 
                        href={`/doctors?specialty=${encodeURIComponent(dept.name)}`}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "w-full rounded-xl font-bold border-slate-100 hover:bg-primary hover:text-white hover:border-primary transition-all")}
                      >
                        View Specialists
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Other Specialized Services */}
        <div className="mt-24 rounded-3xl bg-primary p-8 lg:p-16 text-white overflow-hidden relative shadow-2xl shadow-primary/20">
          <div className="relative z-10 lg:w-2/3">
            <h2 className="text-3xl font-black mb-6">Need a Specialized Consultation?</h2>
            <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed font-medium">
              Beyond our core departments, we host visiting consultants in Neurology, Urology, and Orthopedics. 
              Contact us to find out our monthly specialist schedule.
            </p>
            <div className="flex space-x-4">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="h-12 w-12 rounded-full border-4 border-primary bg-slate-200/20 backdrop-blur-sm" />
                 ))}
               </div>
               <div className="text-sm">
                 <p className="font-bold text-lg">45+ Licensed Doctors</p>
                 <p className="text-primary-foreground/70 font-medium">Expert care at your fingertips</p>
               </div>
            </div>
          </div>
          <Activity className="absolute -bottom-12 -right-12 h-64 w-64 text-white/5" />
        </div>
      </div>
    </div>
  )
}
