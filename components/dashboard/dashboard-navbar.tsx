"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@supabase/supabase-js"
import { LogOut, UserIcon, LayoutDashboard } from "lucide-react"

interface DashboardNavbarProps {
  user: User
  profile: any
  userName: string
}

export function DashboardNavbar({ user, profile, userName }: DashboardNavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleSignOut = async () => {
    try {
      console.log("NAVBAR: Sign out clicked")

      // Use direct Supabase signOut
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("NAVBAR: Sign out error:", error)
        throw error
      }

      console.log("NAVBAR: Sign out successful")

      // Force a hard redirect to the home page
      window.location.href = "/"
    } catch (error) {
      console.error("NAVBAR: Sign out failed:", error)
      alert("Sign out failed. Please try again or refresh the page.")

      // Force a hard redirect even if there's an error
      window.location.href = "/"
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/snapstats-logo.png" alt="SnipStats Logo" width={32} height={32} className="h-8 w-8" />
            <h1 className="text-lg font-semibold md:text-xl">SnipStats</h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={userName} />
                ) : null}
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
