'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Stethoscope,
  Building2,
  Clock,
  HeartPulse,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  role: 'admin' | 'doctor' | 'patient'
  onClose?: () => void
}

export function SidebarContent({ role, onClose }: SidebarProps) {
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
    { name: 'Notification Logs', href: '/admin/notifications', icon: Bell },
  ]

  const doctorLinks = [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { name: 'My Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'My Patients', href: '/doctor/patients', icon: Users },
    { name: 'Availability', href: '/doctor/availability', icon: Clock },
  ]

  const links = role === 'admin' ? adminLinks : doctorLinks
  const settingsHref = role === 'admin' ? '/admin/settings' : '/doctor/settings'

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/doctor') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full bg-white transition-colors overflow-hidden">
      {/* Brand Section */}
      <div className="px-6 py-8 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-1 ring-primary/20">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase text-slate-900 leading-none">
              Medi<span className="text-primary">Portal</span>
            </h1>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 block leading-none">Clinical System</span>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="flex-grow py-6 px-4 space-y-8 overflow-y-auto scrollbar-none">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 opacity-70">Main Menu</p>
          {links.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300",
                  active 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                    active ? "bg-white/20" : "bg-transparent group-hover:bg-primary/5"
                  )}>
                    <link.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                  </div>
                  <span>{link.name}</span>
                </div>
                {active && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-50 bg-slate-50/30 font-bold">
        <Link 
          href={settingsHref}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-2",
            pathname === settingsHref ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-primary hover:bg-white/50"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Account Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ role }: { role: 'admin' | 'doctor' | 'patient' }) {
  return (
    <aside className="w-72 border-r border-slate-100 bg-white h-screen sticky top-0 hidden lg:block z-40">
      <SidebarContent role={role} />
    </aside>
  )
}
