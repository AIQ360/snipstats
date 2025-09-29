import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user has a GA account
    const { data: gaAccount, error: gaError } = await supabase
      .from("ga_accounts")
      .select("website_url")
      .eq("user_id", user.id)
      .single()

    // Return whether user has GA account and website URL if available
    return NextResponse.json({
      hasGaAccount: !gaError && !!gaAccount,
      websiteUrl: gaAccount?.website_url || "",
    })
  } catch (error) {
    console.error("Error checking GA account:", error)
    return NextResponse.json({ error: "Failed to check GA account" }, { status: 500 })
  }
}
