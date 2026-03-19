import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const sans = Plus_Jakarta_Sans({
    variable: '--font-sans',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
    title: 'PSI Dashboard',
    description: 'Open order demand at a glance',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${sans.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    )
}
