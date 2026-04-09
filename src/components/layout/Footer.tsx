import Link from 'next/link'
import { PlusCircle, Mail, Phone, MapPin } from 'lucide-react'

// Inline SVGs for brand icons removed from lucide-react v1
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Clinic Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <PlusCircle className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-primary">
                Jaffna <span className="text-foreground">Medical Centre</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Providing modern healthcare solutions with care and compassion for the heart of Jaffna.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <FacebookIcon />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <TwitterIcon />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <InstagramIcon />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/services" className="hover:text-primary">Our Services</Link></li>
              <li><Link href="/doctors" className="hover:text-primary">Our Doctors</Link></li>
              <li><Link href="/book" className="hover:text-primary font-medium text-primary">Book Appointment</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Departments</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>General Medicine</li>
              <li>Pediatrics</li>
              <li>Cardiology</li>
              <li>Obstetrics & Gynecology</li>
              <li>Dental Care</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 shrink-0 text-primary" />
                <span>123 Hospital Road, Jaffna, Sri Lanka</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 shrink-0 text-primary" />
                <span>+94 21 234 5678</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 shrink-0 text-primary" />
                <span>contact@jaffnamedical.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Jaffna Medical Centre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
