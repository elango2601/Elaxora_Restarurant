'use client'

import { HelpCircle, MessageSquare, Phone, Mail, FileText, ChevronRight, AlertCircle } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif gold-text-gradient">Customer Support & IT Help</h1>
        <p className="text-gray-400 mt-1">Get assistance with the POS system, report issues, or contact management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Cards */}
        <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-brand-gold/20 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-brand-gold text-black flex items-center justify-center mb-4">
            <Phone size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">IT Helpdesk</h3>
          <p className="text-gray-400 text-sm mb-4">Urgent technical issues with POS or printers</p>
          <p className="text-brand-gold font-bold text-lg">Ext. 5001</p>
        </div>

        <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-4">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Manager on Duty</h3>
          <p className="text-gray-400 text-sm mb-4">Customer escalations & shift issues</p>
          <p className="text-white font-bold text-lg">Chat Now</p>
        </div>

        <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-4">
            <Mail size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">HR Department</h3>
          <p className="text-gray-400 text-sm mb-4">Payroll, scheduling, and general inquiries</p>
          <p className="text-white font-bold text-lg">hr@elaxora.com</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* FAQs */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <HelpCircle className="text-brand-gold" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              "How do I void an item on a submitted order?",
              "What is the procedure for a walked tab?",
              "How do I split a bill 3 ways?",
              "My receipt printer is out of paper / jamming."
            ].map((q, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                <span className="font-medium text-sm">{q}</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Report Issue */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-red-400">
            <AlertCircle /> Report a System Issue
          </h2>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Issue reported to IT!') }}>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Issue Category</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-gold/50 appearance-none">
                <option>Hardware (Printers, Tablets)</option>
                <option>Software (POS crashing, slow)</option>
                <option>Network (No internet connection)</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea 
                rows={4}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50"
                placeholder="Please describe the problem..."
              ></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
