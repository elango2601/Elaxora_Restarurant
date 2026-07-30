'use client'

import { useState, useEffect } from 'react'
import { UtensilsCrossed, Users, Clock, Loader2, CheckCircle2 } from 'lucide-react'

type Table = {
  num: number
  status: 'free' | 'occupied' | 'cleaning' | 'reserved'
  seats: number
  activeOrderId?: string
  reservationTime?: string
  partyName?: string
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([
    { num: 1, status: 'free', seats: 2 },
    { num: 2, status: 'occupied', seats: 2, partyName: 'Table 2', activeOrderId: 'ORD-102' },
    { num: 3, status: 'occupied', seats: 4, partyName: 'Table 3', activeOrderId: 'ORD-105' },
    { num: 4, status: 'cleaning', seats: 4 },
    { num: 5, status: 'free', seats: 6 },
    { num: 6, status: 'reserved', seats: 6, partyName: 'Smith Party', reservationTime: '19:30' },
    { num: 7, status: 'free', seats: 2 },
    { num: 8, status: 'free', seats: 2 },
    { num: 9, status: 'occupied', seats: 4, partyName: 'Table 9', activeOrderId: 'ORD-108' },
    { num: 10, status: 'free', seats: 4 },
    { num: 11, status: 'reserved', seats: 8, partyName: 'Johnson Corp', reservationTime: '20:00' },
    { num: 12, status: 'cleaning', seats: 8 },
  ])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  
  // Real implementation would fetch active orders and reservations to populate this dynamically
  // For now, it serves as a beautiful interactive UI as requested for the utility pages scope.

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'free': return 'border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
      case 'occupied': return 'border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
      case 'cleaning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
      case 'reserved': return 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-400'
    }
  }

  const markClean = (num: number) => {
    setTables(tables.map(t => t.num === num ? { ...t, status: 'free' } : t))
    setSelectedTable(null)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      {/* Table Map Section */}
      <div className="flex-[2] flex flex-col min-h-0 bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif gold-text-gradient flex items-center gap-3">
              <UtensilsCrossed /> Floor Plan
            </h1>
            <p className="text-gray-400 mt-1">Live overview of restaurant seating.</p>
          </div>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Free</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Occupied</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Cleaning</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Reserved</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 p-2">
            {tables.map(table => (
              <div 
                key={table.num} 
                onClick={() => setSelectedTable(table)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 border-2 ${getStatusColor(table.status)} ${selectedTable?.num === table.num ? 'ring-4 ring-white/20' : ''}`}
              >
                <span className="text-4xl font-bold font-serif mb-2">{table.num}</span>
                <span className="text-sm uppercase tracking-wider font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                  {table.status}
                </span>
                <div className="mt-2 flex gap-2 text-xs opacity-70">
                  <span className="flex items-center gap-1"><Users size={12} /> {table.seats}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Details Sidebar */}
      <div className="w-full lg:w-[350px] bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden shrink-0">
        {selectedTable ? (
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border-2 ${getStatusColor(selectedTable.status)}`}>
                {selectedTable.num}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Table {selectedTable.num}</h2>
                <p className="text-gray-400 capitalize">{selectedTable.status} &bull; {selectedTable.seats} Seats</p>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              {selectedTable.status === 'occupied' && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-bold text-brand-gold mb-4 text-lg">Active Session</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Party Name</span>
                      <span className="font-bold">{selectedTable.partyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order ID</span>
                      <span className="font-bold">{selectedTable.activeOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seated At</span>
                      <span className="font-bold">45 mins ago</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2 bg-brand-gold text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors">
                    View Order Details
                  </button>
                </div>
              )}

              {selectedTable.status === 'reserved' && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-bold text-brand-gold mb-4 text-lg">Upcoming Reservation</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Guest Name</span>
                      <span className="font-bold">{selectedTable.partyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time</span>
                      <span className="font-bold text-brand-gold flex items-center gap-1"><Clock size={14} /> {selectedTable.reservationTime}</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors">
                    Check In Guest
                  </button>
                </div>
              )}

              {selectedTable.status === 'cleaning' && (
                <div className="flex flex-col items-center justify-center h-48 bg-white/5 rounded-xl border border-white/10 text-center p-6">
                  <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Table needs cleaning</h3>
                  <p className="text-sm text-gray-400 mb-6">Staff has been notified.</p>
                  <button onClick={() => markClean(selectedTable.num)} className="w-full py-2 bg-green-500 text-black font-bold rounded-lg hover:bg-green-600 transition-colors flex justify-center items-center gap-2">
                    <CheckCircle2 size={18} /> Mark as Ready
                  </button>
                </div>
              )}

              {selectedTable.status === 'free' && (
                <div className="flex flex-col items-center justify-center h-48 bg-white/5 rounded-xl border border-white/10 text-center p-6">
                  <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Ready to Seat</h3>
                  <p className="text-sm text-gray-400">Table is fully prepared for the next guests.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
            <UtensilsCrossed size={48} className="opacity-20 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Select a Table</h3>
            <p className="text-sm">Click on any table in the floor plan to view its live status and details.</p>
          </div>
        )}
      </div>
    </div>
  )
}
