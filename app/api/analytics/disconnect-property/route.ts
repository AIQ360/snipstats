import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("API: User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Delete all analytics data for this user
    await Promise.all([
      supabase.from("daily_analytics").delete().eq("user_id", user.id),
      supabase.from("referrers").delete().eq("user_id", user.id),
      supabase.from("top_pages").delete().eq("user_id", user.id),
      supabase.from("events").delete().eq("user_id", user.id),
    ])

    // Delete the GA account
    const { error: deleteError } = await supabase.from("ga_accounts").delete().eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting GA account:", deleteError)
      return NextResponse.json({ error: "Failed to delete GA account" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error disconnecting property:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: "Failed to disconnect property",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
