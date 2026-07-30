'use client'

import { useCartStore } from '@/store/cartStore'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function CartSidebar() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, totalPrice } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0a0a0c] border-l border-brand-gold/20 z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-brand-gold/10">
              <h2 className="text-2xl font-serif font-bold gold-text-gradient flex items-center gap-2">
                <ShoppingBag /> Your Order
              </h2>
              <button onClick={toggleCart} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/10 relative">
                    <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full p-1 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    )}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white">{item.name}</h4>
                        <p className="text-brand-gold">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-white/10 hover:bg-white/20 p-1 rounded">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-white/10 hover:bg-white/20 p-1 rounded">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-brand-gold/10 bg-[#0a0a0c]">
                <div className="flex justify-between items-center mb-6 text-lg">
                  <span className="text-gray-300">Total</span>
                  <span className="font-bold text-brand-gold text-2xl">₹{totalPrice().toFixed(2)}</span>
                </div>
                <Link href="/checkout" onClick={toggleCart} className="w-full block text-center bg-brand-gold hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
