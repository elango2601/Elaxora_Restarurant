import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import CartSidebar from '@/components/CartSidebar'
import CartBadge from '@/components/CartBadge'
import AuthNav from '@/components/AuthNav'
import { SettingsProvider } from '@/context/SettingsContext'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'Elaxora Restaurant',
  description: 'Elaxora POS and Fine Dining Restaurant. Experience culinary perfection.',
  manifest: '/manifest.json',
  themeColor: '#D4AF37',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Elaxora',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#0a0a0c] text-white min-h-screen flex flex-col`}>
        <SettingsProvider>
        {/* Persistent Luxury Navbar */}
        <nav className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-brand-gold/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex-shrink-0">
                <Link href="/" className="font-serif text-2xl font-bold gold-text-gradient tracking-widest">
                  ELAXORA
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <Link href="/" className="hover:text-brand-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                  <Link href="/menu" className="hover:text-brand-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">Menu</Link>
                  <Link href="/offers" className="hover:text-brand-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">Offers</Link>
                  <Link href="/gallery" className="hover:text-brand-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">Gallery</Link>
                  <Link href="/about" className="hover:text-brand-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
                  <Link href="/contact" className="hover:text-brand-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</Link>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <CartBadge />
                <Link href="/reservations" className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-full transition-colors text-sm">
                  Book a Table
                </Link>
                <AuthNav />
              </div>
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button className="text-gray-400 hover:text-white p-2">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>
        
        <CartSidebar />

        {/* Footer */}
        <Footer />
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('ServiceWorker unregistered successfully.');
                  }
                });
              }
              if (window.caches) {
                caches.keys().then(function(names) {
                  for (let name of names) caches.delete(name);
                });
              }
            `,
          }}
        />
        </SettingsProvider>
      </body>
    </html>
  )
}
