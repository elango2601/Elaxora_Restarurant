'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, DollarSign, TrendingUp, CreditCard } from 'lucide-react'

type Order = {
  id: string
  status: string
  customer_name: string
  total: string
  created_at: number
}

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchPayments = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/orders`, {
        headers: { 'ngrok-skip-browser-warning': 'true', 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        // Only show orders that are either completed, delivered, or have a total (assuming they're paid)
        setOrders(data.data.filter((o: Order) => o.status !== 'Cancelled'))
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const filtered = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase()))
  )

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0)
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Payments</h1>
          <p className="text-gray-400 mt-1">Review processed transactions and revenue.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Transactions</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-400/10 flex items-center justify-center text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Average Order Value</p>
            <p className="text-2xl font-bold text-white">${averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
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
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
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
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-300">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      {order.customer_name || 'Guest'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(order.created_at * 1000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs border border-green-400/20 text-green-400 bg-green-400/10">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-brand-gold">
                      ${parseFloat(order.total || '0').toFixed(2)}
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
