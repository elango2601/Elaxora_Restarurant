import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ReservationData {
  branch: string
  date: string
  time: string
  guests: number
  tableType: string
  customer: {
    name: string
    phone: string
    email: string
    company?: string
  }
  specialRequests: {
    birthday: boolean
    anniversary: boolean
    highChair: boolean
    wheelchair: boolean
    romantic: boolean
    business: boolean
    notes: string
  }
}

interface ReservationState {
  currentStep: number
  data: ReservationData
  reservationId?: string
  setStep: (step: number) => void
  updateData: (partial: Partial<ReservationData>) => void
  reset: () => void
}

const defaultData: ReservationData = {
  branch: '',
  date: '',
  time: '',
  guests: 2,
  tableType: '',
  customer: {
    name: '',
    phone: '',
    email: '',
    company: ''
  },
  specialRequests: {
    birthday: false,
    anniversary: false,
    highChair: false,
    wheelchair: false,
    romantic: false,
    business: false,
    notes: ''
  }
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: defaultData,
      setStep: (step) => set({ currentStep: step }),
      updateData: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
      reset: () => set({ currentStep: 1, data: defaultData }),
    }),
    {
      name: 'premium-reservation-storage',
    }
  )
)
