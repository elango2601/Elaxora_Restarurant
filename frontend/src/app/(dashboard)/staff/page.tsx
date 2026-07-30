'use client'

import { useEffect, useState } from 'react'
import { Clock, CheckCircle2, UtensilsCrossed, ChefHat } from 'lucide-react'

interface OrderItem {
  id: number
  menu_item_id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  status: string
  customer_name: string
  order_type: string
  table_number?: string
  total: number
  created_at: string
  items: OrderItem[]
}

export default function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/orders`, {
        headers: { 'ngrok-skip-browser-warning': 'true', 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    
    // Connect to WebSocket for real-time order updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:3001"}/ws`)
    
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      // Check if it's an order update (orders have an 'id' directly on the payload, reservations are wrapped in {type: "..."})
      if (payload.id && payload.id.startsWith('ORD-')) {
        setOrders(prev => {
          const exists = prev.some(o => o.id === payload.id)
          if (exists) {
            return prev.map(o => o.id === payload.id ? payload : o)
          } else {
            return [payload, ...prev]
          }
        })
      }
    }

    return () => ws.close()
  }, [])

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/order/${id}/status`, {
        method: 'PATCH',
        headers: { 'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchOrders()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const actionableOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Ready')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">POS & Orders</h1>
        <p className="text-gray-400">Live order tracking and table management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Orders Queue */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-brand-gold" /> Live Kitchen Queue
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                Pending: {orders.filter(o => o.status === 'Pending').length}
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                Cooking: {orders.filter(o => o.status === 'Preparing').length}
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                Ready: {orders.filter(o => o.status === 'Ready').length}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-gray-400 text-center mt-10">Loading orders...</p>
            ) : actionableOrders.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">No pending or ready orders right now.</p>
            ) : (
              actionableOrders.map(order => (
                <div key={order.id} className="bg-black/40 border border-white/10 p-5 rounded-xl flex flex-col sm:flex-row gap-4 justify-between animate-in slide-in-from-right duration-300">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-white">{order.id}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300">
                        {order.order_type} {order.table_number ? `- Table ${order.table_number}` : ''}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">Customer: {order.customer_name}</p>
                    <ul className="text-sm text-gray-400 space-y-1 mb-3">
                      {order.items.map(item => (
                        <li key={item.id}>{item.quantity}x {item.name}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-brand-gold">
                      Ordered at {new Date(order.created_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col justify-end gap-2 sm:w-32">
                    {order.status === 'Pending' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Preparing')}
                        className="bg-brand-gold/10 hover:bg-brand-gold hover:text-black text-brand-gold border border-brand-gold/50 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 font-semibold"
                      >
                        <ChefHat size={16} /> To Kitchen
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Delivered')}
                        className="bg-white/5 hover:bg-green-500 hover:text-white text-gray-400 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={16} /> Serve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table Status */}
        <div className="glass-panel p-6 rounded-2xl h-[600px] flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UtensilsCrossed className="text-brand-gold" /> Table Map
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: 1, status: 'free' },
              { num: 2, status: 'occupied' },
              { num: 3, status: 'occupied' },
              { num: 4, status: 'cleaning' },
              { num: 5, status: 'free' },
              { num: 6, status: 'reserved' },
            ].map(table => (
              <div 
                key={table.num} 
                className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 border-2 ${
                  table.status === 'free' ? 'border-green-500/50 bg-green-500/10 text-green-400' :
                  table.status === 'occupied' ? 'border-red-500/50 bg-red-500/10 text-red-400' :
                  table.status === 'cleaning' ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' :
                  'border-blue-500/50 bg-blue-500/10 text-blue-400'
                }`}
              >
                <span className="text-2xl font-bold font-serif">{table.num}</span>
                <span className="text-xs uppercase mt-1 tracking-wider">{table.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
