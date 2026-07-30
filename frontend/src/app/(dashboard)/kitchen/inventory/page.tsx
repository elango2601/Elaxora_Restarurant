"use client"
import { useState, useEffect } from 'react'
import { Package, AlertTriangle, Search, Plus, Minus, CheckCircle } from 'lucide-react'

interface InventoryItem {
  id: number
  name: string
  stock_quantity: number
  unit: string | null
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/inventory`, {
        headers: { 'ngrok-skip-browser-warning': 'true', 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch inventory')
      const data = await res.json()
      setInventory(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (id: number, currentStock: number, change: number) => {
    const newStock = Math.max(0, currentStock + change)
    if (newStock === currentStock) return // No change

    setUpdating(id)
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/inventory/${id}`, {
        method: 'PUT',
        headers: { 'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock_quantity: newStock })
      })

      if (!res.ok) throw new Error('Failed to update stock')
      
      // Update local state
      setInventory(prev => prev.map(item => item.id === id ? { ...item, stock_quantity: newStock } : item))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.stock_quantity - b.stock_quantity) // Sort by lowest stock first

  if (loading) {
    return <div className="p-10 flex justify-center text-brand-gold animate-pulse">Loading Inventory...</div>
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold gold-text-gradient">Inventory Alerts</h1>
          <p className="text-gray-400 mt-1">Monitor low stock and quickly update ingredient quantities</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search ingredients..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredInventory.map(item => {
          const isLowStock = item.stock_quantity <= 10
          const isOutOfStock = item.stock_quantity === 0
          
          return (
            <div 
              key={item.id} 
              className={`bg-[#0a0a0c] border rounded-xl p-5 transition-all ${
                isOutOfStock 
                  ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                  : isLowStock 
                    ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                    : 'border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isOutOfStock ? 'bg-red-500/10 text-red-500' : isLowStock ? 'bg-yellow-500/10 text-yellow-500' : 'bg-brand-gold/10 text-brand-gold'
                  }`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white truncate max-w-[150px]">{item.name}</h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{item.unit || 'Units'}</span>
                  </div>
                </div>
                
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">Empty</span>
                ) : isLowStock ? (
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-1 rounded">Low</span>
                ) : (
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> OK</span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-2xl font-serif text-white">
                  {item.stock_quantity}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateStock(item.id, item.stock_quantity, -1)}
                    disabled={updating === item.id || item.stock_quantity === 0}
                    className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <button 
                    onClick={() => updateStock(item.id, item.stock_quantity, 1)}
                    disabled={updating === item.id}
                    className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => updateStock(item.id, item.stock_quantity, 10)}
                    disabled={updating === item.id}
                    className="h-8 px-3 rounded bg-brand-gold text-black font-medium text-xs hover:bg-brand-gold/90 transition-colors disabled:opacity-50 ml-1"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredInventory.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-10">
          No inventory items found.
        </div>
      )}
    </div>
  )
}
