'use client'

import React, { useState, useEffect } from 'react'
import { 
  User, 
  Settings, 
  Stethoscope, 
  ShieldCheck, 
  Loader2, 
  Save, 
  Phone, 
  BadgeCheck, 
  FileText 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { updateProfileAction, updateDoctorProfessionalAction, updatePasswordAction } from '@/app/settings/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function DoctorSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [doctorInfo, setDoctorInfo] = useState<any>(null)
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '', // Not editable via this action usually
  })

  // Professional Form State
  const [profData, setProfData] = useState({
    specialization: '',
    bio: '',
    qualifications: '',
    registrationNumber: ''
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
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: doctor } = await supabase
          .from('doctors')
          .select('*, profiles(*)')
          .eq('profile_id', user.id)
          .single()
        
        if (doctor) {
          setDoctorInfo(doctor)
          setProfileData({
            fullName: doctor.profiles?.full_name || '',
            phone: doctor.profiles?.phone || '',
            email: user.email || ''
          })
          setProfData({
            specialization: doctor.specialization || '',
            bio: doctor.bio || '',
            qualifications: doctor.qualifications || '',
            registrationNumber: doctor.registration_number || ''
          })
        }
      } catch (err) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await updateProfileAction({
      fullName: profileData.fullName,
      phone: profileData.phone
    })
    setSubmitting(false)
    if (result.success) toast.success('Profile updated successfully')
    else toast.error(result.error)
  }

  const handleUpdateProfessional = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await updateDoctorProfessionalAction({
      doctorId: doctorInfo.id,
      specialization: profData.specialization,
      bio: profData.bio,
      qualifications: profData.qualifications,
      registrationNumber: profData.registrationNumber
    })
    setSubmitting(false)
    if (result.success) toast.success('Professional details updated')
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
      <div className="mb-8 flex items-center justify-between pl-1">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Settings</h1>
          <p className="text-slate-500 font-medium">Manage your professional identity and account security.</p>
        </div>
      </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-white border border-slate-50 rounded-2xl p-1.5 shadow-sm inline-flex">
            <TabsTrigger value="profile" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="professional" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
              Professional
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
              Security
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="mt-0 outline-none">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden max-w-2xl">
              <CardHeader className="bg-white border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <User className="h-5 w-5 text-blue-500" /> Account Details
                </CardTitle>
                <CardDescription className="font-medium">Update your core profile information.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Name</Label>
                    <Input 
                      className="rounded-xl h-12 font-bold focus:ring-2 focus:ring-blue-500/10 border-slate-100"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Email (Primary)</Label>
                      <Input 
                        disabled 
                        className="rounded-xl h-12 font-bold bg-slate-50/50 text-slate-400 border-none italic"
                        value={profileData.email}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Contact Phone</Label>
                      <Input 
                        className="rounded-xl h-12 font-bold focus:ring-2 focus:ring-blue-500/10 border-slate-100"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50 flex justify-end">
                <Button onClick={handleUpdateProfile} disabled={submitting} className="rounded-xl font-black px-8 py-6 h-auto shadow-lg shadow-blue-500/20">
                   {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                   Save Profile
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* PROFESSIONAL TAB */}
          <TabsContent value="professional" className="mt-0 outline-none">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden max-w-3xl">
              <CardHeader className="bg-white border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <Stethoscope className="h-5 w-5 text-blue-500" /> Clinical Credentials
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">How your patients see you in the directory.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Specialization</Label>
                      <Input 
                        className="rounded-xl h-12 font-bold border-slate-100"
                        value={profData.specialization}
                        onChange={(e) => setProfData({...profData, specialization: e.target.value})}
                        placeholder="e.g. Interventional Cardiology"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">SLMC Registration No.</Label>
                      <Input 
                        className="rounded-xl h-12 font-bold border-slate-100"
                        value={profData.registrationNumber}
                        onChange={(e) => setProfData({...profData, registrationNumber: e.target.value})}
                        placeholder="e.g. SLMC-XXXXX"
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Academic Qualifications</Label>
                    <Input 
                      className="rounded-xl h-12 font-bold border-slate-100"
                      value={profData.qualifications}
                      onChange={(e) => setProfData({...profData, qualifications: e.target.value})}
                      placeholder="e.g. MBBS, MD, FRCP"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Biographical Statement</Label>
                    <textarea 
                      className="w-full min-h-[120px] rounded-2xl border-slate-100 p-5 text-sm font-medium focus:ring-primary focus:border-primary border focus:outline-none transition-all"
                      value={profData.bio}
                      onChange={(e) => setProfData({...profData, bio: e.target.value})}
                      placeholder="Brief summary of your clinical expertise..."
                    />
                 </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50 flex justify-end">
                <Button onClick={handleUpdateProfessional} disabled={submitting} className="rounded-xl font-black px-8 py-6 h-auto shadow-lg shadow-blue-500/20">
                   {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                   Update Credentials
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="mt-0 outline-none">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden max-w-2xl">
              <CardHeader className="bg-white border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <ShieldCheck className="h-5 w-5 text-blue-500" /> Security
                </CardTitle>
                <CardDescription className="font-medium">Keep your clinical portal account secure.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">New Password</Label>
                    <Input 
                      type="password" 
                      className="rounded-xl h-12 font-bold border-slate-100"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Confirm New Password</Label>
                    <Input 
                      type="password" 
                      className="rounded-xl h-12 font-bold border-slate-100"
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
