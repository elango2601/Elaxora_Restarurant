'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { Plus } from 'lucide-react'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  is_sold_out: boolean
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const { addItem } = useCartStore()

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/menu`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        const json = await res.json()
        if (json.success) {
          setItems(json.data)
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]
  
  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(i => i.category === activeCategory)

  return (
    <div className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold gold-text-gradient mb-6">Our Menu</h1>
        <p className="text-xl text-gray-400">Discover our culinary masterpieces, crafted with passion.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      ) : (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat || 'All')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === (cat || 'All')
                    ? 'bg-brand-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-brand-glass text-gray-300 hover:text-white hover:border-brand-gold/50 border border-transparent'
                }`}
              >
                {cat || 'Uncategorized'}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="glass-panel rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full relative">
                {item.is_sold_out && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                    Sold Out
                  </div>
                )}
                
                <div className="h-48 overflow-hidden relative">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.is_sold_out ? 'grayscale opacity-50' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent opacity-80"></div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between relative mt-[-2rem]">
                  <div>
                    <h3 className="text-2xl font-bold font-serif mb-2 text-white drop-shadow-md">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-brand-gold">₹{item.price.toFixed(2)}</span>
                    <button 
                      disabled={item.is_sold_out}
                      onClick={() => addItem({ id: item.id.toString(), name: item.name, price: item.price, quantity: 1, image: item.image })}
                      className="bg-brand-glass hover:bg-brand-gold hover:text-black border border-brand-gold/50 text-brand-gold p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-400 glass-panel rounded-xl">
              No items found in this category.
            </div>
          )}
        </>
      )}
    </div>
  )
}
