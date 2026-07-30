'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type SettingsType = {
  restaurant_name: string
  email: string
  phone: string
  address: string
  tax_rate: number
  service_fee: number
  delivery_fee: number
  hours_json: any
}

type SettingsContextType = {
  settings: SettingsType | null
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsType | null>(null)

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/settings`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.data)
      }
    } catch (e) {
      console.error('Failed to fetch settings', e)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
