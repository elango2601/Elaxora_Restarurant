'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingBag, Plus, Minus, Trash2, CreditCard, ChefHat, Loader2, Utensils, Bell } from 'lucide-react'

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_available: boolean
}

type CartItem = MenuItem & { quantity: number; notes?: string }

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableNum, setTableNum] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    // Connect to WebSocket for real-time notifications
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:3001"}/ws`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.status === 'Ready') {
        const tableStr = data.table_number ? ` (Table ${data.table_number})` : ''
        setNotification(`Food is ready for ${data.customer_name}${tableStr}! Please collect from kitchen.`)
        // Auto-dismiss after 10 seconds
        setTimeout(() => setNotification(null), 10000)
      }
    }
    return () => ws.close()
  }, [])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/menu`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setMenuItems(data.data)
          const cats = Array.from(new Set(data.data.map((item: MenuItem) => item.category)))
          setCategories(['All', ...(cats as string[])])
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCat = activeCategory === 'All' || item.category === activeCategory
    // is_available does not exist on the backend model, so we just return the other conditions
    return matchesSearch && matchesCat
  })

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.id === item.id)
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQ = c.quantity + delta
        return newQ > 0 ? { ...c, quantity: newQ } : c
      }
      return c
    }))
  }

  const removeItem = (id: number) => setCart(cart.filter(c => c.id !== id))

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const submitOrder = async () => {
    if (cart.length === 0) return alert('Cart is empty')
    setIsSubmitting(true)

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      
      const payload = {
        customer_name: `Table ${tableNum}`,
        customer_email: 'dinein@elaxora.com',
        order_type: 'Dine-In',
        table_number: tableNum,
        items: cart.map(c => ({
          menu_item_id: c.id.toString(),
          name: c.name,
          quantity: c.quantity,
          price: c.price,
          special_instructions: c.notes || ''
        })),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        special_instructions: `Dine-In order for Table ${tableNum}`
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/pos/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert(`Order sent to Kitchen for Table ${tableNum}!`)
        setCart([])
      } else {
        alert('Failed to submit order.')
      }
    } catch (error) {
      console.error(error)
      alert('Error submitting order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {notification && (
        <div className="fixed top-24 right-8 z-50 bg-brand-gold text-black px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-black/10 p-2 rounded-full">
            <Bell size={24} className="animate-bounce" />
          </div>
          <div className="font-bold text-lg">{notification}</div>
          <button onClick={() => setNotification(null)} className="ml-4 text-black/50 hover:text-black">
            ✕
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-serif gold-text-gradient">Point of Sale</h1>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-gold/50"
              />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  activeCategory === cat 
                    ? 'bg-brand-gold text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="bg-black/40 border border-white/5 hover:border-brand-gold/50 rounded-xl overflow-hidden cursor-pointer group transition-all"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-white/5">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Utensils size={32} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-brand-gold font-bold px-2 py-1 rounded text-sm">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-[400px] flex flex-col bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-brand-gold" /> Current Order
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Table</label>
            <select 
              value={tableNum} 
              onChange={e => setTableNum(e.target.value)}
              className="bg-black border border-white/10 rounded-lg px-2 py-1 text-white font-bold focus:outline-none focus:border-brand-gold"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                  <div className="text-brand-gold text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeItem(item.id)} className="text-red-400/50 hover:text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2 bg-black/50 rounded-lg border border-white/10">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:text-brand-gold"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:text-brand-gold"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 space-y-3">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10">
            <span>Total</span>
            <span className="text-brand-gold">${total.toFixed(2)}</span>
          </div>

          <div className="pt-4">
            <button 
              onClick={submitOrder}
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 rounded-xl bg-brand-gold text-[#0a0a0c] font-bold text-lg flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <ChefHat size={24} />}
              Send to Kitchen
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
