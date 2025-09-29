"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SignOutButton({ variant = "ghost", size = "sm", className }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      console.log("Signing out...")

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
        throw error
      }

      // Force a full page refresh to clear all state
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
      // Force a refresh even if there's an error
      window.location.href = "/"
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </>
      )}
    </Button>
  )
}
