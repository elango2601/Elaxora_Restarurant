'use client'

import { useCartStore } from '@/store/cartStore'
import { useState } from 'react'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    orderType: 'delivery',
    tableNumber: ''
  })

  if (items.length === 0) {
    return (
      <div className="py-24 px-4 text-center">
        <ShoppingBag className="w-24 h-24 mx-auto text-brand-gold opacity-50 mb-6" />
        <h1 className="text-3xl font-serif text-white mb-4">Your Cart is Empty</h1>
        <button onClick={() => router.push('/menu')} className="bg-brand-gold text-black font-bold py-3 px-8 rounded-full">
          Browse Menu
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      customer_name: formData.name,
      customer_email: formData.email,
      address: formData.orderType === 'delivery' ? formData.address : undefined,
      table_number: formData.orderType === 'dine-in' ? formData.tableNumber : undefined,
      order_type: formData.orderType,
      total: totalPrice().toFixed(2),
      items: items.map(i => ({
        menu_item_id: i.id.toString(),
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    }

    try {
      const res = await fetch('http://localhost:3001/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (json.success && json.data.checkout_url) {
        window.location.href = json.data.checkout_url
      } else {
        alert("Failed to initiate checkout")
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      alert("Error processing checkout")
      setLoading(false)
    }
  }

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Checkout Form */}
      <div className="flex-1 glass-panel p-8 rounded-2xl">
        <h2 className="text-3xl font-serif font-bold gold-text-gradient mb-8">Checkout Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/50 border border-brand-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/50 border border-brand-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
            <div className="flex gap-4">
              <label className={`flex-1 cursor-pointer p-4 rounded-xl border text-center transition-all ${formData.orderType === 'delivery' ? 'border-brand-gold bg-brand-gold/10' : 'border-white/10 hover:border-brand-gold/50'}`}>
                <input type="radio" name="orderType" value="delivery" className="hidden" checked={formData.orderType === 'delivery'} onChange={() => setFormData({...formData, orderType: 'delivery'})} />
                <span className="font-semibold text-white">Delivery</span>
              </label>
              <label className={`flex-1 cursor-pointer p-4 rounded-xl border text-center transition-all ${formData.orderType === 'pickup' ? 'border-brand-gold bg-brand-gold/10' : 'border-white/10 hover:border-brand-gold/50'}`}>
                <input type="radio" name="orderType" value="pickup" className="hidden" checked={formData.orderType === 'pickup'} onChange={() => setFormData({...formData, orderType: 'pickup'})} />
                <span className="font-semibold text-white">Pickup</span>
              </label>
              <label className={`flex-1 cursor-pointer p-4 rounded-xl border text-center transition-all ${formData.orderType === 'dine-in' ? 'border-brand-gold bg-brand-gold/10' : 'border-white/10 hover:border-brand-gold/50'}`}>
                <input type="radio" name="orderType" value="dine-in" className="hidden" checked={formData.orderType === 'dine-in'} onChange={() => setFormData({...formData, orderType: 'dine-in'})} />
                <span className="font-semibold text-white">Dine In</span>
              </label>
            </div>
          </div>

          {formData.orderType === 'delivery' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Address</label>
              <textarea 
                required
                rows={3}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-black/50 border border-brand-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold"
                placeholder="123 Main St, Apt 4B"
              />
            </div>
          )}

          {formData.orderType === 'dine-in' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-medium text-gray-300 mb-2">Table Number (If known)</label>
              <input 
                type="text" 
                value={formData.tableNumber}
                onChange={e => setFormData({...formData, tableNumber: e.target.value})}
                className="w-full bg-black/50 border border-brand-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold"
                placeholder="e.g. 12"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-gold hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : `Pay ₹${totalPrice().toFixed(2)} with Stripe`}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="md:w-96">
        <div className="glass-panel p-6 rounded-2xl sticky top-24">
          <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-brand-gold font-bold">{item.quantity}x</span>
                  <span className="text-gray-300 line-clamp-1">{item.name}</span>
                </div>
                <span className="text-white font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-lg">
            <span className="text-gray-400">Total</span>
            <span className="text-2xl font-bold gold-text-gradient">₹{totalPrice().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
