'use client'

import { useSettings } from '@/context/SettingsContext'

export default function ContactPage() {
  const { settings } = useSettings()
  return (
    <div className="py-24 px-4 max-w-4xl mx-auto text-center">
      <h1 className="text-5xl font-serif font-bold gold-text-gradient mb-8">Contact Us</h1>
      <p className="text-xl text-gray-300 leading-relaxed mb-8">
        We would love to hear from you. For reservations, inquiries, or special event planning, please reach out.
      </p>
      <div className="glass-panel p-8 rounded-2xl inline-block text-left">
        <p className="mb-2"><strong className="text-brand-gold">Address:</strong> {settings?.address || '123 Luxury Avenue, New York, NY 10001'}</p>
        <p className="mb-2"><strong className="text-brand-gold">Phone:</strong> {settings?.phone || '+91 6374578233'}</p>
        <p><strong className="text-brand-gold">Email:</strong> {settings?.email || 'reservations@elaxora.com'}</p>
      </div>
    </div>
  )
}
