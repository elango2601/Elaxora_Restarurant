'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AuthNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
    if (token) {
      setIsLoggedIn(true)
      // Decode JWT to get role, or just check localStorage if we stored user there
      try {
        const payloadStr = atob(token.split('.')[1])
        const payload = JSON.parse(payloadStr)
        setRole(payload.role)
      } catch (e) {
        // failed to decode, assume normal user or let it be
      }
    }
  }, [])

  if (isLoggedIn) {
    let dashLink = '/kitchen'
    if (role === 'admin' || role === 'staff') dashLink = '/admin'
    if (role === 'delivery') dashLink = '/delivery'
    if (role === 'customer') dashLink = '/profile' // Assume profile for now

    return (
      <Link href={dashLink} className="text-sm font-medium hover:text-brand-gold transition-colors">
        Dashboard
      </Link>
    )
  }

  return (
    <Link href="/login" className="text-sm font-medium hover:text-brand-gold transition-colors">
      Login
    </Link>
  )
}
