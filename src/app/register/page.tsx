'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { PlusCircle, UserPlus, CheckCircle2 } from 'lucide-react'
import NextLink from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { registerPatientAction } from '@/app/actions/auth'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
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
    
    // Create FormData for the Server Action
    const formDataObj = new FormData()
    formDataObj.append('email', email)
    formDataObj.append('password', password)
    formDataObj.append('fullName', fullName)

    const result = await registerPatientAction(formDataObj)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    setIsSuccess(true)
    toast.success('Registration successful!')
    
    setTimeout(() => {
      router.push('/login')
    }, 3000)
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

        <Card className="border-none shadow-2xl overflow-hidden relative text-slate-900 bg-white">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CardHeader className="space-y-1 text-slate-900">
                  <CardTitle className="text-2xl font-bold">Patient Registration</CardTitle>
                  <CardDescription>
                    Create your account to book appointments and view your medical history.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        placeholder="John Doe" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                      />
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput 
                          id="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <PasswordInput 
                          id="confirmPassword" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Register Now'} <UserPlus className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-sm text-center text-slate-500">
                      Already have an account? <NextLink href="/login" className="text-primary font-semibold hover:underline">Log in</NextLink>
                    </p>
                  </CardFooter>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 px-6 text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h3>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-sm text-center mb-8">
                  <p className="text-slate-600">
                    Account created for <span className="font-bold text-primary">{email}</span>.
                  </p>
                  <p className="mt-2 text-green-600 font-bold">
                    Login is now instant. You can sign in immediately!
                  </p>
                </div>
                <div className="space-y-4">
                  <NextLink href="/login" className={cn(buttonVariants({ variant: "default" }), "w-full")}>
                    Go to Login
                  </NextLink>
                  <NextLink href="/" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    Back to Home
                  </NextLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="mt-8 text-center text-slate-500 text-xs text-slate-900">
          <p>© {new Date().getFullYear()} Jaffna Medical Centre. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
