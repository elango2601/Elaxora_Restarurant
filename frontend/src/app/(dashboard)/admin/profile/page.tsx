'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCircle, Shield, Loader2, Save } from 'lucide-react'

type Profile = {
  id: number
  name: string
  email: string
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProfile = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        setProfile(data.data)
        setFormData({ ...formData, name: data.data.name })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!")
      return
    }

    setIsSubmitting(true)
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]

    const updatePayload: any = { name: formData.name }
    if (formData.password) {
      updatePayload.password = formData.password
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      })

      if (res.ok) {
        alert('Profile updated successfully!')
        setFormData({ ...formData, password: '', confirmPassword: '' })
        fetchProfile()
      } else {
        alert('Failed to update profile.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-serif gold-text-gradient">My Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account settings and credentials.</p>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-brand-gold/20 to-[#0a0a0c] border-b border-white/5 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-[#0a0a0c] border-4 border-[#050507] rounded-full flex items-center justify-center text-brand-gold text-4xl uppercase font-bold">
            {profile?.name.charAt(0)}
          </div>
        </div>
        
        <div className="pt-16 px-8 pb-8">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold">{profile?.name}</h2>
            <span className="flex items-center gap-1 px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-xs font-bold uppercase tracking-wider border border-brand-gold/20">
              <Shield size={12} />
              {profile?.role}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-400">Full Name</label>
                <input 
                  required type="text" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-400">Email Address (Non-editable)</label>
                <input 
                  type="email" 
                  value={profile?.email} disabled
                  className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              <p className="text-sm text-gray-500 mb-4">Leave blank if you do not want to change your password.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">New Password</label>
                  <input 
                    type="password" minLength={6}
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">Confirm New Password</label>
                  <input 
                    type="password" minLength={6}
                    value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-brand-gold text-black font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
