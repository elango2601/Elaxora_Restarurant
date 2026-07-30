'use client'

import { useReservationStore } from '@/store/reservationStore'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

export default function Step2Date() {
  const { data, updateData, setStep } = useReservationStore()

  // We store date as YYYY-MM-DD string in Zustand for easy JSON serialization
  const selectedDate = data.date ? new Date(data.date) : undefined

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Need to adjust for local timezone offset when converting to ISO string
      const offset = date.getTimezoneOffset()
      date = new Date(date.getTime() - (offset*60*1000))
      updateData({ date: date.toISOString().split('T')[0], time: '' }) // Reset time on date change
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-serif tracking-wide gold-text-gradient">Select Date</h2>
      <div className="flex flex-col md:flex-row gap-8 mb-8 items-center justify-center">
        <div className="glass-panel p-4 rounded-xl">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
            className="rounded-md border-transparent text-white"
            classNames={{
              selected: "bg-brand-gold text-black hover:bg-yellow-600 hover:text-black focus:bg-brand-gold focus:text-black",
              today: "bg-brand-glass text-brand-gold font-bold",
            }}
          />
        </div>
        {selectedDate && (
          <div className="text-center p-6 glass-panel rounded-xl max-w-sm">
            <h3 className="text-xl font-semibold mb-2">You selected:</h3>
            <p className="text-2xl text-brand-gold font-serif">{format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={() => setStep(1)} 
          className="bg-transparent border border-gray-600 hover:border-white text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          Back
        </button>
        <button 
          onClick={() => setStep(3)} 
          disabled={!data.date}
          className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
