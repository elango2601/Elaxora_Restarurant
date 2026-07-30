'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Search, Loader2, AlertTriangle, PackageSearch } from 'lucide-react'

type InventoryItem = {
  id: number
  name: string
  stock_quantity: number
  unit: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    stock_quantity: '',
    unit: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchInventory = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/inventory`, {
        headers: { 'ngrok-skip-browser-warning': 'true', 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        setItems(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]

    const payload = {
      ...formData,
      stock_quantity: parseFloat(formData.stock_quantity as string)
    }

    try {
      const url = editingItem 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/inventory/${editingItem.id}` 
        : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/inventory`
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchInventory()
      } else {
        alert('Failed to save item.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        setItems(items.filter(i => i.id !== id))
      } else {
        alert('Failed to delete item.')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        stock_quantity: item.stock_quantity.toString(),
        unit: item.unit || ''
      })
    } else {
      setEditingItem(null)
      setFormData({ name: '', stock_quantity: '', unit: '' })
    }
    setIsModalOpen(true)
  }

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const LOW_STOCK_THRESHOLD = 10;
  const lowStockItems = items.filter(i => i.stock_quantity <= LOW_STOCK_THRESHOLD)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Inventory</h1>
          <p className="text-gray-400 mt-1">Manage ingredients and stock levels.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-brand-gold text-black px-4 py-2 rounded-xl font-bold hover:bg-yellow-600 transition-colors"
        >
          <Plus size={20} />
          <span>Add Stock</span>
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4 items-start">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-400">Low Stock Alert</h3>
            <p className="text-sm text-red-400/80 mt-1">
              {lowStockItems.length} item(s) are running critically low. Please reorder soon.
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-gold/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Ingredient</th>
                <th className="px-6 py-4 font-medium">Stock Level</th>
                <th className="px-6 py-4 font-medium">Unit</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold" />
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <PackageSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLow = item.stock_quantity <= LOW_STOCK_THRESHOLD;
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-medium text-white">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${isLow ? 'text-red-400' : 'text-green-400'}`}>
                          {item.stock_quantity}
                        </span>
                        {isLow && <span className="ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">Low</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {item.unit || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openModal(item)}
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">
                {editingItem ? 'Edit Inventory' : 'Add Inventory'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Ingredient Name</label>
                  <input 
                    required type="text" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Quantity</label>
                    <input 
                      required type="number" step="0.01" min="0"
                      value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Unit (e.g. kg, L, pcs)</label>
                    <input 
                      required type="text" 
                      value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-brand-gold text-black font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {editingItem ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
