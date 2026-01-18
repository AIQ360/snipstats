import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { fetchGeographicDataForDateRange, fetchDeviceDataForDateRange } from "@/lib/google/analytics"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing required parameters: start, end" }, { status: 400 })
    }

    console.log(`Fetching data for user ${user.id} from ${startDate} to ${endDate}`)

    // Fetch analytics data
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("daily_analytics")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (analyticsError) {
      console.error("Analytics error:", analyticsError)
    }

    // Fetch events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (eventsError) {
      console.error("Events error:", eventsError)
    }

    // Fetch referrers
    const { data: referrersData, error: referrersError } = await supabase
      .from("referrers")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)

    if (referrersError) {
      console.error("Referrers error:", referrersError)
    }

    // Aggregate referrers
    const referrersMap = new Map()
    if (referrersData) {
      referrersData.forEach((item) => {
        const current = referrersMap.get(item.source) || 0
        referrersMap.set(item.source, current + (item.visitors || 0))
      })
    }
    const referrers = Array.from(referrersMap.entries())
      .map(([source, visitors]) => ({ source, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10)

    // Fetch top pages
    const { data: topPagesData, error: topPagesError } = await supabase
      .from("top_pages")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)

    if (topPagesError) {
      console.error("Top pages error:", topPagesError)
    }

    // Aggregate top pages
    const pagesMap = new Map()
    if (topPagesData) {
      topPagesData.forEach((item) => {
        const current = pagesMap.get(item.page_path) || 0
        pagesMap.set(item.page_path, current + (item.page_views || 0))
      })
    }
    const topPages = Array.from(pagesMap.entries())
      .map(([page_path, page_views]) => ({ page_path, page_views }))
      .sort((a, b) => b.page_views - a.page_views)
      .slice(0, 10)

    // Fetch geographic data
    const geographicData = await fetchGeographicDataForDateRange(user.id, startDate, endDate)

    // Fetch device data
    const deviceData = await fetchDeviceDataForDateRange(user.id, startDate, endDate)

    // Calculate stats
    const totalVisitors = analyticsData?.reduce((sum, item) => sum + (item.visitors || 0), 0) || 0
    const totalPageViews = analyticsData?.reduce((sum, item) => sum + (item.page_views || 0), 0) || 0
    const avgBounceRate =
      analyticsData && analyticsData.length > 0
        ? analyticsData.reduce((sum, item) => sum + (item.bounce_rate || 0), 0) / analyticsData.length
        : 0
    const avgSessionDuration =
      analyticsData && analyticsData.length > 0
        ? analyticsData.reduce((sum, item) => sum + (item.avg_session_duration || 0), 0) / analyticsData.length
        : 0

    console.log(`Analytics records: ${analyticsData?.length || 0}`)
    console.log(`Total visitors: ${totalVisitors}`)
    console.log(`Date range: ${startDate} to ${endDate}`)

    return NextResponse.json({
      analyticsData: analyticsData || [],
      events: events || [],
      referrers,
      topPages,
      geographicData: geographicData || [],
      deviceData: deviceData || [],
      stats: {
        totalVisitors,
        totalPageViews,
        avgBounceRate,
        avgSessionDuration,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
