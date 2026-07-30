"use client"
import { useState, useEffect } from 'react'
import { UserCircle, Mail, ShieldCheck, KeyRound, Save } from 'lucide-react'

interface UserProfile {
  email: string
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // Read JWT from cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setProfile({
          email: payload.sub,
          role: payload.role
        })
      } catch (e) {
        console.error("Invalid token")
      }
    }
  }, [])

  if (!profile) {
    return <div className="p-10 flex justify-center text-brand-gold animate-pulse">Loading Profile...</div>
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-10 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-serif font-bold gold-text-gradient">Kitchen Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1 md:col-span-1 bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-brand-gold/10 border-2 border-brand-gold flex items-center justify-center text-brand-gold mb-4 relative">
            <UserCircle size={48} />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-[#0a0a0c] rounded-full"></div>
          </div>
          
          <h2 className="text-xl font-serif text-white truncate w-full">{profile.email.split('@')[0]}</h2>
          <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
          
          <div className="mt-6 w-full flex items-center justify-center gap-2 bg-white/5 py-2 rounded-lg border border-white/10">
            <ShieldCheck size={16} className="text-brand-gold" />
            <span className="text-sm font-medium uppercase tracking-widest text-brand-gold">
              {profile.role} Access
            </span>
          </div>
        </div>

        {/* Settings Form */}
        <div className="col-span-1 md:col-span-2 bg-[#0a0a0c] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-serif text-white mb-6 border-b border-white/10 pb-4">Account Information</h3>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Mail size={14} /> Email Address
              </label>
              <input 
                type="email" 
                value={profile.email}
                disabled
                className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
              />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-lg font-serif text-white mb-6">Security</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <KeyRound size={14} /> Current Password
                  </label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Leave blank to keep current"
                    className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => alert('Profile update functionality coming soon.')}
                className="flex items-center gap-2 bg-brand-gold text-black font-bold py-3 px-6 rounded-xl hover:bg-brand-gold/90 transition-all"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
