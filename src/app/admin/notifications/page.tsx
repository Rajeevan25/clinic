'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  Search, 
  Trash2, 
  Edit3, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Filter,
  MoreVertical,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from '@/lib/supabase/client'
import { deleteNotificationAction, updateNotificationAction } from '@/app/actions/notifications'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editNotif, setEditNotif] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const supabase = createClient()

  const fetchNotifications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        user:profiles!user_id(full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load notifications')
    } else {
      setNotifications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return
    
    const result = await deleteNotificationAction(id)
    if (result.success) {
      toast.success('Notification deleted')
      setNotifications(notifications.filter(n => n.id !== id))
    } else {
      toast.error('Failed to delete notification')
    }
  }

  const handleUpdate = async () => {
    if (!editNotif) return

    const result = await updateNotificationAction(editNotif.id, {
      title: editNotif.title,
      message: editNotif.message,
      type: editNotif.type
    })

    if (result.success) {
      toast.success('Notification updated')
      setNotifications(notifications.map(n => n.id === editNotif.id ? { ...n, ...editNotif } : n))
      setIsEditDialogOpen(false)
    } else {
      toast.error('Failed to update notification')
    }
  }

  const filteredNotifications = notifications.filter(n => 
    n.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const typeIcons: Record<string, any> = {
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  }

  return (
    <div className="p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notification Logs</h1>
          <p className="text-slate-500 font-medium">Manage and audit clinical alerts sent to patients.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by patient, title or message content..." 
            className="pl-12 h-12 rounded-2xl border-none shadow-sm bg-white font-medium focus:ring-2 focus:ring-primary/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white border-none shadow-sm font-bold text-slate-600 hover:bg-slate-50">
           <Filter className="mr-2 h-4 w-4" /> Filter Results
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
              <TableRow>
                <TableHead className="py-5 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Patient</TableHead>
                <TableHead className="py-5 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Alert Content</TableHead>
                <TableHead className="py-5 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Status</TableHead>
                <TableHead className="py-5 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Sent On</TableHead>
                <TableHead className="py-5 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-slate-400 italic font-medium">
                    Syncing notification logs...
                  </TableCell>
                </TableRow>
              ) : filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                        <Bell className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900">No logs found</p>
                        <p className="text-sm text-slate-400 font-medium">Your alert history is empty or matches no search results.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((notif) => {
                  const typeCfg = typeIcons[notif.type || 'info'] || typeIcons.info
                  return (
                    <TableRow key={notif.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-50 last:border-0 grow">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                            <User className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-slate-900">{notif.user?.full_name || 'Patient'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-start gap-4">
                           <div className={cn("mt-1 p-2 rounded-lg", typeCfg.bg, typeCfg.color)}>
                              <typeCfg.icon className="h-4 w-4" />
                           </div>
                           <div className="flex flex-col gap-0.5 max-w-md">
                              <span className="font-black text-xs uppercase tracking-tight text-slate-900">{notif.title}</span>
                              <span className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <Badge variant="outline" className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                          notif.is_read ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                        )}>
                          {notif.is_read ? 'Seen' : 'Unseen'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{format(new Date(notif.created_at), 'MMM dd, yyyy')}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{format(new Date(notif.created_at), 'HH:mm')}</span>
                         </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => {
                              setEditNotif(notif)
                              setIsEditDialogOpen(true)
                            }}
                           >
                              <Edit3 className="h-4 w-4" />
                           </Button>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => handleDelete(notif.id)}
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Edit Notification</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Update the clinical alert content for the patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
              <Input 
                value={editNotif?.title || ''} 
                onChange={(e) => setEditNotif({...editNotif, title: e.target.value})}
                className="h-12 rounded-2xl bg-slate-50 border-none font-bold focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
              <textarea 
                className="min-h-[120px] rounded-2xl bg-slate-50 border-none p-4 font-medium text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                value={editNotif?.message || ''}
                onChange={(e) => setEditNotif({...editNotif, message: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Alert Priority Type</label>
              <div className="flex gap-2">
                 {['info', 'warning', 'success', 'error'].map(t => (
                   <button
                    key={t}
                    onClick={() => setEditNotif({...editNotif, type: t})}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      editNotif?.type === t ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                   >
                     {t}
                   </button>
                 ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl font-bold text-slate-400">Cancel</Button>
            <Button onClick={handleUpdate} className="rounded-xl px-8 font-black uppercase tracking-widest text-xs h-12">Update Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
