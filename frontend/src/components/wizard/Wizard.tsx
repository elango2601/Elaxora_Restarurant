'use client'

import { useReservationStore } from '@/store/reservationStore'
import { motion, AnimatePresence } from 'framer-motion'
import Step1Branch from './Step1Branch'
import Step2Date from './Step2Date'
import Step3Time from './Step3Time'
import Step4Guests from './Step4Guests'
import Step5Table from './Step5Table'
import Step6Customer from './Step6Customer'
import Step7Requests from './Step7Requests'
import Step8Summary from './Step8Summary'
import Step9Success from './Step9Success'

const steps = [
  { id: 1, title: 'Branch' },
  { id: 2, title: 'Date' },
  { id: 3, title: 'Time' },
  { id: 4, title: 'Guests' },
  { id: 5, title: 'Table' },
  { id: 6, title: 'Details' },
  { id: 7, title: 'Requests' },
  { id: 8, title: 'Summary' },
  { id: 9, title: 'Complete' }
]

export default function Wizard() {
  const currentStep = useReservationStore((state) => state.currentStep)

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 p-6 glass-panel">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {steps.map((s) => (
            <div key={s.id} className={`text-xs font-semibold tracking-wider uppercase ${currentStep >= s.id ? 'text-brand-gold' : 'text-gray-500'}`}>
              {s.id === currentStep ? <span className="gold-text-gradient">{s.title}</span> : <span className="hidden sm:inline">{s.title}</span>}
            </div>
          ))}
        </div>
        <div className="h-1 bg-brand-glass rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-gold"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {currentStep === 1 && <Step1Branch />}
            {currentStep === 2 && <Step2Date />}
            {currentStep === 3 && <Step3Time />}
            {currentStep === 4 && <Step4Guests />}
            {currentStep === 5 && <Step5Table />}
            {currentStep === 6 && <Step6Customer />}
            {currentStep === 7 && <Step7Requests />}
            {currentStep === 8 && <Step8Summary />}
            {currentStep === 9 && <Step9Success />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
