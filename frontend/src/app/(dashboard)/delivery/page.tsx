'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Package } from 'lucide-react'

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [wsStatus, setWsStatus] = useState('Connecting...')

  useEffect(() => {
    // Connect to WebSocket for real-time delivery updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:3001"}/ws/delivery`)
    
    ws.onopen = () => {
      setWsStatus('Live')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setDeliveries(prev => [data, ...prev])
    }

    ws.onclose = () => {
      setWsStatus('Disconnected')
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Driver Portal</h1>
          <p className="text-gray-400 mt-1">Live order assignments and navigation</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {wsStatus === 'Live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${wsStatus === 'Live' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-sm text-gray-400">Connection: {wsStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-brand-gold" />
            <h2 className="text-xl font-bold">Active Delivery Route</h2>
          </div>
          <div className="h-64 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500 flex flex-col items-center">
              <Navigation className="w-8 h-8 mb-2 opacity-50" />
              <p>Waiting for new assignment...</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-blue-500" />
            <h2 className="text-xl font-bold">Pending Assignments</h2>
          </div>
          <div className="space-y-4">
            <div className="text-center py-6 text-gray-500 border border-dashed border-white/10 rounded-xl">
              No pending deliveries
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
