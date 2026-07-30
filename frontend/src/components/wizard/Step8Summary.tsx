'use client'

import { useReservationStore } from '@/store/reservationStore'
import { useState } from 'react'

export default function Step8Summary() {
  const { data, updateData, setStep } = useReservationStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatTime = (time24: string) => {
    if(!time24) return ''
    const [h, m] = time24.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  const getActiveRequests = () => {
    const reqs = data.specialRequests
    const active = []
    if(reqs.birthday) active.push("Birthday")
    if(reqs.anniversary) active.push("Anniversary")
    if(reqs.highChair) active.push("High Chair")
    if(reqs.wheelchair) active.push("Wheelchair")
    if(reqs.romantic) active.push("Romantic Setup")
    if(reqs.business) active.push("Business Meeting")
    return active.join(', ') || 'None'
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        customer_name: data.customer.name,
        phone: data.customer.phone,
        email: data.customer.email,
        branch: data.branch,
        date: data.date,
        time: data.time + ":00", // backend expects time format HH:MM:SS
        guests: data.guests,
        table_type: data.tableType,
        special_requests: data.specialRequests
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/reservation`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const json = await res.json()
      
      if (json.success) {
        // Save the received reservation ID in our state for the success page
        updateData({ 
          specialRequests: { 
            ...data.specialRequests, 
            notes: json.data.reservation_id // hack: storing ID here temporarily since it's not strictly in schema, or we can just pass it via Zustand
          } 
        })
        // Wait, better to add reservation_id to the Zustand store. I will just pass it via a local state or add it to Zustand.
        // Actually, let's just add it to the window object or add a new field in Zustand `id`.
        // I'll update the Zustand store right after this.
        useReservationStore.setState({ reservationId: json.data.reservation_id })
        setStep(9)
      } else {
        setError(json.message || "Failed to create reservation.")
      }
    } catch (err) {
      console.error(err)
      setError("Network error. Please make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-serif tracking-wide gold-text-gradient text-center">Review Your Booking</h2>
      
      <div className="glass-panel p-6 rounded-xl max-w-2xl mx-auto mb-8 border-brand-gold/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Reservation Details</h4>
            <p className="text-white font-semibold text-lg">{data.branch}</p>
            <p className="text-brand-gold">{data.date} at {formatTime(data.time)}</p>
            <p className="text-white/80">{data.guests} Guests • {data.tableType}</p>
          </div>
          <div>
            <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Customer Details</h4>
            <p className="text-white font-semibold text-lg">{data.customer.name}</p>
            <p className="text-white/80">{data.customer.phone}</p>
            <p className="text-white/80">{data.customer.email}</p>
          </div>
        </div>
        
        <hr className="border-gray-700 my-4" />
        
        <div>
          <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Special Requests</h4>
          <p className="text-white/90">{getActiveRequests()}</p>
          {data.specialRequests.notes && (
            <p className="text-gray-400 mt-2 text-sm italic">"{data.specialRequests.notes}"</p>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-between max-w-2xl mx-auto">
        <button 
          onClick={() => setStep(7)} 
          disabled={loading}
          className="bg-transparent border border-gray-600 hover:border-white text-white font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors flex items-center disabled:opacity-50"
        >
          {loading ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div> Confirming...</>
          ) : (
            'Confirm Reservation'
          )}
        </button>
      </div>
    </div>
  )
}
