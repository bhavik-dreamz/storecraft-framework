'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, UseAuthReturn, StoreConfig } from '../types';
import { getShopifyAPI } from '../lib/shopify/api';

const AuthContext = createContext<UseAuthReturn | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode; config?: StoreConfig }> = ({ children, config }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shopifyAPI = config ? getShopifyAPI(config) : null;

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('storecraft-access-token');
        if (token && shopifyAPI) {
          const customerData = await shopifyAPI.getCustomer(token);
          setCustomer(customerData);
        }
      } catch (error) {
        localStorage.removeItem('storecraft-access-token');
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!shopifyAPI) throw new Error('Shopify API not initialized');
      const { accessToken, customer: customerData } = await shopifyAPI.customerLogin(email, password);
      
      localStorage.setItem('storecraft-access-token', accessToken);
      setCustomer(customerData);
    } catch (error) {
      setError('Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('storecraft-access-token');
    setCustomer(null);
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!shopifyAPI) throw new Error('Shopify API not initialized');
      const { customer: customerData } = await shopifyAPI.customerCreate({
        email,
        password,
        firstName,
        lastName
      });
      
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      setError('Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      customer,
      login,
      logout,
      register,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};