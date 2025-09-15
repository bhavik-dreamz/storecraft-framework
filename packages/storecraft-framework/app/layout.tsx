'use client';

import { StorecraftProvider } from '../src/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StorecraftProvider>
          {children}
        </StorecraftProvider>
      </body>
    </html>
  );
}
