'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Your message has been sent. We will get back to you soon!')
  }

  return (
    <div className="flex flex-col py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center lg:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            Get In <span className="text-primary">Touch</span>
          </motion.h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Have questions about our services or need help? Reach out to us and our team will be happy to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Contact Details */}
          <div className="space-y-8 lg:col-span-1">
            <Card className="border-none shadow-md bg-slate-50">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Location</h3>
                    <p className="text-slate-600 mt-1">123 Hospital Road, Jaffna, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Phone</h3>
                    <p className="text-slate-600 mt-1">+94 21 234 5678</p>
                    <p className="text-slate-600">+94 21 876 5432</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Email</h3>
                    <p className="text-slate-600 mt-1">info@jaffnamedical.com</p>
                    <p className="text-slate-600">appointments@jaffnamedical.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 border-t pt-8">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Opening Hours</h3>
                    <div className="text-slate-600 mt-1 space-y-1">
                      <p className="flex justify-between"><span>Mon - Sat:</span> <span>7:00 AM - 9:00 PM</span></p>
                      <p className="flex justify-between"><span>Sunday:</span> <span>8:00 AM - 2:00 PM</span></p>
                      <p className="text-xs text-primary font-semibold mt-2 underline italic">24/7 Emergency Services Available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form & Map */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Inquiry about services" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea 
                      id="message" 
                      className="min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>

                  <Button type="submit" className="w-full md:w-auto px-10 h-12" size="lg">
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="h-[300px] w-full rounded-3xl bg-slate-200 relative overflow-hidden flex items-center justify-center text-slate-500 font-bold italic shadow-inner">
               <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/80.0,9.6,12/800x300@2x?access_token=mock')] bg-cover bg-center opacity-50" />
               <div className="relative z-10 bg-white/80 p-4 rounded-xl backdrop-blur-sm border shadow-lg flex flex-col items-center">
                 <MapPin className="h-8 w-8 text-primary mb-2" />
                 <span className="text-slate-900 not-italic">Jaffna Medical Centre</span>
                 <span className="text-xs text-slate-500 not-italic">Hospital Road, Jaffna</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
