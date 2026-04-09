'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Calendar,
  Stethoscope,
  Building2,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Doctors', value: '24', icon: Stethoscope, trend: '+2 this month', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Departments', value: '8', icon: Building2, trend: 'Stable', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Total Appointments', value: '1,284', icon: Calendar, trend: '+12% from last week', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Registered Patients', value: '4,520', icon: Users, trend: '+45 new today', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  const recentActivities = [
    { id: 1, action: 'New Doctor Added', detail: 'Dr. Ramesh Kumar joined Pediatrics', time: '2 hours ago' },
    { id: 2, action: 'Department Updated', detail: 'Dental Care schedule adjusted', time: '5 hours ago' },
    { id: 3, action: 'System Alert', detail: 'Database backup completed successfully', time: 'Yesterday' },
  ]

  return (
    <div className="p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium tracking-tight">Monitor and manage Jaffna Medical Centre operations.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="rounded-xl font-bold border-slate-200">
             Export Reports
          </Button>
        </div>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                      <TrendingUp className="h-3 w-3 mr-1" /> {stat.trend.split(' ')[0]}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-2 text-xs text-slate-400">{stat.trend}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Clinical Overview</CardTitle>
              <CardDescription>Appointment trends over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <div className="h-64 w-full bg-slate-50 flex items-center justify-center border-y text-slate-400 font-medium italic">
                 [ Interactive Chart Area - Next.js Speed ]
               </div>
               <div className="p-6 grid grid-cols-3 gap-4 text-center">
                 <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Confirmed</p>
                   <p className="text-xl font-bold text-blue-600">84%</p>
                 </div>
                 <div className="border-x">
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Arrivals</p>
                   <p className="text-xl font-bold text-indigo-600">92%</p>
                 </div>
                 <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Satisfaction</p>
                   <p className="text-xl font-bold text-teal-600">4.9/5</p>
                 </div>
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start space-x-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none mb-1">{act.action}</p>
                      <p className="text-xs text-slate-500 mb-1">{act.detail}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-6 text-primary h-auto p-0 font-bold">
                View All Logs <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
