'use client'

import { Bell, ChefHat, UserPlus, Info, CheckCircle2, Clock, Trash2 } from 'lucide-react'

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'kitchen', title: 'Order Ready: Table 4', message: 'Kitchen has finished preparing the items for Table 4.', time: '2 mins ago', read: false },
    { id: 2, type: 'reservation', title: 'New Walk-in: Party of 2', message: 'Hostess has seated a new walk-in at Table 7.', time: '15 mins ago', read: false },
    { id: 3, type: 'system', title: 'Shift Change Reminder', message: 'Evening shift brief will begin in 45 minutes at the back office.', time: '1 hour ago', read: true },
    { id: 4, type: 'kitchen', title: '86 Alert: Truffle Oil', message: 'The kitchen is out of Truffle Oil. Signature Fries are unavailable.', time: '2 hours ago', read: true },
    { id: 5, type: 'reservation', title: 'VIP Guest Arrival', message: 'Mr. Smith (VIP) has arrived and been seated at Table 12.', time: '3 hours ago', read: true },
  ]

  const getIcon = (type: string) => {
    switch(type) {
      case 'kitchen': return <ChefHat className="text-orange-400" size={20} />
      case 'reservation': return <UserPlus className="text-blue-400" size={20} />
      case 'system': return <Info className="text-gray-400" size={20} />
      default: return <Bell className="text-brand-gold" size={20} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient flex items-center gap-3">
            <Bell /> Notifications
          </h1>
          <p className="text-gray-400 mt-1">Stay updated on restaurant operations.</p>
        </div>
        <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
          <CheckCircle2 size={16} /> Mark all as read
        </button>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {notifications.map(notif => (
            <div key={notif.id} className={`p-6 flex gap-4 transition-colors hover:bg-white/[0.02] ${!notif.read ? 'bg-brand-gold/[0.03]' : ''}`}>
              <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                !notif.read ? 'bg-brand-gold/10 border-brand-gold/30' : 'bg-white/5 border-white/10'
              }`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-lg ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> {notif.time}
                  </span>
                </div>
                <p className={`text-sm ${!notif.read ? 'text-gray-300' : 'text-gray-500'}`}>
                  {notif.message}
                </p>
                
                {!notif.read && (
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1.5 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-black rounded-lg text-xs font-bold transition-colors">
                      Take Action
                    </button>
                    <button className="px-3 py-1.5 bg-white/5 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-colors">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
              <div className="pl-4 border-l border-white/5 flex items-center">
                <button className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
