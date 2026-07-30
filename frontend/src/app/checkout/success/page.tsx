'use client'

import { useCartStore } from '@/store/cartStore'
import { useEffect, Suspense } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const { clearCart } = useCartStore()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Clear cart upon successful checkout
    if (orderId && sessionId) {
      clearCart()
    }
  }, [orderId, sessionId, clearCart])

  return (
    <div className="py-24 px-4 text-center max-w-2xl mx-auto">
      <div className="flex justify-center mb-8">
        <div className="bg-green-500/20 p-4 rounded-full">
          <CheckCircle2 className="w-24 h-24 text-green-500" />
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Payment Successful!</h1>
      
      {orderId ? (
        <p className="text-xl text-gray-300 mb-2">
          Your order <strong className="text-brand-gold">{orderId}</strong> has been confirmed.
        </p>
      ) : (
        <p className="text-xl text-gray-300 mb-2">Your order has been confirmed.</p>
      )}
      
      <p className="text-gray-400 mb-10">
        We have sent a confirmation email with your order details. Our chefs are preparing your exquisite meal.
      </p>
      
      <div className="flex justify-center gap-4">
        <Link href="/menu" className="bg-brand-glass border border-white/20 hover:border-brand-gold text-white font-bold py-3 px-8 rounded-full transition-all">
          Back to Menu
        </Link>
        <Link href="/" className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          Home <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-brand-gold">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
