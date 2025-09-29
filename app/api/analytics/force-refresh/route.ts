import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getGoogleAnalyticsData, processAndStoreAnalyticsData } from "@/lib/google/analytics"

export async function POST(request: NextRequest) {
  console.log("FORCE_REFRESH: Starting force refresh...")
  const supabase = await createClient()

  // Get the user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.log("FORCE_REFRESH: User not authenticated")
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get the request body
    const body = await request.json()
    const { startDate, endDate } = body

    if (!startDate || !endDate) {
      console.error("FORCE_REFRESH: Missing date range")
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    console.log(`FORCE_REFRESH: Forcing refresh for date range ${startDate} to ${endDate}`)

    // Get the user's GA account
    console.log(`FORCE_REFRESH: Checking GA account for user ${user.id}`)
    const { data: gaAccount, error: gaError } = await supabase
      .from("ga_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (gaError || !gaAccount) {
      console.error("FORCE_REFRESH: Error fetching GA account:", gaError)
      return NextResponse.json({ error: "GA account not found" }, { status: 404 })
    }

    console.log("FORCE_REFRESH: Found GA account:", {
      propertyId: gaAccount.ga_property_id,
      hasAccessToken: !!gaAccount.access_token,
      hasRefreshToken: !!gaAccount.refresh_token,
    })

    if (!gaAccount.access_token || !gaAccount.refresh_token) {
      console.error("FORCE_REFRESH: Missing access or refresh token")
      return NextResponse.json({ error: "Missing authentication tokens" }, { status: 400 })
    }

    // Fetch data from Google Analytics
    console.log("FORCE_REFRESH: Fetching data from Google Analytics...")
    const data = await getGoogleAnalyticsData(
      user.id,
      startDate,
      endDate,
      gaAccount.access_token,
      gaAccount.refresh_token,
      gaAccount.ga_property_id,
    )

    // Process and store the data
    console.log("FORCE_REFRESH: Processing and storing data...")
    await processAndStoreAnalyticsData(user.id, data)
    console.log("FORCE_REFRESH: Data processed and stored successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("FORCE_REFRESH: Error in force refresh:", error)
    return NextResponse.json(
      {
        error: "Failed to refresh analytics data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
