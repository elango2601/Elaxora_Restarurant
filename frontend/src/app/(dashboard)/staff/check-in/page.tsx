'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Search, Loader2, Check } from 'lucide-react'

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
}

export default function CheckInPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchTodayReservations = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/reservations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        // Filter only today's reservations
        const todayStr = new Date().toISOString().split('T')[0]
        const todayRes = data.data.filter((r: Reservation) => r.date === todayStr)
        // Sort by time
        todayRes.sort((a: Reservation, b: Reservation) => a.time.localeCompare(b.time))
        setReservations(todayRes)
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayReservations()
  }, [])

  const checkInGuest = async (id: string) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/reservation/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: 'seated' })
      })
      if (res.ok) {
        fetchTodayReservations()
      } else {
        alert('Failed to check in guest.')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filtered = reservations.filter(r => 
    r.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    r.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Check-in Guests</h1>
          <p className="text-gray-400 mt-1">Manage arriving reservations for today.</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
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
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Guest Info</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
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
                    No reservations found for today.
                  </td>
                </tr>
              ) : (
                filtered.map(res => (
                  <tr key={res.reservation_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-bold text-lg text-brand-gold">{res.time}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{res.customer_name}</p>
                      <p className="text-xs text-gray-500">{res.phone} &bull; {res.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{res.guests} Guests</p>
                      <p className="text-xs text-gray-400">{res.table_type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        res.status === 'seated' ? 'text-green-400 bg-green-400/10 border-green-400/20' : 
                        res.status === 'completed' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                        res.status === 'cancelled' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                        'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                      } capitalize`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {res.status === 'pending' || res.status === 'confirmed' ? (
                        <button 
                          onClick={() => checkInGuest(res.reservation_id)}
                          className="px-4 py-2 bg-brand-gold text-black rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors flex items-center justify-end gap-2 ml-auto"
                        >
                          <CheckSquare size={16} /> Check In
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Checked In</span>
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
