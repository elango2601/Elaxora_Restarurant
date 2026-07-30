import Link from 'next/link'
import { cookies } from 'next/headers'
import { 
  Home, LogOut, Settings, LayoutDashboard, ShoppingBag, Users, CalendarDays, 
  BarChart, ClipboardList, Package, UserCircle, CreditCard, Tag, Star, 
  FileText, CheckSquare, Bell, Flame, Timer, AlertTriangle, Book, 
  MapPin, CheckCircle, Navigation, DollarSign
} from 'lucide-react'

// Helper function to decode JWT payload (since we just need the role for UI)
function parseJwt(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  } catch (e) {
    return null
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('elaxora_token')?.value
  const payload = token ? parseJwt(token) : null
  const role = payload?.role || 'admin'
  const userName = payload?.sub || 'User'

  // Admin Sidebar Links
  const adminLinks = [
    { href: '/admin', label: 'Analytics', icon: BarChart },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
    { href: '/admin/menu', label: 'Menu Management', icon: ClipboardList },
    { href: '/admin/inventory', label: 'Inventory', icon: Package },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/customers', label: 'Customers', icon: UserCircle },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/coupons', label: 'Coupons', icon: Tag },
    { href: '/admin/reviews', label: 'Reviews', icon: Star },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/profile', label: 'Profile', icon: UserCircle },
  ]

  // Staff Sidebar Links
  const staffLinks = [
    { href: '/staff', label: 'Live Orders & Queue', icon: ClipboardList },
    { href: '/staff/walk-in', label: 'Walk-in Customers', icon: Users },
    { href: '/staff/check-in', label: 'Check-in Guests', icon: CheckSquare },
    { href: '/staff/billing', label: 'Billing', icon: CreditCard },
    { href: '/staff/pos', label: 'POS', icon: LayoutDashboard },
    { href: '/staff/support', label: 'Customer Support', icon: UserCircle },
    { href: '/staff/tables', label: 'Available Tables', icon: LayoutDashboard },
    { href: '/staff/calendar', label: 'Reservation Calendar', icon: CalendarDays },
    { href: '/staff/notifications', label: 'Notifications', icon: Bell },
    { href: '/staff/profile', label: 'Profile', icon: UserCircle },
  ]

  // Kitchen Sidebar Links
  const kitchenLinks = [
    { href: '/kitchen', label: 'Live KDS', icon: Flame },
    { href: '/kitchen/timer', label: 'Cooking Timer (Coming Soon)', icon: Timer },
    { href: '/kitchen/inventory', label: 'Inventory Alerts', icon: Package },
    { href: '/kitchen/recipes', label: 'Recipe Notes', icon: Book },
    { href: '/kitchen/profile', label: 'Profile', icon: UserCircle },
  ]

  // Delivery Sidebar Links
  const deliveryLinks = [
    { href: '/delivery', label: 'Assigned Orders', icon: Package },
    { href: '/delivery/accepted', label: 'Accepted Orders', icon: CheckSquare },
    { href: '/delivery/pickup', label: 'Pickup Location', icon: MapPin },
    { href: '/delivery/address', label: 'Customer Address', icon: MapPin },
    { href: '/delivery/navigation', label: 'Navigation', icon: Navigation },
    { href: '/delivery/otp', label: 'OTP Verification', icon: CheckCircle },
    { href: '/delivery/history', label: 'Delivery History', icon: FileText },
    { href: '/delivery/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/delivery/profile', label: 'Profile', icon: UserCircle },
  ]

  let links = adminLinks;
  if (role === 'staff') links = staffLinks;
  if (role === 'kitchen') links = kitchenLinks;
  if (role === 'delivery') links = deliveryLinks;

  return (
    <div className="flex h-screen bg-[#050507] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0c] border-r border-brand-gold/10 flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold gold-text-gradient tracking-widest">ELAXORA</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{role} Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          {links.map((link, idx) => {
            const Icon = link.icon
            // A simple active state mock
            const isActive = idx === 0 
            return (
              <Link 
                key={link.label} 
                href={link.href} 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-brand-gold/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <Home size={20} />
            <span className="font-medium">Main Site</span>
          </Link>
          <Link href="/login" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors mt-2">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0a0c] border-b border-brand-gold/10 flex items-center justify-between px-6 flex-shrink-0">
          <div className="md:hidden">
            <h2 className="text-xl font-serif font-bold gold-text-gradient">ELAXORA</h2>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-brand-gold capitalize">{role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold flex items-center justify-center text-brand-gold font-bold uppercase">
              {userName.charAt(0)}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#050507]">
          {children}
        </div>
      </main>
    </div>
  )
}
