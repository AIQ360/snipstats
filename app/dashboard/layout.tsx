import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AppSidebarWrapper } from "@/components/sidebar/app-sidebar-wrapper"
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError)
      redirect("/login")
    }

    // Get or create user profile
    let { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code === "PGRST116") {
      // Create user profile if it doesn't exist
      const { error: insertError } = await supabase.from("user_profiles").insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        created_at: new Date().toISOString(),
      })

      if (!insertError) {
        const { data: newProfile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()
        userProfile = newProfile
      }
    }

    const userName = userProfile?.full_name || user.email?.split("@")[0] || "User"

    return (
      <div className="flex min-h-screen flex-col">
        <DashboardNavbar user={user} profile={userProfile} userName={userName} />
        <div className="flex flex-1">
          <main className="flex-1">
            <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">{children}</div>
          </main>
        </div>
        <AppSidebarWrapper
          credits={0}
          userEmail={user.email || ""}
          userName={userName}
          avatarUrl={userProfile?.avatar_url}
        />
      </div>
    )
  } catch (error) {
    console.error("Dashboard layout error:", error)
    redirect("/login")
  }
}
