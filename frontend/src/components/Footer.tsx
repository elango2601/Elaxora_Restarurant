'use client'

import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext'

export default function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="bg-[#050507] border-t border-brand-gold/10 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="font-serif text-2xl font-bold gold-text-gradient mb-4">
              {settings?.restaurant_name?.toUpperCase() || 'ELAXORA'}
            </h2>
            <p className="text-gray-400 text-sm">Experience culinary perfection in an atmosphere of unparalleled luxury and sophistication.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-brand-gold transition-colors">Menu</Link></li>
              <li><Link href="/reservations" className="hover:text-brand-gold transition-colors">Reservations</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>{settings?.address || '123 Luxury Avenue'}</li>
              <li>{settings?.phone || '+91 6374578233'}</li>
              <li>{settings?.email || 'reservations@elaxora.com'}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Hours</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Mon-Thu: 11am - 10pm</li>
              <li>Fri-Sat: 11am - 11pm</li>
              <li>Sunday: 10am - 9pm</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} {settings?.restaurant_name || 'Elaxora'} Restaurant. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
