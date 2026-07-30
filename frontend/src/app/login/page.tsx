'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@elaxora.com')
  const [password, setPassword] = useState('admin123')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // useEffect(() => {
  //   // Automatically log out when visiting the login page
  //   localStorage.removeItem('elaxora_token')
  //   localStorage.removeItem('elaxora_user')
  //   document.cookie = 'elaxora_token=; path=/; max-age=0'
  // }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      
      if (data.success && data.data.access_token) {
        const token = data.data.access_token
        
        // Store in localStorage for client-side use
        localStorage.setItem('elaxora_token', token)
        localStorage.setItem('elaxora_user', JSON.stringify(data.data.user))
        
        // Store in cookie for Edge Middleware (RBAC)
        // Always set max-age to 3 hours to prevent session cookie issues and enforce timeout
        const maxAge = 60 * 60 * 3;
        document.cookie = `elaxora_token=${token}; path=/; max-age=${maxAge}`;
        
        // Route based on role
        const role = data.data.user.role
        if (role === 'admin') window.location.href = '/admin'
        else if (role === 'staff') window.location.href = '/staff'
        else if (role === 'kitchen') window.location.href = '/kitchen'
        else if (role === 'delivery') window.location.href = '/delivery'
        else window.location.href = '/'
      } else {
        setError(data.detail || 'Invalid credentials')
      }
    } catch (err) {
      console.error(err)
      setError('Network error. Please make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleOAuth = async () => {
    setGoogleLoading(true)
    // Mocking OAuth logic for now since we don't have a Google provider configured
    try {
      const res = await fetch('http://localhost:3001/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: "mock_google_id_token" })
      })
      const data = await res.json()
      if (data.success && data.data.access_token) {
        document.cookie = `elaxora_token=${data.data.access_token}; path=/; max-age=${60 * 60 * 3}`
        localStorage.setItem('elaxora_user', JSON.stringify(data.data.user))
        router.push('/') // Google users default to customer role in backend
      }
    } catch(err) {
      setError('Google OAuth is currently unavailable')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4 bg-[#050507]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel p-8 md:p-12 rounded-3xl w-full max-w-md relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>
        
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold gold-text-gradient tracking-widest block mb-4">
            ELAXORA
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Please sign in to access your dashboard.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-black/50 text-brand-gold focus:ring-brand-gold focus:ring-offset-black"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-400 cursor-pointer">
                Remember Me
              </label>
            </div>
            <Link href="#" onClick={(e) => { e.preventDefault(); alert('Please contact the IT administrator to reset your password.') }} className="text-sm font-medium text-brand-gold hover:text-yellow-400 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex justify-center items-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Login'}
          </button>
        </form>
        
        <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-gray-500 text-sm px-2 uppercase tracking-widest text-[10px]">OR</span>
            <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleOAuth}
          disabled={googleLoading}
          className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-3"
        >
          {googleLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account? <Link href="#" onClick={(e) => { e.preventDefault(); alert('Only administrators can create staff accounts.') }} className="text-brand-gold hover:text-yellow-400 transition-colors">Contact Admin</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
