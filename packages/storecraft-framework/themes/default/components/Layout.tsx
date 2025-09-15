'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTheme } from 'storecraft-framework';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  const { themeConfig } = useTheme();

  return (
    <div 
      className={`default-theme min-h-screen flex flex-col ${className}`}
      style={{
        '--color-primary': themeConfig?.settings?.colors?.primary,
        '--color-secondary': themeConfig?.settings?.colors?.secondary,
        '--color-accent': themeConfig?.settings?.colors?.accent,
        fontFamily: themeConfig?.settings?.typography?.fontFamily
      } as React.CSSProperties}
    >
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}


