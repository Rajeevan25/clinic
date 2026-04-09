'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setLoading(true)
        
        // Fetch departments with head doctor profile info
        // Note: Using head_doctor_id and joining with doctors/profiles
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select(`
            *,
            head_doctor:head_doctor_id(
              id,
              profiles(full_name)
            )
          `)
          .order('name')

        if (deptError) throw deptError

        // Fetch doctor counts per department
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('department_id')

        if (doctorError) throw doctorError

        // Calculate counts
        const doctorCounts = doctorData.reduce((acc: any, doc: any) => {
          if (doc.department_id) {
            acc[doc.department_id] = (acc[doc.department_id] || 0) + 1
          }
          return acc
        }, {})

        // Format data for the table
        const formattedDepartments = deptData.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          head: dept.head_doctor?.profiles?.full_name || 'Vacant',
          doctors: doctorCounts[dept.id] || 0,
          status: 'Active', // Defaulting to Active for now as requested
          icon: dept.icon,
        }))

        setDepartments(formattedDepartments)
      } catch (error: any) {
        console.error('Error fetching departments:', error)
        toast.error('Failed to load departments')
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Department deleted successfully')
      setDepartments(departments.filter(d => d.id !== id))
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete department')
    }
  }

  return (
    <div className="p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Departments</h1>
          <p className="text-slate-500 font-medium">Manage medical departments and their heads.</p>
        </div>
        <Link href="/admin/departments/new">
          <Button className="shadow-lg shadow-blue-500/10 rounded-xl font-bold px-6">
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </Link>
      </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
            <CardDescription>{departments.length} departments in total</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p>Loading departments...</p>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No departments found</p>
                <p className="text-sm text-slate-400 mb-6">Start by adding your first medical department.</p>
                <Link href="/admin/departments/new">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Department
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Department Name</TableHead>
                      <TableHead>Head of Department</TableHead>
                      <TableHead>No. of Doctors</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-bold text-primary">{dept.name}</TableCell>
                        <TableCell className="text-slate-600">{dept.head}</TableCell>
                        <TableCell className="text-slate-600">{dept.doctors}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                            {dept.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link 
                            href={`/admin/departments/edit/${dept.id}`}
                            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-blue-600")}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(dept.id)}
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
