'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, User, LogOut, Settings, Search, ChevronRight, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/layout/Sidebar"


import { format } from 'date-fns'

interface DashboardNavbarProps {
  role: 'admin' | 'doctor' | 'patient'
}

export function DashboardNavbar({ role }: DashboardNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const supabase = createClient()

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((path, idx, arr) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      href: '/' + arr.slice(0, idx + 1).join('/'),
      isLast: idx === arr.length - 1
    }))

  useEffect(() => {
    let channel: any;
    let isMounted = true;

    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !isMounted) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (isMounted) {
        setProfile(prof)
      }

      // Initial Notification Fetch
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (notifs && isMounted) {
        setNotifications(notifs)
        setUnreadCount(notifs.filter(n => !n.is_read).length)
      }

      // Real-time notifications
      if (isMounted) {
        // Unique channel name per mount prevents Supabase from returning an
        // already-subscribed channel object (which causes the "cannot add
        // postgres_changes callbacks after subscribe()" error in Strict Mode).
        const channelName = `dashboard-notifs-${user.id}-${Date.now()}`
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            (payload) => {
              if (isMounted) {
                const newNotif = payload.new
                setNotifications(prev => [newNotif, ...prev.slice(0, 4)])
                setUnreadCount(prev => prev + 1)
                toast.info(newNotif.title || 'New clinical alert received')
              }
            }
          )
          .subscribe()
      }
    }

    initialize()

    return () => {
      isMounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const deleteNotif = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (!error) {
      setNotifications(notifications.filter(n => n.id !== id))
      if (!notifications.find(n => n.id === id)?.is_read) setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30 transition-all">
      {/* Left: Breadcrumbs & Mobile Toggle */}
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl hover:bg-slate-100" />}>
            <Menu className="h-6 w-6 text-slate-600" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-none">
            <SidebarContent role={role} onClose={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <nav className="hidden md:flex items-center gap-2 text-sm font-bold">
           {breadcrumbs.map((crumb, idx) => (
             <React.Fragment key={crumb.href}>
                <Link 
                  href={crumb.href} 
                  className={cn(
                    "transition-colors",
                    crumb.isLast ? "text-slate-900" : "text-slate-400 hover:text-primary"
                  )}
                >
                  {crumb.name}
                </Link>
                {!crumb.isLast && <ChevronRight className="h-4 w-4 text-slate-300" />}
             </React.Fragment>
           ))}
        </nav>
      </div>

      {/* Center: Search (Optional) */}
      <div className="hidden lg:flex relative group w-96">
         <Search className="absolute left-4 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
         <input 
          placeholder="Global system search..." 
          className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all outline-none"
         />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "relative h-10 w-10 rounded-xl hover:bg-slate-100")}>
            <Bell className="h-5 w-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl border-slate-100 shadow-2xl p-0 overflow-hidden">
             <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Alerts</h3>
                {unreadCount > 0 && <Badge className="rounded-full bg-primary/10 text-primary text-[10px] uppercase font-black">{unreadCount} New</Badge>}
             </div>
             <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 italic text-xs font-medium">No active alerts</div>
                ) : notifications.map(notif => (
                  <div key={notif.id} className={cn("p-4 border-b border-slate-50 relative group transition-colors", !notif.is_read ? "bg-blue-50/20" : "hover:bg-slate-50/50")}>
                     {!notif.is_read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-primary" />}
                     <div className="flex flex-col gap-1 mb-2">
                        {notif.title && <p className={cn("text-xs font-black uppercase tracking-tight", !notif.is_read ? "text-slate-900" : "text-slate-500")}>{notif.title}</p>}
                        <p className={cn("text-xs leading-relaxed", !notif.is_read ? "font-bold text-slate-800" : "text-slate-400 font-medium")}>{notif.message}</p>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                           {format(new Date(notif.created_at), 'MMM dd • HH:mm')}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           {!notif.is_read && (
                             <button onClick={() => markAsRead(notif.id)} className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm hover:text-green-600 transition-colors">
                                <Check className="h-3 w-3" />
                             </button>
                           )}
                           <button onClick={() => deleteNotif(notif.id)} className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm hover:text-red-600 transition-colors">
                              <Trash2 className="h-3 w-3" />
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-8 w-px bg-slate-100 mx-2" />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost' }), "p-1 rounded-2xl flex items-center gap-3 hover:bg-slate-100 transition-all h-auto cursor-pointer")}>
            <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">
                {profile?.full_name?.substring(0, 2) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:flex flex-col items-start pr-3">
               <span className="text-sm font-black text-slate-900 leading-none">{profile?.full_name}</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{role}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl border-slate-100 shadow-2xl p-2 mt-2">
            <DropdownMenuGroup>
              <DropdownMenuItem className="p-0 overflow-hidden rounded-xl">
                <Link href={role === 'admin' ? '/admin/settings' : '/doctor/settings'} className="flex items-center p-3 w-full hover:bg-slate-50 cursor-pointer">
                  <Settings className="mr-3 h-4 w-4 text-slate-400" />
                  <div className="flex flex-col">
                     <span className="font-bold text-sm">Account Settings</span>
                     <span className="text-[10px] text-slate-400 font-medium">Manage preferences</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-50 my-1" />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center p-3 rounded-xl text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-black text-sm uppercase tracking-widest">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
