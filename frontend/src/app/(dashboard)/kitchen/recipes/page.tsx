"use client"
import { useState, useEffect } from 'react'
import { Book, Search, UtensilsCrossed, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

export default function RecipesPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/menu`)
      if (!res.ok) throw new Error('Failed to fetch menu recipes')
      const data = await res.json()
      setMenu(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))]

  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <div className="p-10 flex justify-center text-brand-gold animate-pulse">Loading Recipe Notes...</div>
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold gold-text-gradient">Recipe Notes</h1>
          <p className="text-gray-400 mt-1">Review dish compositions, preparation methods, and ingredients</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-brand-gold outline-none transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-brand-gold text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMenu.map(item => (
          <div key={item.id} className="bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden hover:border-brand-gold/50 transition-colors flex flex-col group">
            <div className="relative h-48 w-full bg-[#111] overflow-hidden">
              {item.image_url ? (
                <Image 
                  src={item.image_url} 
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                  <UtensilsCrossed size={40} />
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs text-brand-gold font-medium uppercase tracking-wider">
                {item.category}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-serif text-white mb-2">{item.name}</h3>
              
              <div className="flex-1 bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
                <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Book size={14} /> Description & Notes
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {item.description || "No specific recipe notes provided for this item. Standard preparation applies."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">Menu Price:</span>
                <span className="text-brand-gold font-bold">₹{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredMenu.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-10">
          No recipes found matching your search.
        </div>
      )}
    </div>
  )
}
