import { createClient } from "@/utils/supabase/server"

export interface InsightData {
  date: string
  spike_type: "Traffic Spike" | "Traffic Drop"
  percentage_change: number
  top_sources: Array<{ source: string; visitors: number }>
  top_pages: Array<{ page: string; visitors: number }>
}

export async function getInsightsForDate(
  userId: string,
  date: string,
  spikeType: "spike" | "drop",
  percentageChange: number,
): Promise<InsightData | null> {
  const supabase = await createClient()

  try {
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
      return null
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
      return null
    }

    // Format the data
    return {
      date,
      spike_type: spikeType === "spike" ? "Traffic Spike" : "Traffic Drop",
      percentage_change: Math.abs(percentageChange),
      top_sources: referrers.map((r) => ({ source: r.source, visitors: r.visitors })),
      top_pages: pages.map((p) => ({ page: p.page_path, visitors: p.page_views })),
    }
  } catch (error) {
    console.error("Error in getInsightsForDate:", error)
    return null
  }
}
