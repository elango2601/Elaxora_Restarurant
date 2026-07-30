'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

type Reservation = {
  reservation_id: string
  customer_name: string
  phone: string
  email: string
  date: string
  time: string
  guests: number
  table_type: string
  status: string
}

export default function CalendarPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  const fetchReservations = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/reservations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        setReservations(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Reservation Calendar</h1>
          <p className="text-gray-400 mt-1">Monthly view of all upcoming bookings.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-3">
            <CalendarIcon className="text-brand-gold" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-[#111115] p-3 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="bg-[#0a0a0c] min-h-[120px]"></div>
              
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayReservations = reservations.filter(r => r.date === dateStr)
              const isToday = new Date().toISOString().split('T')[0] === dateStr

              return (
                <div key={day} className={`bg-[#0a0a0c] min-h-[120px] p-2 transition-colors hover:bg-white/[0.02] ${isToday ? 'ring-2 ring-brand-gold ring-inset' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-gold text-black' : 'text-gray-400'}`}>
                      {day}
                    </span>
                    {dayReservations.length > 0 && (
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                        {dayReservations.length} total
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
                    {dayReservations.slice(0, 3).map(res => (
                      <div key={res.reservation_id} className={`text-xs p-1.5 rounded truncate border ${
                        res.status === 'confirmed' ? 'bg-green-500/10 border-green-500/20 text-green-300' :
                        res.status === 'seated' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' :
                        res.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                      }`}>
                        <span className="font-bold">{res.time}</span> - {res.customer_name} ({res.guests})
                      </div>
                    ))}
                    {dayReservations.length > 3 && (
                      <div className="text-xs text-center text-gray-500 italic mt-1">
                        +{dayReservations.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
