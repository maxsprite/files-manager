import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Import global CSS including UI components styles
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Files Manager',
  description: 'Files management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}