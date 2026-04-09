'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Menu, X, PlusCircle, User, LogOut, Calendar, ChevronDown, LayoutDashboard, Bell, Check, Trash2 } from 'lucide-react'
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
        setRole(profileData?.role || 'patient')
      } else {
        setProfile(null)
        setRole(null)
      }
    }
    getUser()

    if (user) {
      // Fetch Notifications
      const fetchNotifications = async () => {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (data) {
          setNotifications(data)
          setUnreadCount(data.filter(n => !n.is_read).length)
        }
      }
      fetchNotifications()

      // Real-time subscription
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev])
            setUnreadCount(prev => prev + 1)
            toast.info('New notification received')
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, supabase])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setNotifications(notifications.filter(n => n.id !== id))
      if (!notifications.find(n => n.id === id)?.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PlusCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">
            Jaffna <span className="text-foreground">Medical Centre</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.name}>
                  <Link href={link.href} className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                    {link.name}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-4 flex items-center space-x-2 border-l pl-4">
            {!user ? (
              <>
                <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                   Login
                </Link>
                <Link href="/book" className={buttonVariants()}>
                  Book Appointment
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                 {/* Notification Bell */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="relative rounded-xl h-10 w-10 border border-slate-100 bg-white">
                        <Bell className="h-5 w-5 text-slate-600" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-[320px] rounded-2xl p-0 overflow-hidden shadow-2xl border-slate-100">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" /> Notifications
                      </h3>
                      {unreadCount > 0 && (
                         <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-2 bg-white">{unreadCount} New</Badge>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center gap-2">
                           <Bell className="h-8 w-8 text-slate-200" />
                           <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={cn(
                              "relative p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group",
                              !notif.is_read && "bg-blue-50/30"
                            )}
                          >
                            {!notif.is_read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />}
                            <div className="flex items-start justify-between gap-2">
                               <p className={cn("text-xs leading-relaxed pr-6", !notif.is_read ? "text-slate-900 font-bold" : "text-slate-500")}>
                                {notif.message}
                               </p>
                               <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notif.is_read && (
                                    <button onClick={() => markAsRead(notif.id)} className="p-1 hover:bg-white rounded border shadow-sm">
                                      <Check className="h-3 w-3 text-green-600" />
                                    </button>
                                  )}
                                  <button onClick={() => deleteNotification(notif.id)} className="p-1 hover:bg-white rounded border shadow-sm">
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  </button>
                               </div>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-2 block">
                              {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-10 flex items-center justify-start space-x-3 px-2 hover:bg-slate-100 rounded-xl transition-all outline-none">
                    <Avatar className="h-8 w-8 border border-primary/20 pointer-events-none">
                      <AvatarImage src="" alt={profile?.full_name || 'User'} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                        {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex flex-col items-start pr-2 pointer-events-none">
                       <span className="text-sm font-bold leading-none">{profile?.full_name}</span>
                       <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">{role}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400 pointer-events-none" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/dashboard'} className="w-full h-full flex items-center cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{role === 'patient' ? 'My Appointments' : 'Dashboard'}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/book" className="w-full h-full flex items-center cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Book Appointment</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-b bg-background md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 border-t pt-4">
              {!user ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className={buttonVariants({ variant: "outline" })} onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                  <Link href="/book" className={buttonVariants()} onClick={() => setIsOpen(false)}>
                    Book Now
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href={role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/dashboard'} className={buttonVariants({ variant: "outline" })} onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                  <Button variant="destructive" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
