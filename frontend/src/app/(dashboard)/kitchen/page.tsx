'use client'

import { useEffect, useState } from 'react'
import { Flame, CheckCircle, Package } from 'lucide-react'

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

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [wsStatus, setWsStatus] = useState('Connecting...')

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
    
    // Connect to WebSocket for real-time kitchen updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:3001"}/ws/kitchen`)
    
    ws.onopen = () => {
      setWsStatus('Live')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setOrders(prev => {
        // If order already exists, update it, otherwise add it to the top
        const exists = prev.some(o => o.id === data.id)
        if (exists) {
          return prev.map(o => o.id === data.id ? data : o)
        } else {
          return [data, ...prev]
        }
      })
    }

    ws.onclose = () => {
      setWsStatus('Disconnected')
    }

    return () => {
      ws.close()
    }
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

  const preparingOrders = orders.filter(o => o.status === 'Preparing')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Live Kitchen Display System</h1>
          <p className="text-gray-400 mt-1">Real-time order synchronization</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {wsStatus === 'Live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${wsStatus === 'Live' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-sm text-gray-400">Connection: {wsStatus}</span>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 min-h-[600px]">
        <div className="flex items-center gap-3 mb-6">
          <Flame className="text-red-500" />
          <h2 className="text-xl font-bold">Currently Preparing</h2>
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full ml-auto">
            {preparingOrders.length} Orders
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
            Syncing with Staff POS...
          </div>
        ) : preparingOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
            No orders being prepared right now. Relax!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {preparingOrders.map(order => (
              <div key={order.id} className="bg-black/60 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-brand-gold/10 px-4 py-3 border-b border-brand-gold/20 flex justify-between items-center">
                  <h3 className="font-bold text-white text-lg">{order.id}</h3>
                  <span className="text-xs bg-brand-gold text-black px-2 py-1 rounded font-bold">
                    {order.order_type}
                  </span>
                </div>
                <div className="p-4 flex-1">
                  <p className="text-sm text-gray-400 mb-4">
                    {order.table_number ? `Table ${order.table_number}` : order.customer_name}
                  </p>
                  <ul className="space-y-3 mb-4">
                    {order.items.map(item => (
                      <li key={item.id} className="flex gap-3 text-white border-b border-white/5 pb-2 last:border-0">
                        <span className="font-bold text-brand-gold">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500">
                    Ordered at {new Date(order.created_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="p-4 bg-white/5 mt-auto">
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'Ready')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} /> Mark as Ready
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
