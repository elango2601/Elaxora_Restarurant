'use client'

import { useReservationStore } from '@/store/reservationStore'
import { CheckCircle2, Download, Mail, Home } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function Step9Success() {
  const { data, reservationId, reset } = useReservationStore()

  const handleDownload = () => {
    window.print()
  }

  const handleEmail = () => {
    alert("Email confirmation sent to " + data.customer.email)
  }

  const handleHome = () => {
    reset()
    window.location.href = '/'
  }

  if (!reservationId) return null

  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="w-24 h-24 text-green-500 animate-pulse" />
      </div>
      
      <h2 className="text-4xl font-bold mb-4 font-serif tracking-wide text-white">Booking Confirmed!</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        Thank you, {data.customer.name.split(' ')[0]}. We have reserved your {data.tableType} at {data.branch}.
      </p>

      <div className="glass-panel p-8 rounded-2xl max-w-sm mx-auto mb-10 flex flex-col items-center print-section border-brand-gold shadow-[0_0_30px_rgba(212,175,55,0.2)]">
        <h3 className="text-lg font-bold mb-4 text-brand-gold">Reservation Pass</h3>
        <div className="bg-white p-4 rounded-xl mb-4">
          <QRCodeSVG value={reservationId} size={150} />
        </div>
        <p className="font-mono text-sm text-gray-400 tracking-wider mb-2">ID: {reservationId.split('-')[0].toUpperCase()}</p>
        <p className="text-white font-bold text-xl">{data.date}</p>
        <p className="text-brand-gold text-lg">{data.time.split(':').slice(0,2).join(':')} - {data.guests} Guests</p>
        <p className="text-xs text-gray-500 mt-4 italic">Please arrive 10 minutes early.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto hide-on-print">
        <button 
          onClick={handleDownload}
          className="flex-1 bg-brand-glass hover:bg-brand-glass-hover border border-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" /> Save PDF
        </button>
        <button 
          onClick={handleEmail}
          className="flex-1 bg-brand-glass hover:bg-brand-glass-hover border border-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" /> Email
        </button>
        <button 
          onClick={handleHome}
          className="flex-1 bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" /> Home
        </button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
          .hide-on-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
