import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (id: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(item => item.id === newItem.id);
    if (existingItem) {
      return { items: state.items.map(item => item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item) };
    }
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter(item => item.id !== id) })),
  incrementQuantity: (id) => set((state) => ({
    items: state.items.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
  })),
  decrementQuantity: (id) => set((state) => {
    const existingItem = state.items.find(item => item.id === id);
    if (existingItem && existingItem.quantity === 1) {
      return { items: state.items.filter(item => item.id !== id) };
    }
    return { items: state.items.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item) };
  }),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
  getItemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
  getItemQuantity: (id) => {
    const item = get().items.find(i => i.id === id);
    return item ? item.quantity : 0;
  }
}));
