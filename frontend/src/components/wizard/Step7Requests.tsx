'use client'

import { useReservationStore } from '@/store/reservationStore'

const requestsList = [
  { id: 'birthday', label: 'Birthday Celebration' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'highChair', label: 'High Chair Needed' },
  { id: 'wheelchair', label: 'Wheelchair Accessible' },
  { id: 'romantic', label: 'Romantic Decoration' },
  { id: 'business', label: 'Business Meeting' }
]

export default function Step7Requests() {
  const { data, updateData, setStep } = useReservationStore()
  const reqs = data.specialRequests

  const handleToggle = (id: keyof typeof reqs) => {
    updateData({ 
      specialRequests: { 
        ...reqs, 
        [id]: !reqs[id] 
      } 
    })
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateData({
      specialRequests: {
        ...reqs,
        notes: e.target.value
      }
    })
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-serif tracking-wide gold-text-gradient">Special Requests</h2>
      
      <div className="max-w-xl mx-auto mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {requestsList.map(req => {
            const isChecked = reqs[req.id as keyof typeof reqs] as boolean
            return (
              <label 
                key={req.id} 
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors border ${
                  isChecked ? 'bg-brand-glass border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'glass-panel border-transparent hover:border-gray-500'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border ${isChecked ? 'bg-brand-gold border-brand-gold' : 'border-gray-400 bg-transparent'}`}>
                  {isChecked && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isChecked}
                  onChange={() => handleToggle(req.id as keyof typeof reqs)}
                />
                <span className="text-white/90">{req.label}</span>
              </label>
            )
          })}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
            <span>Additional Notes (Optional)</span>
            <span className="text-gray-500">{reqs.notes.length}/500</span>
          </label>
          <textarea 
            value={reqs.notes}
            onChange={handleNotesChange}
            maxLength={500}
            rows={4}
            className="w-full bg-transparent border border-gray-600 focus:border-brand-gold rounded-lg px-4 py-3 text-white outline-none transition-colors resize-none"
            placeholder="Any allergies, dietary restrictions, or specific requirements..."
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={() => setStep(6)} 
          className="bg-transparent border border-gray-600 hover:border-white text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          Back
        </button>
        <button 
          onClick={() => setStep(8)} 
          className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
