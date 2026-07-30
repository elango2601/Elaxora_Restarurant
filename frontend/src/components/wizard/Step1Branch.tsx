'use client'

import { useReservationStore } from '@/store/reservationStore'
import { MapPin } from 'lucide-react'

import { useSettings } from '@/context/SettingsContext'

export default function Step1Branch() {
  const { data, updateData, setStep } = useReservationStore()
  const { settings } = useSettings()

  // Dynamic branches based on settings
  const dynamicBranches = [
    { id: 'main', name: `${settings?.restaurant_name || 'Elaxora'} - Pudukkottai`, address: settings?.address || 'Main Road, Pudukkottai, Tamil Nadu', status: 'Available' },
    { id: 'coimbatore', name: `${settings?.restaurant_name || 'Elaxora'} - Coimbatore`, address: 'Avinashi Road, Coimbatore, Tamil Nadu', status: 'High Demand' },
    { id: 'chennai', name: `${settings?.restaurant_name || 'Elaxora'} - Chennai`, address: 'OMR, Chennai, Tamil Nadu', status: 'Available' }
  ]

  const handleSelect = (name: string) => {
    updateData({ branch: name })
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-serif tracking-wide gold-text-gradient">Select Branch</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {dynamicBranches.map(b => (
          <div 
            key={b.id}
            onClick={() => handleSelect(b.name)}
            className={`p-6 cursor-pointer rounded-xl transition-all duration-300 border ${
              data.branch === b.name 
                ? 'bg-brand-glass border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                : 'glass-panel border-transparent hover:border-gray-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <MapPin className={`w-6 h-6 ${data.branch === b.name ? 'text-brand-gold' : 'text-gray-400'}`} />
              <div>
                <h3 className="text-xl font-bold mb-1">{b.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{b.address}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'Available' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                  {b.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button 
          onClick={() => setStep(2)} 
          disabled={!data.branch}
          className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
