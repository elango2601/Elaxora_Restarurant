'use client'

import { useReservationStore } from '@/store/reservationStore'
import { Users } from 'lucide-react'

const guestOptions = [1, 2, 3, 4, 5, 6, 7]

export default function Step4Guests() {
  const { data, updateData, setStep } = useReservationStore()

  const getSuggestion = (count: number) => {
    if (count <= 2) return "Window Seat or Romantic Booth recommended."
    if (count <= 4) return "Standard Indoor or Outdoor Patio recommended."
    if (count <= 6) return "Family Booth or VIP Lounge recommended."
    return "Private Dining Room recommended for large groups."
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-serif tracking-wide gold-text-gradient">Number of Guests</h2>
      
      <div className="flex flex-wrap gap-4 justify-center mb-8 mt-10">
        {guestOptions.map(num => (
          <button
            key={num}
            onClick={() => updateData({ guests: num })}
            className={`w-16 h-16 rounded-full text-xl font-bold flex items-center justify-center transition-all duration-300 ${
              data.guests === num
                ? 'bg-brand-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-110'
                : 'glass-panel text-white hover:border-brand-gold hover:scale-105'
            }`}
          >
            {num}{num === 7 && '+'}
          </button>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-xl text-center max-w-lg mx-auto mb-10">
        <Users className="w-8 h-8 mx-auto mb-3 text-brand-gold" />
        <h4 className="text-lg font-semibold text-white/90 mb-1">Seating Suggestion</h4>
        <p className="text-brand-gold/80 italic">{getSuggestion(data.guests)}</p>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={() => setStep(3)} 
          className="bg-transparent border border-gray-600 hover:border-white text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          Back
        </button>
        <button 
          onClick={() => setStep(5)} 
          className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
