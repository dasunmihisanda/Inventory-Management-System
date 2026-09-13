import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { InventoryProvider } from '@/context/InventoryContext';
import AppLayout from '@/components/layout/AppLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ABC (PVT) LTD — Enterprise Inventory Management & Valuation System',
  description:
    'Advanced multi-page inventory management system with real-time FIFO tracking, AVCO costing, damaged stock quarantine, and analytical intelligence for ABC (PVT) LTD.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('abc_inventory_theme') || 'light';
                document.documentElement.classList.add(theme);
              } catch (e) {
                document.documentElement.classList.add('light');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f17] dark:text-slate-100 antialiased font-normal selection:bg-blue-600 selection:text-white transition-colors duration-200">
        <AuthProvider>
          <InventoryProvider>
            <AppLayout>{children}</AppLayout>
          </InventoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
