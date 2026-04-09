'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { PlusCircle, ArrowRight } from 'lucide-react'
import NextLink from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast.error('Please confirm your email address before signing in. Check your inbox!')
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    toast.success('Signed in successfully!')
    
    // Check role and redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else if (profile?.role === 'doctor') {
      router.push('/doctor')
    } else {
      router.push('/')
    }
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
            <CardTitle className="text-2xl font-bold">Portal Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <NextLink href="#" className="text-xs text-primary hover:underline">Forgot password?</NextLink>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-center text-slate-500">
                Don't have an account? <NextLink href="/register" className="text-primary font-semibold hover:underline">Register as Patient</NextLink>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-sm">
           <h4 className="font-bold text-primary mb-2">Demo Credentials:</h4>
           <div className="space-y-1 text-slate-600">
             <p><span className="font-semibold">Admin:</span> admin@jaffnamedical.com / admin123</p>
             <p><span className="font-semibold">Doctor:</span> doctor@jaffnamedical.com / doctor123</p>
           </div>
           <p className="mt-4 text-xs italic text-slate-400">
             Note: These accounts must be created in your Supabase Auth dashboard first.
           </p>
        </div>
      </div>
    </div>
  )
}
