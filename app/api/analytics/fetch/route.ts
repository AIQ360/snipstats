import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getGoogleAnalyticsData, processAndStoreAnalyticsData } from "@/lib/google/analytics"
import { format, subDays } from "date-fns"
import { needsDataRefresh } from "@/lib/google/data-refresh"

export async function POST(request: NextRequest) {
  console.log("API: Fetching analytics data...")
  const supabase = await createClient()

  // Get the user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.log("API: User not authenticated")
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get the request body
    const body = await request.json()
    const { days = 30, forceRefresh = false } = body
    console.log(`API: Fetching data for the last ${days} days${forceRefresh ? " (forced refresh)" : ""}`)

    // Check if user has a connected GA account
    console.log(`API: Checking GA account for user ${user.id}`)
    const { data: gaAccount, error: gaError } = await supabase
      .from("ga_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (gaError || !gaAccount) {
      console.log("API: Google Analytics account not found", gaError)
      return NextResponse.json({ error: "Google Analytics account not found" }, { status: 404 })
    }

    if (gaAccount.ga_property_id === "pending_selection") {
      console.log("API: Google Analytics property not selected")
      return NextResponse.json({ error: "Google Analytics property not selected" }, { status: 400 })
    }

    // Calculate date range
    const endDate = format(new Date(), "yyyy-MM-dd")
    const startDate = format(subDays(new Date(), days), "yyyy-MM-dd")
    console.log(`API: Date range: ${startDate} to ${endDate}`)

    // Check if we need to refresh data from Google Analytics
    const needsRefresh = forceRefresh || (await needsDataRefresh(user.id, startDate, endDate))

    if (needsRefresh) {
      console.log("API: Refreshing data from Google Analytics...")
      // Fetch the data from Google Analytics
      const data = await getGoogleAnalyticsData(user.id, startDate, endDate)
      console.log("API: Data fetched successfully")

      // Process and store the data
      console.log("API: Processing and storing data...")
      await processAndStoreAnalyticsData(user.id, data)
      console.log("API: Data processed and stored successfully")
    } else {
      console.log("API: Using existing data from Supabase")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API: Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data", details: String(error) }, { status: 500 })
  }
}
