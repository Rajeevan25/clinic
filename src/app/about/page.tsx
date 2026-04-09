'use client'

import { motion } from 'framer-motion'
import { Heart, Award, Users, Target, ShieldCheck } from 'lucide-react'


const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function AboutPage() {
  return (
    <div className="flex flex-col py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center lg:text-left">
          <motion.h1 
            {...fadeInUp}
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            About <span className="text-primary">Jaffna Medical Centre</span>
          </motion.h1>
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-3xl text-lg text-slate-600 sm:text-xl"
          >
            Dedicated to providing the highest standard of personalized healthcare since 2010. 
            We are more than just a clinic; we are a partner in your healthy life.
          </motion.p>
        </div>

        {/* Mission/Vision */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-slate-50 p-8 lg:p-12"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              To provide accessible, compassionate, and high-quality healthcare to the people of Jaffna through innovative medical practices and a patient-first approach.
            </p>
          </motion.div>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="rounded-3xl bg-primary text-primary-foreground p-8 lg:p-12"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-2xl font-bold">Our Vision</h2>
            <p className="text-lg leading-relaxed text-primary-foreground/90">
              To be the leading healthcare provider in Northern Sri Lanka, recognized for clinical excellence, patient safety, and community well-being.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mt-24">
          <h2 className="mb-12 text-3xl font-bold text-center text-slate-900">Our Core Values</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: 'Compassion', desc: 'We treat every patient with empathy, respect, and kindness.', icon: Heart },
              { title: 'Excellence', desc: 'We strive for clinical excellence and continuous improvement in all we do.', icon: Award },
              { title: 'Integrity', desc: 'We maintain the highest ethical standards and transparency in our services.', icon: ShieldCheck }
            ].map((value, idx) => (
              <motion.div 
                key={value.title}
                {...fadeInUp}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                className="text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-primary">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="text-slate-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="mt-24 rounded-3xl overflow-hidden bg-slate-100 lg:flex items-center">
          <div className="lg:w-1/2 p-8 lg:p-16">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">Our Story</h2>
            <div className="space-y-4 text-lg text-slate-600">
              <p>
                Founded in 2010, Jaffna Medical Centre was born from a vision to bring premium healthcare services to the North. 
                What started as a small outpatient clinic has grown into a multi-specialty center serving thousands of residents.
              </p>
              <p>
                Over the years, we have invested in state-of-the-art diagnostic equipment, modern laboratory facilities, and a team of 
                highly qualified consultants from across the country.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 aspect-square lg:aspect-auto h-64 lg:h-full bg-slate-300 flex items-center justify-center text-slate-500 italic font-bold">
            [ Clinic History / Team Image ]
          </div>
        </div>
      </div>
    </div>
  )
}
