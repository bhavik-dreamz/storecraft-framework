import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { Cart, CartLine, CartLineInput, CartLineUpdateInput } from '../types/shopify'

interface CartState {
  cart: Cart | null
  isLoading: boolean
  error: string | null
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_CART' }

interface CartContextValue extends CartState {
  addItem: (variantId: string, quantity: number, attributes?: Array<{ key: string; value: string }>) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'CLEAR_CART':
      return { ...state, cart: null, error: null }
    default:
      return state
  }
}

interface CartProviderProps {
  children: React.ReactNode
  initialCart?: Cart | null
}

export function CartProvider({ children, initialCart = null }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: initialCart,
    isLoading: false,
    error: null,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadStoredCart = async () => {
      if (typeof window === 'undefined') return

      try {
        const storedCartId = localStorage.getItem('storecraft_cart_id')
        if (storedCartId && !state.cart) {
          dispatch({ type: 'SET_LOADING', payload: true })
          // TODO: Load cart from Shopify API using storedCartId
          // For now, just clear the loading state
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Failed to load stored cart:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' })
      }
    }

    loadStoredCart()
  }, [])

  // Save cart ID to localStorage when cart changes
  useEffect(() => {
    if (typeof window !== 'undefined' && state.cart?.id) {
      localStorage.setItem('storecraft_cart_id', state.cart.id)
    }
  }, [state.cart?.id])

  const addItem = useCallback(
    async (variantId: string, quantity: number, attributes?: Array<{ key: string; value: string }>) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      try {
        // TODO: Implement Shopify API call
        const cartInput: CartLineInput = {
          merchandiseId: variantId,
          quantity,
          attributes,
        }

        // Placeholder - replace with actual Shopify API call
        console.log('Adding item to cart:', cartInput)
        
        // For now, just clear loading
        dispatch({ type: 'SET_LOADING', payload: false })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item' })
      }
    },
    [state.cart]
  )

  const removeItem = useCallback(
    async (lineId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      try {
        // TODO: Implement Shopify API call
        console.log('Removing item from cart:', lineId)
        
        dispatch({ type: 'SET_LOADING', payload: false })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item' })
      }
    },
    [state.cart]
  )

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      try {
        // TODO: Implement Shopify API call
        console.log('Updating cart item:', { lineId, quantity })
        
        dispatch({ type: 'SET_LOADING', payload: false })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update item' })
      }
    },
    [state.cart]
  )

  const clearCart = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('storecraft_cart_id')
      }
      dispatch({ type: 'CLEAR_CART' })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to clear cart' })
    }
  }, [])

  const refreshCart = useCallback(async () => {
    if (!state.cart?.id) return

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      // TODO: Implement Shopify API call to refresh cart
      console.log('Refreshing cart:', state.cart.id)
      
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh cart' })
    }
  }, [state.cart?.id])

  const value: CartContextValue = {
    ...state,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}