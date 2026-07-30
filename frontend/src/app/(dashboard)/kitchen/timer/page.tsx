"use client"
import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Trash2, PlusCircle, Plus } from 'lucide-react'

interface Timer {
  id: string
  name: string
  duration: number // total seconds
  timeLeft: number // seconds remaining
  isRunning: boolean
  isFinished: boolean
}

export default function TimerPage() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [newTimerName, setNewTimerName] = useState('')
  const [newTimerMin, setNewTimerMin] = useState('5')

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(t => {
        if (!t.isRunning || t.isFinished) return t
        const newTime = t.timeLeft - 1
        
        if (newTime <= 0) {
          // Play a simple beep (using browser AudioContext if possible, or just visually alert)
          return { ...t, timeLeft: 0, isRunning: false, isFinished: true }
        }
        return { ...t, timeLeft: newTime }
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const addTimer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTimerName.trim()) return
    const mins = parseInt(newTimerMin) || 5
    const newTimer: Timer = {
      id: Math.random().toString(36).substring(7),
      name: newTimerName,
      duration: mins * 60,
      timeLeft: mins * 60,
      isRunning: false,
      isFinished: false
    }
    setTimers([...timers, newTimer])
    setNewTimerName('')
    setNewTimerMin('5')
  }

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, isRunning: !t.isRunning } : t))
  }

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, timeLeft: t.duration, isRunning: false, isFinished: false } : t))
  }

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id))
  }
  
  const addOneMin = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, timeLeft: t.timeLeft + 60, duration: t.duration + 60, isFinished: false } : t))
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold gold-text-gradient">Cooking Timers</h1>
          <p className="text-gray-400 mt-1">Manage multiple countdowns for active dishes</p>
        </div>
      </div>

      {/* Add New Timer Form */}
      <div className="bg-[#0a0a0c] border border-brand-gold/20 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Task / Dish Name</label>
          <input 
            type="text" 
            value={newTimerName}
            onChange={(e) => setNewTimerName(e.target.value)}
            placeholder="e.g. Steak Medium Rare"
            className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
          />
        </div>
        <div className="w-full md:w-32">
          <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Minutes</label>
          <input 
            type="number" 
            value={newTimerMin}
            onChange={(e) => setNewTimerMin(e.target.value)}
            min="1"
            className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
          />
        </div>
        <button 
          onClick={addTimer}
          disabled={!newTimerName.trim()}
          className="w-full md:w-auto mt-5 flex items-center justify-center gap-2 bg-brand-gold text-black font-bold py-3 px-6 rounded-xl hover:bg-brand-gold/90 transition-all disabled:opacity-50"
        >
          <PlusCircle size={20} />
          <span>Add Timer</span>
        </button>
      </div>

      {/* Timers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar pb-10">
        {timers.length === 0 ? (
          <div className="col-span-full h-40 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
            <TimerIcon className="opacity-50 mb-3" size={32} />
            <p>No active timers. Create one above.</p>
          </div>
        ) : (
          timers.map(timer => {
            const progress = ((timer.duration - timer.timeLeft) / timer.duration) * 100
            
            return (
              <div 
                key={timer.id} 
                className={`relative overflow-hidden bg-[#0a0a0c] border rounded-2xl p-6 transition-all ${
                  timer.isFinished 
                    ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                    : timer.isRunning 
                      ? 'border-brand-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                      : 'border-white/10'
                }`}
              >
                {/* Progress Bar Background */}
                <div 
                  className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${
                    timer.isFinished ? 'bg-red-500' : 'bg-brand-gold'
                  }`}
                  style={{ width: `${progress}%` }}
                />

                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-medium text-white truncate pr-4">{timer.name}</h3>
                  <button onClick={() => deleteTimer(timer.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex justify-center my-6">
                  <div className={`text-6xl font-serif tracking-widest ${timer.isFinished ? 'text-red-500 animate-pulse' : 'text-brand-gold'}`}>
                    {formatTime(timer.timeLeft)}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                  {!timer.isFinished && (
                    <button 
                      onClick={() => toggleTimer(timer.id)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        timer.isRunning 
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                          : 'bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20'
                      }`}
                    >
                      {timer.isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => addOneMin(timer.id)}
                    className="flex flex-col items-center justify-center text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-1">
                      <Plus size={16} />
                    </div>
                    +1 Min
                  </button>
                  
                  <button 
                    onClick={() => resetTimer(timer.id)}
                    className="flex flex-col items-center justify-center text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-1">
                      <RotateCcw size={16} />
                    </div>
                    Reset
                  </button>
                </div>

                {timer.isFinished && (
                  <div className="absolute inset-x-0 top-0 text-center bg-red-500 text-white text-xs font-bold uppercase tracking-widest py-1 animate-pulse">
                    Timer Finished
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function TimerIcon({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  )
}
