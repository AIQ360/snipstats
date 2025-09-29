"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/snapstats-logo.png" alt="SnipStats Logo" width={32} height={32} className="h-8 w-8" />
            <span className="font-bold sm:inline-block">SnipStats</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ModeToggle />

            {user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
