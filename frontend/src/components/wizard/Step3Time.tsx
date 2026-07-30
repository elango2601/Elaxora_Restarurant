'use client'

import { useReservationStore } from '@/store/reservationStore'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface Slot {
  time: string
  available: boolean
}

export default function Step3Time() {
  const { data, updateData, setStep } = useReservationStore()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch available slots from FastAPI
    const fetchSlots = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:3001/available-slots?branch=${encodeURIComponent(data.branch)}&date=${data.date}`)
        const json = await res.json()
        if (json.success) {
          setSlots(json.data)
        }
      } catch (error) {
        console.error("Failed to fetch slots", error)
        // Fallback to static if backend is not running during dev
        setSlots([
          { time: '12:00', available: true },
          { time: '12:30', available: true },
          { time: '13:00', available: false },
          { time: '13:30', available: true },
          { time: '18:00', available: true },
          { time: '18:30', available: true },
          { time: '19:00', available: false },
          { time: '19:30', available: true },
          { time: '20:00', available: true },
        ])
      } finally {
        setLoading(false)
      }
    }
    
    if (data.branch && data.date) {
      fetchSlots()
    }
  }, [data.branch, data.date])

  const lunchSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0])
    return hour >= 12 && hour < 16
  })
  
  const dinnerSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0])
    return hour >= 16
  })

  const formatTime = (time24: string) => {
    const [h, m] = time24.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-serif tracking-wide gold-text-gradient">Select Time</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      ) : (
        <div className="mb-8 space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center text-white/80"><Clock className="w-5 h-5 me-2 text-brand-gold"/> Lunch</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {lunchSlots.map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => updateData({ time: slot.time })}
                  className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                    !slot.available 
                      ? 'bg-brand-glass opacity-30 cursor-not-allowed text-gray-500' 
                      : data.time === slot.time
                        ? 'bg-brand-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                        : 'glass-panel hover:border-brand-gold text-white'
                  }`}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center text-white/80"><Clock className="w-5 h-5 me-2 text-brand-gold"/> Dinner</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dinnerSlots.map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => updateData({ time: slot.time })}
                  className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                    !slot.available 
                      ? 'bg-brand-glass opacity-30 cursor-not-allowed text-gray-500' 
                      : data.time === slot.time
                        ? 'bg-brand-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                        : 'glass-panel hover:border-brand-gold text-white'
                  }`}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button 
          onClick={() => setStep(2)} 
          className="bg-transparent border border-gray-600 hover:border-white text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          Back
        </button>
        <button 
          onClick={() => setStep(4)} 
          disabled={!data.time}
          className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
