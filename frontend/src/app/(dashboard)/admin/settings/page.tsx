'use client'

import { useState, useEffect } from 'react'
import { Save, Store, Clock, Calculator, Loader2 } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'

export default function SettingsPage() {
  const { settings, refreshSettings } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'tax'>('general')

  const [formData, setFormData] = useState({
    restaurantName: 'Elaxora',
    email: 'contact@elaxora.com',
    phone: '+91 6374578233',
    address: '123 Luxury Lane, Culinary District',
    
    // Tax & Fees
    taxRate: '8.5',
    serviceFee: '15',
    deliveryFee: '5.00',
    
    // Hours
    mondayOpen: '11:00', mondayClose: '23:00',
    tuesdayOpen: '11:00', tuesdayClose: '23:00',
    wednesdayOpen: '11:00', wednesdayClose: '23:00',
    thursdayOpen: '11:00', thursdayClose: '23:00',
    fridayOpen: '11:00', fridayClose: '00:00',
    saturdayOpen: '10:00', saturdayClose: '00:00',
    sundayOpen: '10:00', sundayClose: '22:00'
  })

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        restaurantName: settings.restaurant_name || prev.restaurantName,
        email: settings.email || prev.email,
        phone: settings.phone || prev.phone,
        address: settings.address || prev.address,
        taxRate: settings.tax_rate?.toString() || prev.taxRate,
        serviceFee: settings.service_fee?.toString() || prev.serviceFee,
        deliveryFee: settings.delivery_fee?.toString() || prev.deliveryFee,
        ...(settings.hours_json || {})
      }))
    }
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      
      const payload = {
        restaurant_name: formData.restaurantName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        tax_rate: parseFloat(formData.taxRate),
        service_fee: parseFloat(formData.serviceFee),
        delivery_fee: parseFloat(formData.deliveryFee),
        hours_json: {
          mondayOpen: formData.mondayOpen, mondayClose: formData.mondayClose,
          tuesdayOpen: formData.tuesdayOpen, tuesdayClose: formData.tuesdayClose,
          wednesdayOpen: formData.wednesdayOpen, wednesdayClose: formData.wednesdayClose,
          thursdayOpen: formData.thursdayOpen, thursdayClose: formData.thursdayClose,
          fridayOpen: formData.fridayOpen, fridayClose: formData.fridayClose,
          saturdayOpen: formData.saturdayOpen, saturdayClose: formData.saturdayClose,
          sundayOpen: formData.sundayOpen, sundayClose: formData.sundayClose
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        await refreshSettings()
        alert('Settings saved and applied globally!')
      } else {
        alert('Failed to save settings.')
      }
    } catch (e) {
      console.error(e)
      alert('Error saving settings.')
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-serif gold-text-gradient">System Settings</h1>
        <p className="text-gray-400 mt-1">Configure global restaurant parameters.</p>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/5 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'general' ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5' : 'text-gray-400 hover:text-white'}`}
          >
            <Store size={18} /> General Details
          </button>
          <button 
            onClick={() => setActiveTab('hours')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'hours' ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5' : 'text-gray-400 hover:text-white'}`}
          >
            <Clock size={18} /> Operating Hours
          </button>
          <button 
            onClick={() => setActiveTab('tax')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'tax' ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5' : 'text-gray-400 hover:text-white'}`}
          >
            <Calculator size={18} /> Tax & Fees
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold border-b border-white/5 pb-2">Restaurant Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Restaurant Name</label>
                  <input name="restaurantName" value={formData.restaurantName} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Contact Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Contact Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Physical Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold border-b border-white/5 pb-2">Business Hours</h3>
              <div className="space-y-4 max-w-2xl">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="w-24 font-medium">{day}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input 
                        type="time" 
                        name={`${day.toLowerCase()}Open`} 
                        value={formData[`${day.toLowerCase()}Open` as keyof typeof formData]} 
                        onChange={handleChange}
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:border-brand-gold/50" 
                      />
                      <span className="text-gray-500">to</span>
                      <input 
                        type="time" 
                        name={`${day.toLowerCase()}Close`} 
                        value={formData[`${day.toLowerCase()}Close` as keyof typeof formData]} 
                        onChange={handleChange}
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:border-brand-gold/50" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold border-b border-white/5 pb-2">Financial Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Base Tax Rate (%)</label>
                  <input name="taxRate" type="number" step="0.1" value={formData.taxRate} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50" />
                  <p className="text-xs text-gray-500 mt-1">Applied to all dine-in and pickup orders.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Service Fee (%)</label>
                  <input name="serviceFee" type="number" step="0.1" value={formData.serviceFee} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50" />
                  <p className="text-xs text-gray-500 mt-1">Gratuity/service charge for large parties.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Flat Delivery Fee ($)</label>
                  <input name="deliveryFee" type="number" step="0.01" value={formData.deliveryFee} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50" />
                  <p className="text-xs text-gray-500 mt-1">Added to all delivery orders.</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
