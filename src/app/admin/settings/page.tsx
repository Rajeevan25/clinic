'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  User, 
  ShieldCheck, 
  Loader2, 
  Save, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { 
  updateClinicSettingsAction, 
  updateProfileAction, 
  updatePasswordAction 
} from '@/app/settings/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Clinic Form State
  const [clinicData, setClinicData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    working_hours: ''
  })

  // Admin Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: ''
  })

  // Security
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const supabase = createClient()

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        
        // 1. Fetch Clinic Settings
        const { data: clinic } = await supabase
          .from('clinic_settings')
          .select('*')
          .eq('id', 1)
          .single()
        
        if (clinic) {
          setClinicData({
            name: clinic.name || '',
            address: clinic.address || '',
            phone: clinic.phone || '',
            email: clinic.email || '',
            working_hours: clinic.working_hours || ''
          })
        }

        // 2. Fetch Admin Profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setProfileData({
              fullName: profile.full_name || '',
              phone: profile.phone || '',
              email: user.email || ''
            })
          }
        }

      } catch (err) {
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleUpdateClinic = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await updateClinicSettingsAction(clinicData)
    setSubmitting(false)
    if (result.success) toast.success('Clinic settings updated')
    else toast.error(result.error)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await updateProfileAction({
      fullName: profileData.fullName,
      phone: profileData.phone
    })
    setSubmitting(false)
    if (result.success) toast.success('Admin profile updated')
    else toast.error(result.error)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setSubmitting(true)
    const result = await updatePasswordAction({ password: passwordData.newPassword })
    setSubmitting(false)
    if (result.success) {
      toast.success('Password updated successfully')
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } else toast.error(result.error)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-0">
      <div className="mb-8 pl-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage your clinical infrastructure and administrative preferences.</p>
      </div>

        <Tabs defaultValue="clinic" className="space-y-8">
          <TabsList className="bg-white border border-slate-50 rounded-2xl p-1.5 shadow-sm inline-flex">
            <TabsTrigger value="clinic" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
              Clinic Branding
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
              Security
            </TabsTrigger>
          </TabsList>

          {/* CLINIC BRANDING TAB */}
          <TabsContent value="clinic" className="mt-0 outline-none">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden max-w-2xl">
              <CardHeader className="bg-white border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <Building2 className="h-6 w-6 text-blue-600" /> Clinic Identity
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Public-facing clinical details and contact info.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Clinical Institute Name</Label>
                    <Input 
                      className="rounded-xl h-12 font-bold focus:ring-2 focus:ring-blue-500/10 border-slate-100"
                      value={clinicData.name}
                      onChange={(e) => setClinicData({...clinicData, name: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Physical Address</Label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                       <Input 
                        className="rounded-xl h-12 pl-12 font-bold border-slate-100"
                        value={clinicData.address}
                        onChange={(e) => setClinicData({...clinicData, address: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Phone</Label>
                      <Input 
                        className="rounded-xl h-12 font-bold border-slate-100"
                        value={clinicData.phone}
                        onChange={(e) => setClinicData({...clinicData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Public Email</Label>
                      <Input 
                        type="email"
                        className="rounded-xl h-12 font-bold border-slate-100"
                        value={clinicData.email}
                        onChange={(e) => setClinicData({...clinicData, email: e.target.value})}
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Clinical Working Hours</Label>
                    <Input 
                      className="rounded-xl h-12 font-bold border-slate-100"
                      value={clinicData.working_hours}
                      onChange={(e) => setClinicData({...clinicData, working_hours: e.target.value})}
                    />
                 </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50 flex justify-end">
                <Button onClick={handleUpdateClinic} disabled={submitting} className="rounded-xl font-black px-8 py-6 h-auto shadow-lg shadow-blue-500/20">
                   {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                   Update Infrastructure
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ACCOUNT TAB */}
          <TabsContent value="account" className="mt-0 outline-none">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden max-w-2xl">
              <CardHeader className="bg-white border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <User className="h-6 w-6 text-blue-600" /> Admin Profile
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Your personal administrative account details.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</Label>
                   <Input 
                    className="rounded-xl h-12 font-bold border-slate-100"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auth Email</Label>
                      <Input 
                        disabled
                        className="rounded-xl h-12 font-bold bg-slate-50/50 border-none italic text-slate-400"
                        value={profileData.email}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone</Label>
                      <Input 
                        className="rounded-xl h-12 font-bold border-slate-100"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                   </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50 flex justify-end">
                <Button onClick={handleUpdateProfile} disabled={submitting} className="rounded-xl font-black px-8 py-6 h-auto shadow-lg shadow-blue-500/20">
                   {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                   Save Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="mt-0 outline-none">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden max-w-2xl">
              <CardHeader className="bg-white border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <ShieldCheck className="h-6 w-6 text-blue-600" /> Auth & Security
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Secure your administrative portal access.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">New Administrator Password</Label>
                    <Input 
                      type="password"
                      className="rounded-xl h-12 font-bold border-slate-100 px-5"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Re-type New Password</Label>
                    <Input 
                      type="password"
                      className="rounded-xl h-12 font-bold border-slate-100 px-5"
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50 flex justify-end">
                <Button onClick={handleUpdatePassword} disabled={submitting} className="rounded-xl font-black px-8 py-6 h-auto shadow-lg shadow-blue-500/20">
                   {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                   Reset Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}
