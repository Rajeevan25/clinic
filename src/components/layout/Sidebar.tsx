'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Stethoscope,
  Building2,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  role: 'admin' | 'doctor'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
    { name: 'Departments', href: '/admin/departments', icon: Building2 },
    { name: 'Schedules', href: '/admin/schedules', icon: Clock },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const doctorLinks = [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { name: 'My Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'My Patients', href: '/doctor/patients', icon: Users },
    { name: 'Availability', href: '/doctor/availability', icon: Clock },
    { name: 'Settings', href: '/doctor/settings', icon: Settings },
  ]

  const links = role === 'admin' ? adminLinks : doctorLinks

  return (
    <aside className="w-64 border-r bg-white h-[calc(100vh-64px)] hidden md:block">
      <div className="flex flex-col h-full py-6 px-4">
        <div className="space-y-1 flex-grow">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
