import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { wishlistAPI } from '../api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [wishlist, setWishlist] = useState({ id: null, items: [] })

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) { setWishlist({ id: null, items: [] }); return }
    try {
      const res = await wishlistAPI.get()
      setWishlist(res.data.data)
    } catch (err) { console.error('Wishlist fetch error', err) }
  }, [isAuthenticated])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  const addToWishlist = useCallback(async (productId) => {
    const res = await wishlistAPI.add(productId)
    setWishlist(res.data.data)
  }, [])

  const removeFromWishlist = useCallback(async (productId) => {
    const res = await wishlistAPI.remove(productId)
    setWishlist(res.data.data)
  }, [])

  const isInWishlist = useCallback((productId) => {
    return wishlist.items?.some(item => item.productId === productId)
  }, [wishlist.items])

  const wishlistCount = wishlist.items?.length || 0

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistCount, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
