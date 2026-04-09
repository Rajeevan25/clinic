import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardNavbar } from '@/components/layout/DashboardNavbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="admin" />
      <div className="flex-grow flex flex-col min-w-0">
        <DashboardNavbar role="admin" />
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  )
}
