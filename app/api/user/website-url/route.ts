import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Get the user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get the user's GA account to get website URL
    const { data: gaAccount } = await supabase.from("ga_accounts").select("website_url").eq("user_id", user.id).single()

    return NextResponse.json({
      websiteUrl: gaAccount?.website_url || "",
    })
  } catch (error) {
    console.error("Error fetching website URL:", error)
    return NextResponse.json({ error: "Failed to fetch website URL" }, { status: 500 })
  }
}
