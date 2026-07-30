'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Package, Loader2, DollarSign } from 'lucide-react'

type OrderItem = {
  name: string
  price: number
  quantity: number
}

type Order = {
  id: string
  status: string
  total: string
  items: OrderItem[]
  created_at: number
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/orders`, {
          headers: { 'ngrok-skip-browser-warning': 'true', 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.data) {
          setOrders(data.data.filter((o: Order) => o.status !== 'Cancelled'))
        }
      } catch (error) {
        console.error('Failed to fetch for reports:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
      </div>
    )
  }

  // --- Aggregate Data ---
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0)
  
  // Calculate top selling items
  const itemCounts: Record<string, number> = {}
  orders.forEach(order => {
    order.items.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity
    })
  })
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Calculate today's revenue (last 24h roughly)
  const now = Date.now() / 1000
  const todayOrders = orders.filter(o => now - o.created_at < 86400)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-serif gold-text-gradient">Reports & Analytics</h1>
        <p className="text-gray-400 mt-1">Key performance indicators and sales metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Lifetime Revenue</p>
              <h3 className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center text-green-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Revenue (Last 24h)</p>
              <h3 className="text-2xl font-bold text-white">${todayRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
              <Package size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Orders Completed</p>
              <h3 className="text-2xl font-bold text-white">{orders.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="text-brand-gold" />
            Top Selling Items
          </h3>
          
          <div className="space-y-4">
            {topItems.length === 0 ? (
              <p className="text-gray-500 text-sm">No sales data available yet.</p>
            ) : (
              topItems.map(([name, count], index) => {
                // Calculate percentage for width bar
                const maxCount = topItems[0][1]
                const percentage = Math.round((count / maxCount) * 100)
                
                return (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">
                        <span className="text-gray-500 mr-2">#{index + 1}</span>
                        {name}
                      </span>
                      <span className="text-gray-400 font-bold">{count} sold</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-brand-gold rounded-full"
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Activity Mockup */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6">Recent Sales Activity</h3>
          <div className="space-y-4">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{order.id}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at * 1000).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-gold font-bold">${parseFloat(order.total || '0').toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{order.items.length} items</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
