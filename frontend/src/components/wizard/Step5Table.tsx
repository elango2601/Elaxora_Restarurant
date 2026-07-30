'use client'

import { useReservationStore } from '@/store/reservationStore'
import { Armchair, Coffee, CloudMoon, Wine, Users2, Crown } from 'lucide-react'

const tables = [
  { id: 'indoor', name: 'Indoor Dining', desc: 'Elegant and air-conditioned classic setting.', icon: Coffee },
  { id: 'outdoor', name: 'Outdoor Patio', desc: 'Breezy and casual al-fresco experience.', icon: CloudMoon },
  { id: 'window', name: 'Window Seat', desc: 'Perfect city views with a romantic vibe.', icon: Armchair },
  { id: 'private', name: 'Private Dining', desc: 'Exclusive closed room for private events.', icon: Wine },
  { id: 'family', name: 'Family Booth', desc: 'Spacious and comfortable for larger groups.', icon: Users2 },
  { id: 'vip', name: 'VIP Lounge', desc: 'Ultimate luxury with dedicated service.', icon: Crown },
]

export default function Step5Table() {
  const { data, updateData, setStep } = useReservationStore()

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-serif tracking-wide gold-text-gradient">Table Preference</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tables.map(t => {
          const Icon = t.icon
          const isSelected = data.tableType === t.name
          return (
            <div 
              key={t.id}
              onClick={() => updateData({ tableType: t.name })}
              className={`p-6 cursor-pointer rounded-xl transition-all duration-300 border flex flex-col items-center text-center ${
                isSelected 
                  ? 'bg-brand-glass border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] transform scale-105 z-10' 
                  : 'glass-panel border-transparent hover:border-brand-gold/50 hover:bg-brand-glass-hover'
              }`}
            >
              <Icon className={`w-10 h-10 mb-4 ${isSelected ? 'text-brand-gold' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold mb-2 text-white">{t.name}</h3>
              <p className="text-sm text-gray-400">{t.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between">
        <button 
          onClick={() => setStep(4)} 
          className="bg-transparent border border-gray-600 hover:border-white text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          Back
        </button>
        <button 
          onClick={() => setStep(6)} 
          disabled={!data.tableType}
          className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
