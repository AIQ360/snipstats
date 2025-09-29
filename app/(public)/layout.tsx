import type React from "react"
import { Navbar } from "@/components/navbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
    </>
  )
}
