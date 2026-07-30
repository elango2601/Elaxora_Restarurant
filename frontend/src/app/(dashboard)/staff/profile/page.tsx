'use client'

import { useState, useEffect } from 'react'
import { UserCircle, Mail, Key, Shield, Clock, CalendarDays, Camera } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // In a real app, this would fetch from /me or decode JWT
    const storedUser = localStorage.getItem('elaxora_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser({ username: 'Staff Member', role: 'staff', email: 'staff@elaxora.com' })
      }
    } else {
      setUser({ username: 'Staff Member', role: 'staff', email: 'staff@elaxora.com' })
    }
  }, [])

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif gold-text-gradient">My Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account settings and view shift details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-32 h-32 rounded-full bg-brand-gold/10 border-2 border-brand-gold/30 flex items-center justify-center text-brand-gold">
                <UserCircle size={64} />
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
            <div className="flex items-center gap-2 text-brand-gold font-medium mb-4">
              <Shield size={16} />
              <span className="capitalize">{user.role}</span>
            </div>
            
            <div className="w-full pt-4 border-t border-white/10 space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-400">
                <span>Employee ID</span>
                <span className="text-white font-mono">EMP-2049</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Joined</span>
                <span className="text-white">Mar 15, 2024</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="text-brand-gold" /> Current Shift
            </h3>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <p className="text-white font-bold mb-1">Evening Service</p>
              <p className="text-sm text-gray-400">4:00 PM - 12:00 AM</p>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20 font-bold">Clocked In</span>
                <span className="text-xs text-gray-500">4 hrs 15 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Mail className="text-brand-gold" /> Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input type="text" defaultValue={user.username} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                  <input type="tel" defaultValue="+91 6374578233" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input type="email" defaultValue={user.email} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50" />
              </div>
              <div className="pt-2">
                <button className="px-6 py-2.5 bg-brand-gold text-black font-bold rounded-xl hover:bg-yellow-600 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Key className="text-brand-gold" /> Security & Authentication
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50" />
                </div>
              </div>
              <div className="pt-2">
                <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
