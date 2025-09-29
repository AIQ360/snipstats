import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getGoogleAnalyticsData, processAndStoreAnalyticsData } from "@/lib/google/analytics"
import { format, subDays } from "date-fns"

// GET: Fetch top 10 referrers and pages for a date range
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const propertyId = searchParams.get("propertyId")

  if (!startDate || !endDate || !propertyId) {
    return NextResponse.json({ error: "Missing required parameters: startDate, endDate, propertyId" }, { status: 400 })
  }

  try {
    // Query top 10 referrers
    const { data: referrers, error: referrersError } = await supabase
      .from("referrers")
      .select("source, visitors")
      .eq("daily_analytics.property_id", propertyId)
      .gte("daily_analytics.date", startDate)
      .lte("daily_analytics.date", endDate)
      .join("daily_analytics", {
        "referrers.daily_analytics_id": "daily_analytics.id",
      })
      .groupBy("source")
      .order("visitors", { ascending: false })
      .limit(10)

    if (referrersError) {
      throw referrersError
    }

    // Query top 10 pages
    const { data: pages, error: pagesError } = await supabase
      .from("top_pages")
      .select("page_path, page_views")
      .eq("daily_analytics.property_id", propertyId)
      .gte("daily_analytics.date", startDate)
      .lte("daily_analytics.date", endDate)
      .join("daily_analytics", {
        "top_pages.daily_analytics_id": "daily_analytics.id",
      })
      .groupBy("page_path")
      .order("page_views", { ascending: false })
      .limit(10)

    if (pagesError) {
      throw pagesError
    }

    return NextResponse.json({
      referrers: referrers || [],
      pages: pages || [],
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// POST: Fetch and store Google Analytics data (original route)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { days = 30 } = body

    const endDate = format(new Date(), "yyyy-MM-dd")
    const startDate = format(subDays(new Date(), days), "yyyy-MM-dd")

    const data = await getGoogleAnalyticsData(user.id, startDate, endDate)
    await processAndStoreAnalyticsData(user.id, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
