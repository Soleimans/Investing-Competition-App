import type { ReactNode } from 'react';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Invest League',
  description: 'Private investment competitions for friends',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
