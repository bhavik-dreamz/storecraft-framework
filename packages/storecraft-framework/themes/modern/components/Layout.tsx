'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTheme } from 'storecraft-framework';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ModernLayout({ children }: LayoutProps) {
  const { themeConfig } = useTheme();

  return (
    <div 
      className="modern-theme min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{
        '--color-primary': themeConfig?.settings?.colors?.primary,
        '--color-secondary': themeConfig?.settings?.colors?.secondary,
        '--color-accent': themeConfig?.settings?.colors?.accent,
        fontFamily: themeConfig?.settings?.typography?.fontFamily
      } as React.CSSProperties}
    >
      <div className="backdrop-blur-3xl bg-white/5">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}


