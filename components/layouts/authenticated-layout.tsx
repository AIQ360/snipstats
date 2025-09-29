"use client"

import type React from "react"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto py-6 px-4 md:px-6 lg:px-8">{children}</main>
    </div>
  )
}
