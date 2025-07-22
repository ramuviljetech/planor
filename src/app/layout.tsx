import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme'
import { AzureAuthProvider } from './auth/AzureAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Planör Portal - Property Asset Management',
  description: 'Secure, full-stack property asset management portal for managing properties, buildings, maintenance plans, and document workflows.',
  keywords: 'property management, asset management, maintenance plans, building management',
  authors: [{ name: 'Planör Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AzureAuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AzureAuthProvider>
      </body>
    </html>
  )
}
