import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  totalPrice: () => number
  totalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const currentItems = get().items
        const existing = currentItems.find(i => i.id === item.id)
        
        if (existing) {
          set({
            items: currentItems.map(i => 
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true
          })
        } else {
          set({ items: [...currentItems, { ...item, quantity: 1 }], isOpen: true })
        }
      },
      
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map(i => (i.id === id ? { ...i, quantity } : i))
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set({ isOpen: !get().isOpen }),
      
      totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0)
    }),
    {
      name: 'elaxora-cart-storage',
      partialize: (state) => ({ items: state.items }) // only persist items, not isOpen
    }
  )
)
