import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'XPLORIX | Drilling Intelligence Platform',
  description: 'XPLORIX - Premium AI-powered drilling operations management system for Exploration and Blast Hole industries',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0F1C] text-white min-h-screen`}>
        <div className="bg-grid-pattern fixed inset-0 pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
