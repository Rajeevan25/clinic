'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { PlusCircle, ArrowLeft, Mail } from 'lucide-react'
import NextLink from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    toast.success('Reset link sent to your email!')
    setLoading(false)
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
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              {submitted 
                ? "Check your email for the reset link."
                : "Enter your email address to receive a password reset link."}
            </CardDescription>
          </CardHeader>
          
          {!submitted ? (
            <form onSubmit={handleResetRequest}>
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
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'} <Mail className="ml-2 h-5 w-5" />
                </Button>
                <NextLink href="/login" className="text-sm flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
                </NextLink>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="py-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-slate-600 mb-6">
                If an account exists with <span className="font-semibold text-slate-900">{email}</span>, you will receive a reset link shortly.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                Try another email
              </Button>
              <NextLink href="/login" className="mt-6 text-sm flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
              </NextLink>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
