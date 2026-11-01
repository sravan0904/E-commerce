import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('guest_cart')
      return saved ? JSON.parse(saved) : { items: [], subtotal: 0, discount: 0, shippingFee: 0, total: 0, totalItems: 0 }
    } catch {
      return { items: [], subtotal: 0, discount: 0, shippingFee: 0, total: 0, totalItems: 0 }
    }
  })
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      try {
        const saved = localStorage.getItem('guest_cart')
        if (saved) setCart(JSON.parse(saved))
      } catch {}
      return
    }
    setLoading(true)
    try {
      const res = await cartAPI.get()
      setCart(res.data.data)
    } catch (err) { console.error('Cart fetch error', err) }
    finally { setLoading(false) }
  }, [isAuthenticated])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = useCallback(async (productId, quantity = 1, productDetails = null) => {
    if (isAuthenticated) {
      const res = await cartAPI.addItem({ productId, quantity })
      setCart(res.data.data)
      return res.data.data
    } else {
      // Local guest cart
      setCart(prev => {
        const items = [...(prev.items || [])]
        const existingIdx = items.findIndex(i => (i.productId || i.id) === productId)
        if (existingIdx >= 0) {
          items[existingIdx].quantity += quantity
        } else {
          items.push({
            id: Date.now(),
            productId,
            quantity,
            name: productDetails?.name || 'Product',
            productName: productDetails?.name || 'Product',
            price: productDetails?.discountPrice || productDetails?.price || 1999,
            effectivePrice: productDetails?.discountPrice || productDetails?.price || 1999,
            originalPrice: productDetails?.price,
            imageUrl: productDetails?.imageUrl || productDetails?.images?.[0]?.imageUrl || 'https://placehold.co/100x100?text=Product',
          })
        }
        const updated = { ...prev, items }
        try { localStorage.setItem('guest_cart', JSON.stringify(updated)) } catch {}
        return updated
      })
      return true
    }
  }, [isAuthenticated])

  const updateItem = useCallback(async (itemId, quantity) => {
    if (isAuthenticated) {
      const res = await cartAPI.updateItem(itemId, { quantity })
      setCart(res.data.data)
    } else {
      setCart(prev => {
        const items = prev.items.map(i => i.id === itemId ? { ...i, quantity } : i)
        const updated = { ...prev, items }
        try { localStorage.setItem('guest_cart', JSON.stringify(updated)) } catch {}
        return updated
      })
    }
  }, [isAuthenticated])

  const removeItem = useCallback(async (itemId) => {
    if (isAuthenticated) {
      const res = await cartAPI.removeItem(itemId)
      setCart(res.data.data)
    } else {
      setCart(prev => {
        const items = prev.items.filter(i => i.id !== itemId)
        const updated = { ...prev, items }
        try { localStorage.setItem('guest_cart', JSON.stringify(updated)) } catch {}
        return updated
      })
    }
  }, [isAuthenticated])

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      await cartAPI.clear()
    }
    const empty = { items: [], subtotal: 0, discount: 0, shippingFee: 0, total: 0, totalItems: 0 }
    setCart(empty)
    try { localStorage.removeItem('guest_cart') } catch {}
  }, [isAuthenticated])

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      loading,
      fetchCart,
      addToCart,
      updateItem,
      removeItem,
      updateQuantity: updateItem,
      removeFromCart: removeItem,
      clearCart,
      clearCartLocal: clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
