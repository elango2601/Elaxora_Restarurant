'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, UserCircle, ShoppingBag } from 'lucide-react'

type User = {
  id: number
  name: string
  email: string
  role: string
}

type Order = {
  id: string
  customer_email?: string
  total: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      
      const [usersRes, ordersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/orders`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      
      const usersData = await usersRes.json()
      const ordersData = await ordersRes.json()
      
      if (usersData.data) {
        // Only keep customers
        setCustomers(usersData.data.filter((u: User) => u.role === 'customer'))
      }
      if (ordersData.data) {
        setOrders(ordersData.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const getCustomerStats = (email: string) => {
    const customerOrders = orders.filter(o => o.customer_email === email)
    const totalSpent = customerOrders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0)
    return {
      orderCount: customerOrders.length,
      totalSpent: totalSpent.toFixed(2)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Customers</h1>
          <p className="text-gray-400 mt-1">View registered customers and their order history.</p>
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
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Total Orders</th>
                <th className="px-6 py-4 font-medium text-right">Lifetime Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map(customer => {
                  const stats = getCustomerStats(customer.email)
                  return (
                    <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                            <UserCircle size={24} />
                          </div>
                          <p className="font-medium text-white">{customer.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <ShoppingBag size={14} className="text-gray-500" />
                          {stats.orderCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-brand-gold">
                          ${stats.totalSpent}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
