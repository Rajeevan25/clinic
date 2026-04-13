'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { PlusCircle, Save } from 'lucide-react'
import NextLink from 'next/link'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Password updated successfully!')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <NextLink href="/" className="inline-flex justify-center items-center space-x-2">
            <PlusCircle className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight text-primary">
              Jaffna <span className="text-slate-900">Medical Centre</span>
            </span>
          </NextLink>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Update Password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <PasswordInput 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput 
                  id="confirmPassword" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? 'Updating...' : 'Save New Password'} <Save className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
