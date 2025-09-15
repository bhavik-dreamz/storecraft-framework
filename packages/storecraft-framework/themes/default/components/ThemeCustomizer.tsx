'use client';

import React, { useState } from 'react';
import { useTheme } from 'storecraft-framework';

export const ThemeCustomizer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { themeConfig } = useTheme();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Theme Customizer</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">×</button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <input type="color" defaultValue={themeConfig?.settings?.colors?.primary || '#3B82F6'} className="w-full h-10 rounded-lg border" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <input type="color" defaultValue={themeConfig?.settings?.colors?.secondary || '#6B7280'} className="w-full h-10 rounded-lg border" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <input type="color" defaultValue={themeConfig?.settings?.colors?.accent || '#F59E0B'} className="w-full h-10 rounded-lg border" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">Apply Changes</button>
        </div>
      </div>
    </div>
  );
};


