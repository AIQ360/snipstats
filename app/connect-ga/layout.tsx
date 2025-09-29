import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"

export default async function ConnectGALayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      redirect("/login")
    }

    // Get user profile
    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    const userName = profile?.full_name || user.email?.split("@")[0] || "User"

    return (
      <div className="flex min-h-screen flex-col">
        <DashboardNavbar user={user} profile={profile} userName={userName} />
        <div className="flex flex-1">
          <main className="flex-1">
            <div className="container py-6 px-4 items-center justify-center flex md:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in ConnectGALayout:", error)
    redirect("/login")
  }
}
