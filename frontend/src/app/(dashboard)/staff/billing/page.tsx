'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, CreditCard, Receipt, DollarSign, CheckCircle2, Printer } from 'lucide-react'
import ReceiptPrinter from '@/components/ReceiptPrinter'
import { useSettings } from '@/context/SettingsContext'

type OrderItem = {
  menu_item_id: number
  quantity: number
  price: number
  name: string
}

type Order = {
  id: string
  customer_name: string
  order_type: string
  status: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  created_at: string
}

export default function BillingPage() {
  const { settings } = useSettings()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchOrders = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        // Filter out fully completed/paid orders if needed, or just show 'delivered' / 'ready'
        // For POS, typically we bill tables that are 'delivered' or 'preparing' 
        const billableOrders = data.data.filter((o: Order) => o.status !== 'completed' && o.order_type === 'Dine-In')
        setOrders(billableOrders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const processPayment = async () => {
    if (!selectedOrder) return
    setIsProcessing(true)
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/order/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      })
      
      if (res.ok) {
        alert('Payment processed and Tab Closed successfully!')
        setSelectedOrder(null)
        fetchOrders()
      } else {
        alert('Failed to process payment.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const filtered = orders.filter(o => 
    (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (o.id || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Active Tables List */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold font-serif gold-text-gradient flex items-center gap-3">
              <CreditCard /> Billing
            </h1>
            <p className="text-gray-400 mt-1">Settle checks and print receipts for tables.</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search table or Order ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-brand-gold/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No active dine-in orders pending payment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              {filtered.map(order => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-black/40 border p-5 rounded-xl cursor-pointer transition-all ${
                    selectedOrder?.id === order.id 
                      ? 'border-brand-gold bg-brand-gold/5' 
                      : 'border-white/10 hover:border-brand-gold/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-white">{order.customer_name || 'Guest'}</h3>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300 font-mono">
                      {(order.id || '').substring(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className={`text-xs px-2 py-1 rounded-full border font-bold uppercase ${
                      order.status === 'delivered' ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-xl font-bold text-brand-gold">${parseFloat(order.total as any).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bill Preview / Checkout */}
      <div className="w-full lg:w-[450px] bg-white text-black rounded-2xl overflow-hidden shrink-0 flex flex-col shadow-2xl">
        {selectedOrder ? (
          <div className="flex flex-col h-full">
            <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Receipt size={20} /> Checkout
              </h2>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Printer size={16} /> Print
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-gray-50">
              <div className="w-full max-w-sm">
                <ReceiptPrinter 
                  orderId={selectedOrder.id || ''}
                  customerName={selectedOrder.customer_name || 'Guest'}
                  items={selectedOrder.items || []}
                  subtotal={parseFloat(selectedOrder.subtotal as any) || 0}
                  total={parseFloat(selectedOrder.total as any) || 0}
                  date={selectedOrder.created_at || new Date().toISOString()}
                />
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-200 space-y-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Amount Due:</span>
                <span>${parseFloat(selectedOrder.total as any).toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="py-3 rounded-xl bg-black text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <><DollarSign size={18} /> Cash</>}
                </button>
                <button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="py-3 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <><CreditCard size={18} /> Card</>}
                </button>
                <button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="col-span-2 py-3 rounded-xl bg-brand-gold text-[#0a0a0c] font-bold flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors disabled:opacity-50 mt-2"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Close Tab</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center bg-[#0a0a0c] border border-white/5">
            <Receipt size={64} className="opacity-20 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Select a Table to Bill</h3>
            <p className="text-sm">Choose an active dine-in order to generate a receipt and process payment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
