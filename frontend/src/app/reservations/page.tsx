'use client'

import Wizard from '@/components/wizard/Wizard'
import { useSettings } from '@/context/SettingsContext'

export default function ReservationsPage() {
  const { settings } = useSettings()
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-serif mb-4">
          <span className="text-white">Reserve Your Table at </span>
          <span className="gold-text-gradient">{settings?.restaurant_name || 'Elaxora'}</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-400 sm:mt-4">
          Experience the ultimate luxury dining. Book your table in seconds.
        </p>
      </div>
      
      <Wizard />
    </div>
  )
}
