import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SnipStats",
  description: "Analytics visualization and sharing made simple",
  icons: {
    icon: [
      {
        url: "/images/snap-stats-favicon.jpeg",
        href: "/images/snap-stats-favicon.jpeg",
      },
    ],
    apple: {
      url: "/images/snap-stats-favicon.jpeg",
      href: "/images/snap-stats-favicon.jpeg",
    },
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              {/* Main content with minimum height to prevent layout shifts */}
              <div className="flex-1 justify-center min-h-[calc(100vh-4rem)]">{children}</div>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
