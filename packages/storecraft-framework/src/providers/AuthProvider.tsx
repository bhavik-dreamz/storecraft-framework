import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { Customer, CustomerAccessToken } from '../types/shopify'

interface AuthState {
  customer: Customer | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CUSTOMER'; payload: { customer: Customer; accessToken: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateCustomer: (input: Partial<Customer>) => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_CUSTOMER':
      return {
        ...state,
        customer: action.payload.customer,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'LOGOUT':
      return {
        ...state,
        customer: null,
        accessToken: null,
        isAuthenticated: false,
        error: null,
      }
    default:
      return state
  }
}

interface AuthProviderProps {
  children: React.ReactNode
  initialCustomer?: Customer | null
  initialAccessToken?: string | null
}

export function AuthProvider({ 
  children, 
  initialCustomer = null, 
  initialAccessToken = null 
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    customer: initialCustomer,
    accessToken: initialAccessToken,
    isLoading: false,
    error: null,
    isAuthenticated: !!(initialCustomer && initialAccessToken),
  })

  // Load auth data from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      if (typeof window === 'undefined') return

      try {
        const storedToken = localStorage.getItem('storecraft_access_token')
        const storedCustomer = localStorage.getItem('storecraft_customer')
        const tokenExpiry = localStorage.getItem('storecraft_token_expiry')

        if (storedToken && storedCustomer && tokenExpiry) {
          // Check if token is expired
          const expiryDate = new Date(tokenExpiry)
          if (expiryDate > new Date()) {
            const customer = JSON.parse(storedCustomer)
            dispatch({ 
              type: 'SET_CUSTOMER', 
              payload: { customer, accessToken: storedToken } 
            })
          } else {
            // Token expired, clear stored data
            localStorage.removeItem('storecraft_access_token')
            localStorage.removeItem('storecraft_customer')
            localStorage.removeItem('storecraft_token_expiry')
          }
        }
      } catch (error) {
        console.error('Failed to load stored auth data:', error)
      }
    }

    loadStoredAuth()
  }, [])

  // Save auth data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (state.customer && state.accessToken) {
        localStorage.setItem('storecraft_access_token', state.accessToken)
        localStorage.setItem('storecraft_customer', JSON.stringify(state.customer))
        // Set expiry to 30 days from now (typical Shopify token expiry)
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 30)
        localStorage.setItem('storecraft_token_expiry', expiry.toISOString())
      } else {
        localStorage.removeItem('storecraft_access_token')
        localStorage.removeItem('storecraft_customer')
        localStorage.removeItem('storecraft_token_expiry')
      }
    }
  }, [state.customer, state.accessToken])

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      // TODO: Implement Shopify customer login API call
      console.log('Logging in customer:', email)
      
      // Placeholder implementation
      const mockCustomer: Customer = {
        id: 'customer-1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'John Doe',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        acceptsMarketing: false,
        addresses: [],
        numberOfOrders: '0',
      }

      const mockAccessToken = 'mock-access-token-' + Date.now()

      dispatch({
        type: 'SET_CUSTOMER',
        payload: { customer: mockCustomer, accessToken: mockAccessToken },
      })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      })
    }
  }, [])

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      // TODO: Implement Shopify customer logout API call
      console.log('Logging out customer')
      
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Logout failed' 
      })
    }
  }, [])

  const register = useCallback(
    async (email: string, password: string, firstName?: string, lastName?: string) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      try {
        // TODO: Implement Shopify customer registration API call
        console.log('Registering customer:', { email, firstName, lastName })
        
        // For now, auto-login after registration
        await login(email, password)
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Registration failed' 
        })
      }
    },
    [login]
  )

  const resetPassword = useCallback(async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      // TODO: Implement Shopify password reset API call
      console.log('Resetting password for:', email)
      
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Password reset failed' 
      })
    }
  }, [])

  const updateCustomer = useCallback(
    async (input: Partial<Customer>) => {
      if (!state.customer) {
        dispatch({ type: 'SET_ERROR', payload: 'No customer to update' })
        return
      }

      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      try {
        // TODO: Implement Shopify customer update API call
        console.log('Updating customer:', input)
        
        const updatedCustomer = { ...state.customer, ...input }
        dispatch({ 
          type: 'SET_CUSTOMER', 
          payload: { customer: updatedCustomer, accessToken: state.accessToken! } 
        })
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Customer update failed' 
        })
      }
    },
    [state.customer, state.accessToken]
  )

  const refreshCustomer = useCallback(async () => {
    if (!state.accessToken) return

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      // TODO: Implement Shopify customer refresh API call
      console.log('Refreshing customer data')
      
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to refresh customer' 
      })
    }
  }, [state.accessToken])

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    register,
    resetPassword,
    updateCustomer,
    refreshCustomer,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}