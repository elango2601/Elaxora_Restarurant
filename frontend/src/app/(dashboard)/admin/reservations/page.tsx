'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Search, Loader2, Check, X, Clock } from 'lucide-react'

type Reservation = {
  reservation_id: string
  customer_name: string
  phone: string
  email: string
  branch: string
  date: string
  time: string
  guests: number
  table_type: string
  special_requests?: string
  status: string
  table_number?: number
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

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
    
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:3001"}/ws`)
    
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      if (payload.type === 'new_reservation' || payload.type === 'update_reservation') {
        const resData = payload.data
        setReservations(prev => {
          const exists = prev.some(r => r.reservation_id === resData.reservation_id)
          if (exists) {
            return prev.map(r => r.reservation_id === resData.reservation_id ? resData : r)
          } else {
            return [resData, ...prev]
          }
        })
      } else if (payload.type === 'cancel_reservation') {
        setReservations(prev => prev.map(r => r.reservation_id === payload.id ? { ...r, status: 'cancelled' } : r))
      }
    }
    
    return () => ws.close()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/reservation/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: newStatus })
      })
      if (res.ok) {
        fetchReservations()
      } else {
        alert('Failed to update status.')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filtered = reservations.filter(r => 
    r.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.date.includes(search)
  )

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' // pending
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Reservations</h1>
          <p className="text-gray-400 mt-1">Manage table bookings and guest requests.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#0a0a0c] border border-white/5 rounded-xl p-1">
          <button className="px-4 py-2 rounded-lg bg-brand-gold/10 text-brand-gold font-medium">List View</button>
          <button className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">Calendar</button>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or date (YYYY-MM-DD)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-gold/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Guest Info</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filtered.map(res => (
                  <tr key={res.reservation_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{res.customer_name}</p>
                      <p className="text-xs text-gray-500">{res.email}</p>
                      <p className="text-xs text-gray-500">{res.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar size={14} className="text-brand-gold" />
                        <span>{res.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Clock size={14} />
                        <span>{res.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{res.guests} Guests</p>
                      <p className="text-xs text-gray-500">{res.table_type} - {res.branch}</p>
                      {res.special_requests && (
                        <p className="text-xs text-brand-gold mt-1 line-clamp-1" title={typeof res.special_requests === 'string' ? res.special_requests : JSON.stringify(res.special_requests)}>
                          Note: {typeof res.special_requests === 'string' ? res.special_requests : JSON.stringify(res.special_requests)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${getStatusColor(res.status)} capitalize`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {res.status.toLowerCase() === 'pending' && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => updateStatus(res.reservation_id, 'confirmed')}
                            className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors border border-green-400/20"
                            title="Confirm"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => updateStatus(res.reservation_id, 'cancelled')}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-red-400/20"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
