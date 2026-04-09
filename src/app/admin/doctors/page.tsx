'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, Stethoscope, Phone, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { deleteDoctorAction } from '@/app/admin/doctors/actions'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profiles (full_name),
          departments!doctors_department_id_fkey (name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error: any) {
      toast.error('Failed to load doctors')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor? This will PERMANENTLY delete their login account and clinical profile.')) return
    
    try {
      setLoading(true)
      const result = await deleteDoctorAction(id)
      
      if (result.success) {
        toast.success('Doctor and account deleted successfully')
        setDoctors(doctors.filter(doc => doc.id !== id))
      } else {
        toast.error(result.error || 'Failed to delete doctor')
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Staff</h1>
          <p className="text-slate-500 font-medium">Manage medical specialists and their assignments.</p>
        </div>
        <Link href="/admin/doctors/new">
          <Button className="shadow-lg shadow-blue-500/10 rounded-xl font-bold px-6">
            <Plus className="mr-2 h-4 w-4" /> Add New Doctor
          </Button>
        </Link>
      </div>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <CardTitle>Doctors Directory</CardTitle>
            <CardDescription>{doctors.length} specialists currently registered</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="font-medium">Loading clinical directory...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
                 <Stethoscope className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-500 font-bold text-lg">No doctors found</p>
                 <p className="text-slate-400 mb-6">Start by adding your first medical specialist.</p>
                 <Link href="/admin/doctors/new">
                   <Button variant="outline" className="rounded-xl">Add Doctor</Button>
                 </Link>
              </div>
            ) : (
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Specialty & Dept</TableHead>
                      <TableHead className="font-bold">Contact</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                              {doc.image_url ? (
                                <img src={doc.image_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="font-bold text-xs">{doc.profiles?.full_name?.split(' ').map((n:any) => n[0]).join('')}</span>
                              )}
                            </div>
                            <span className="font-bold text-slate-900">{doc.profiles?.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{doc.specialization}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {doc.departments?.name || 'Unassigned'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium flex items-center gap-1.5 text-slate-600">
                              <Phone className="h-3 w-3 text-slate-400" /> {doc.phone || 'No phone'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-lg px-2.5 py-0.5",
                              doc.is_active
                                ? 'text-green-600 bg-green-50 border-green-200'
                                : 'text-slate-600 bg-slate-50 border-slate-200 shadow-none'
                            )}
                          >
                            {doc.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link 
                            href={`/admin/doctors/edit/${doc.id}`}
                            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-9 w-9 text-blue-600")}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
