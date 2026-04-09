'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortal = pathname.startsWith('/admin') || pathname.startsWith('/doctor/') || pathname === '/doctor' || pathname === '/login'

  return (
    <>
      {!isPortal && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isPortal && <Footer />}
    </>
  )
}
