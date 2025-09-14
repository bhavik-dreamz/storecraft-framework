import React, { useState } from 'react'
import { Metadata } from 'next'
import { useAuth } from '../providers'
import { cn } from '../utils/cn'

export const metadata: Metadata = {
  title: 'Sign In | Your Store',
  description: 'Sign in to your account to access your orders, wishlists, and account settings',
  robots: 'noindex, nofollow' // Prevent search engines from indexing auth pages
}

interface LoginPageProps {
  redirectTo?: string
  mode?: 'login' | 'register'
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  redirectTo = '/', 
  mode = 'login' 
}) => {
  const { login, register, isLoading, error } = useAuth()
  const [formMode, setFormMode] = useState<'login' | 'register'>(mode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (formMode === 'register') {
      if (!formData.firstName) {
        errors.firstName = 'First name is required'
      }
      if (!formData.lastName) {
        errors.lastName = 'Last name is required'
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      if (formMode === 'login') {
        await login(formData.email, formData.password)
      } else {
        await register(formData.email, formData.password, formData.firstName, formData.lastName)
      }
      
      // Redirect after successful auth
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo
      }
    } catch (error) {
      // Error handled by auth provider
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {formMode === 'login' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {formMode === 'login' 
              ? 'Welcome back! Please sign in to your account.' 
              : 'Join us and start shopping your favorite products.'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Auth Mode Toggle */}
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setFormMode('login')}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border",
                formMode === 'login'
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setFormMode('register')}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border-t border-r border-b",
                formMode === 'register'
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              )}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Auth Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Register Fields */}
            {formMode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={cn(
                      "mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      formErrors.firstName ? "border-red-300" : "border-gray-300"
                    )}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={cn(
                      "mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      formErrors.lastName ? "border-red-300" : "border-gray-300"
                    )}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={cn(
                  "mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  formErrors.email ? "border-red-300" : "border-gray-300"
                )}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={formMode === 'login' ? 'current-password' : 'new-password'}
                value={formData.password}
                onChange={handleInputChange}
                className={cn(
                  "mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  formErrors.password ? "border-red-300" : "border-gray-300"
                )}
              />
              {formErrors.password && (
                <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password for Register */}
            {formMode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    formErrors.confirmPassword ? "border-red-300" : "border-gray-300"
                  )}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
                  "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? 'Processing...' : (formMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between">
              {formMode === 'login' && (
                <div className="text-sm">
                  <a href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </a>
                </div>
              )}
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setFormMode(formMode === 'login' ? 'register' : 'login')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {formMode === 'login' ? 'Need an account?' : 'Already have an account?'}
                </button>
              </div>
            </div>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Sign in with Google</span>
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Sign in with Apple</span>
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}