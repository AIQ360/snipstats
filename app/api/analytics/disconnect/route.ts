import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  console.log("DISCONNECT: Starting GA account disconnect process")
  const supabase = await createClient()

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("DISCONNECT: User not authenticated")
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    console.log(`DISCONNECT: Processing GA account disconnect for user ${user.id}`)

    // First, get all daily_analytics IDs for this user
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("daily_analytics")
      .select("id")
      .eq("user_id", user.id)

    if (analyticsError) {
      console.error("DISCONNECT: Error fetching analytics data:", analyticsError)
      return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
    }

    console.log(
      `DISCONNECT: Found ${analyticsData?.length || 0} analytics records to delete with IDs: ${analyticsData?.map((item) => item.id).join(", ")}`,
    )

    if (analyticsData && analyticsData.length > 0) {
      const analyticsIds = analyticsData.map((item) => item.id)

      // Delete referrers data
      const { error: referrersError } = await supabase.from("referrers").delete().in("daily_analytics_id", analyticsIds)

      if (referrersError) {
        console.error("DISCONNECT: Error deleting referrers data:", referrersError)
        return NextResponse.json({ error: "Failed to delete referrers data" }, { status: 500 })
      }
      console.log("DISCONNECT: Deleted referrers data")

      // Delete top_pages data
      const { error: pagesError } = await supabase.from("top_pages").delete().in("daily_analytics_id", analyticsIds)

      if (pagesError) {
        console.error("DISCONNECT: Error deleting top pages data:", pagesError)
        return NextResponse.json({ error: "Failed to delete top pages data" }, { status: 500 })
      }
      console.log("DISCONNECT: Deleted top pages data")
    }

    // Delete daily_analytics data
    const { error: deleteAnalyticsError } = await supabase.from("daily_analytics").delete().eq("user_id", user.id)

    if (deleteAnalyticsError) {
      console.error("DISCONNECT: Error deleting analytics data:", deleteAnalyticsError)
      return NextResponse.json({ error: "Failed to delete analytics data" }, { status: 500 })
    }
    console.log("DISCONNECT: Deleted daily analytics data")

    // Delete events data
    const { error: eventsError } = await supabase.from("events").delete().eq("user_id", user.id)

    if (eventsError) {
      console.error("DISCONNECT: Error deleting events data:", eventsError)
      return NextResponse.json({ error: "Failed to delete events data" }, { status: 500 })
    }
    console.log("DISCONNECT: Deleted events data")

    // Delete GA account
    const { error: deleteGaError } = await supabase.from("ga_accounts").delete().eq("user_id", user.id)

    if (deleteGaError) {
      console.error("DISCONNECT: Error deleting GA account:", deleteGaError)
      return NextResponse.json({ error: "Failed to delete GA account" }, { status: 500 })
    }
    console.log("DISCONNECT: Deleted GA account")

    console.log("DISCONNECT: Successfully disconnected Google Analytics account")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DISCONNECT: Error disconnecting Google Analytics account:", error)
    return NextResponse.json(
      {
        error: "Failed to disconnect Google Analytics account",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
