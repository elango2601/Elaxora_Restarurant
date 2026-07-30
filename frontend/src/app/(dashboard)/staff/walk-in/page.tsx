'use client'

import { useState } from 'react'
import { Users, UserPlus, Save, Loader2, Info } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'

export default function WalkInPage() {
  const { settings } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: 'Walk-in Guest',
    email: '',
    phone: '',
    guests: '2',
    table_type: 'Standard',
  })
  
  const [successMsg, setSuccessMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMsg('')
    
    // Create current date & time
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      
      const payload = {
        customer_name: formData.customer_name || 'Walk-in Guest',
        email: formData.email || 'walkin@elaxora.com',
        phone: formData.phone || '000-000-0000',
        branch: settings?.restaurant_name ? `${settings.restaurant_name} - Main` : 'Elaxora - Main',
        date: dateStr,
        time: timeStr,
        guests: parseInt(formData.guests),
        table_type: formData.table_type,
        special_requests: 'Walk-in'
      }

      // 1. Create Reservation
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/reservation`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to create walk-in')
      const data = await res.json()
      
      // 2. Mark as Seated instantly
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/reservation/status`, {
        method: 'PATCH',
        headers: { 'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: data.data.reservation_id, status: 'seated' })
      })

      setSuccessMsg(`Guest seated successfully! (ID: ${data.data.reservation_id.substring(0, 8)})`)
      setFormData({
        customer_name: 'Walk-in Guest',
        email: '',
        phone: '',
        guests: '2',
        table_type: 'Standard',
      })
      
    } catch (error) {
      console.error(error)
      alert('Error registering walk-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif gold-text-gradient">Walk-in Guests</h1>
        <p className="text-gray-400 mt-1">Quickly register and seat guests arriving without a reservation.</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
            <UserPlus className="text-brand-gold" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">New Walk-in</h2>
            <p className="text-sm text-gray-400">Current time will be assigned automatically</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400">
            <Info size={20} />
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Guest Name (Optional)</label>
              <input 
                type="text" 
                name="customer_name"
                value={formData.customer_name} 
                onChange={handleChange}
                placeholder="Walk-in Guest"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Party Size</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50 appearance-none"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Table Preference</label>
              <select
                name="table_type"
                value={formData.table_type}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50 appearance-none"
              >
                <option value="Standard">Standard Dining</option>
                <option value="Window">Window Seat</option>
                <option value="Booth">Private Booth</option>
                <option value="Patio">Outdoor Patio</option>
                <option value="Bar">Bar Seating</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone (Optional for SMS)</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
                placeholder="e.g. 555-1234"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-brand-gold text-black font-bold text-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              {isSubmitting ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <><Save size={24} /> Seat Guest Instantly</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
