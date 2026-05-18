import type { Metadata } from 'next'
import { Archivo, Archivo_Black } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const archivoBold = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HiyoshiFood',
  description: 'Student food reviews for Hiyoshi, Japan',
  robots: { index: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${archivoBold.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
