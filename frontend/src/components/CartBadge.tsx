'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CartBadge() {
  const { totalItems, toggleCart } = useCartStore()
  
  // Hydration fix for Zustand persist
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const count = totalItems()

  return (
    <button onClick={toggleCart} className="text-gray-300 hover:text-brand-gold transition-colors relative p-2">
      <ShoppingBag className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute top-0 right-0 bg-brand-gold text-black text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
          {count}
        </span>
      )}
    </button>
  )
}
