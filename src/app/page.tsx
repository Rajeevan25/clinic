'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Stethoscope, 
  Users, 
  Clock, 
  ShieldCheck, 
  Calendar,
  Activity,
  HeartPulse,
  Baby,
  Smile,
  ChevronRight
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stats = [
  { label: 'Years of Excellence', value: '15+', icon: Clock },
  { label: 'Expert Doctors', value: '25+', icon: Stethoscope },
  { label: 'Patients Served', value: '10k+', icon: Users },
  { label: 'Success Rate', value: '99%', icon: ShieldCheck },
]

const services = [
  {
    title: 'General Medicine',
    description: 'Comprehensive health checkups and primary care for all ages.',
    icon: Activity,
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  {
    title: 'Pediatrics',
    description: 'Specialized medical care for infants, children, and adolescents.',
    icon: Baby,
    color: 'text-pink-500',
    bg: 'bg-pink-50'
  },
  {
    title: 'Cardiology',
    description: 'Expert heart care including diagnostics and preventive treatments.',
    icon: HeartPulse,
    color: 'text-red-500',
    bg: 'bg-red-50'
  },
  {
    title: 'Dental Care',
    description: 'Professional dental services from cleanings to complex procedures.',
    icon: Smile,
    color: 'text-teal-500',
    bg: 'bg-teal-50'
  }
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              <span className="mr-2">✨</span>
              <span>Leading Healthcare in Jaffna</span>
            </motion.div>
            
            <motion.h1 
              {...fadeInUp}
              className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl"
            >
              Modern Healthcare <br />
              <span className="text-primary">Centred Around You</span>
            </motion.h1>
            
            <motion.p 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl"
            >
              Jaffna Medical Centre provides world-class healthcare services right here in your neighborhood. 
              Our expert doctors and state-of-the-art technology ensure you receive the best care possible.
            </motion.p>
            
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
            >
              <Link href="/book" className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg")}>
                Book Appointment <Calendar className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/services" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-14 px-8 text-lg")}>
                Our Services <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute right-0 top-0 -z-10 h-full w-1/3 bg-slate-50 lg:block hidden">
           <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Specialized Care For Every Need
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              We offer a wide range of medical services to ensure your family's health and well-being.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-none shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-8">
                    <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-2xl", service.bg)}>
                      <service.icon className={cn("h-7 w-7", service.color)} />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-slate-900">{service.title}</h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <Link href={`/services#${service.title.toLowerCase().replace(' ', '-')}`} className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/services" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              View All Departments
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Experience World-Class Healthcare in the Heart of Jaffna
              </h2>
              <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
                Our clinic is dedicated to providing superior medical services with a personal touch. 
                We combine the latest medical advancements with traditional compassion to serve our community.
              </p>
              
              <ul className="mt-10 space-y-4">
                {[
                  'Board Certified Specialists',
                  'Advanced Diagnostic Laboratory',
                  'Modern Surgical Facilities',
                  'Patient-Centered Care Model',
                  'Convenient Online Booking'
                ].map((item) => (
                  <li key={item} className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-white/10 shadow-2xl backdrop-blur-sm p-1">
               {/* Mock Image Placeholder */}
               <div className="h-full w-full rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 font-bold italic">
                 [ Modern Clinic Interior Image ]
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-slate-900 px-8 py-16 text-center text-white lg:px-16">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to prioritize your health?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
              Schedule an appointment with our expert doctors today and take the first step towards a healthier life.
            </p>
            <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href="/book" className={cn(buttonVariants({ size: "lg", variant: "default" }), "bg-primary hover:bg-primary/90 text-white h-14 px-10 text-lg")}>
                Book Now
              </Link>
              <Link href="/contact" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-white/20 text-white hover:bg-white/10 h-14 px-10 text-lg underline")}>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
