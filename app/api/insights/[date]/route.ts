import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export interface InsightData {
  date: string
  spike_type: "Traffic Spike" | "Traffic Drop"
  percentage_change: number
  top_sources: Array<{ source: string; visitors: number }>
  top_pages: Array<{ page: string; visitors: number }>
}

export async function GET(request: NextRequest, { params }: { params: { date: string } }) {
  const date = params.date
  const searchParams = request.nextUrl.searchParams
  const spikeType = searchParams.get("type") as "spike" | "drop"
  const percentageChange = Number.parseInt(searchParams.get("change") || "0", 10)

  const supabase = await createClient()

  try {
    // Use getUser() instead of getSession() for better security
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting authenticated user:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    // Fetch top 3 referrers for the date
    const { data: referrers, error: referrersError } = await supabase
      .from("referrers")
      .select("source, visitors")
      .eq("user_id", userId)
      .eq("date", date)
      .order("visitors", { ascending: false })
      .limit(3)

    if (referrersError) {
      console.error("Error fetching referrers for insights:", referrersError)
      return NextResponse.json({ error: "Failed to fetch referrers" }, { status: 500 })
    }

    // Fetch top 3 pages for the date
    const { data: pages, error: pagesError } = await supabase
      .from("top_pages")
      .select("page_path, page_views")
      .eq("user_id", userId)
      .eq("date", date)
      .order("page_views", { ascending: false })
      .limit(3)

    if (pagesError) {
      console.error("Error fetching top pages for insights:", pagesError)
      return NextResponse.json({ error: "Failed to fetch top pages" }, { status: 500 })
    }

    // Format the data
    const insightData: InsightData = {
      date,
      spike_type: spikeType === "spike" ? "Traffic Spike" : "Traffic Drop",
      percentage_change: Math.abs(percentageChange),
      top_sources: referrers.map((r) => ({ source: r.source, visitors: r.visitors })),
      top_pages: pages.map((p) => ({ page: p.page_path, visitors: p.page_views })),
    }

    return NextResponse.json(insightData)
  } catch (error) {
    console.error("Error in insights API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
