'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, ShoppingBag, CalendarDays, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
  const [logs, setLogs] = useState([
    { time: '10 mins ago', msg: 'System started', type: 'info' }
  ])
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    totalReservations: 0,
    activeStaff: 0
  })

  // Simulated data fetch
  useEffect(() => {
    // In a real app, fetch from backend GET /admin/stats
    setStats({
      totalSales: 125400,
      activeOrders: 8,
      totalReservations: 12,
      activeStaff: 5
    })

    // Connect WebSocket for real-time notifications
    const ws = new WebSocket('ws://localhost:3001/ws')
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'new_reservation') {
          setStats(prev => ({...prev, totalReservations: prev.totalReservations + 1}))
          setLogs(prev => [{ time: 'Just now', msg: `New reservation from ${data.data.customer_name}`, type: 'success' }, ...prev])
        }
      } catch (err) {
        console.error(err)
      }
    }
    
    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Overview</h1>
        <p className="text-gray-400">Welcome back to the Admin Dashboard.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-brand-gold">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white">₹{stats.totalSales.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-400">
            <TrendingUp size={16} className="mr-1" />
            <span>+12.5% from last month</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Orders</p>
              <h3 className="text-2xl font-bold text-white">{stats.activeOrders}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Reservations</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalReservations}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <CalendarDays size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Staff Online</p>
              <h3 className="text-2xl font-bold text-white">{stats.activeStaff}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Table */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[1, 2, 3, 4].map(i => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 text-brand-gold">ORD-00{i}</td>
                    <td className="py-4 text-gray-300">Customer {i}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pending</span>
                    </td>
                    <td className="py-4 font-bold">₹1,250</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">System Activity</h2>
          <div className="space-y-6">
            {logs.slice(0, 5).map((log, i) => (
              <div key={i} className="flex gap-4 animate-in fade-in duration-300">
                <div className={`mt-1 w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-green-500' : log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                <div>
                  <p className="text-sm text-gray-300">{log.msg}</p>
                  <span className="text-xs text-gray-500">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
