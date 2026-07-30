'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, Loader2, CheckCircle, Clock, Package, Eye, X } from 'lucide-react'

type OrderItem = {
  id: number
  menu_item_id: string
  name: string
  price: number
  quantity: number
}

type Order = {
  id: string
  status: string
  customer_name: string
  address: string
  order_type: string
  table_number?: string
  customer_email?: string
  total: string
  created_at: number
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:3001"}/ws`)
    
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data)
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

  const updateStatus = async (id: string, newStatus: string) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/order/${id}/status`, {
        method: 'PATCH',
        headers: { 'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchOrders()
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({...selectedOrder, status: newStatus})
        }
      } else {
        alert('Failed to update status.')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filtered = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'preparing': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      case 'ready': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'out for delivery': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'delivered': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const nextStatusOptions: Record<string, string[]> = {
    'Pending': ['Preparing', 'Cancelled'],
    'Preparing': ['Ready', 'Cancelled'],
    'Ready': ['Out for Delivery', 'Completed'],
    'Out for Delivery': ['Delivered'],
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Orders Tracker</h1>
          <p className="text-gray-400 mt-1">Monitor live orders and update their statuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Order ID or Customer Name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-gold/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                No orders found.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-white/[0.02] flex items-center justify-between ${selectedOrder?.id === order.id ? 'bg-white/[0.05]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center">
                        {order.order_type === 'delivery' ? <Package className="text-blue-400" /> : <ShoppingBag className="text-brand-gold" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{order.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                          <span>{order.customer_name || 'Guest'}</span>
                          <span>•</span>
                          <span>{order.items.length} items</span>
                          <span>•</span>
                          <span className="text-brand-gold font-medium">${order.total}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                        <Clock size={12} />
                        {new Date(order.created_at * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 uppercase">
                        {order.order_type} {order.table_number && `(Table ${order.table_number})`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Details Panel */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 h-[calc(100vh-200px)] overflow-y-auto">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedOrder.id}</h2>
                  <p className="text-sm text-gray-400">{new Date(selectedOrder.created_at * 1000).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status)} uppercase`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Customer Details</h3>
                <div className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-white">{selectedOrder.customer_name || 'Guest'}</span>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-white">{selectedOrder.customer_email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-white capitalize">{selectedOrder.order_type}</span>
                  </div>
                  {selectedOrder.table_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Table:</span>
                      <span className="text-brand-gold font-bold">{selectedOrder.table_number}</span>
                    </div>
                  )}
                  {selectedOrder.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address:</span>
                      <span className="text-white text-right max-w-[200px]">{selectedOrder.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Order Items</h3>
                <div className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-3">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                          {item.quantity}x
                        </span>
                        <span className="text-white">{item.name}</span>
                      </div>
                      <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span className="text-brand-gold text-lg">${selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nextStatusOptions[selectedOrder.status]?.map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder.id, status)}
                      className="py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      Mark as {status}
                    </button>
                  ))}
                  {(!nextStatusOptions[selectedOrder.status] || nextStatusOptions[selectedOrder.status].length === 0) && (
                    <div className="col-span-2 text-center text-gray-500 text-sm py-2">
                      No further status updates available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Eye className="w-12 h-12 mb-4 opacity-50" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
