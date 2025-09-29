import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { TrafficIntelligenceClient } from "@/components/dashboard/traffic-intelligence-client"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

async function TrafficIntelligenceData({ userId }: { userId: string }) {
  const supabase = await createClient()

  // Get last 60 days for better pattern analysis
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const startDate = sixtyDaysAgo.toISOString().split("T")[0]
  const endDate = new Date().toISOString().split("T")[0]

  // Fetch referrers data for social platform analysis
  const { data: referrers, error: referrersError } = await supabase
    .from("referrers")
    .select("source, visitors, date")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  if (referrersError) {
    console.error("Error fetching referrers:", referrersError)
  }

  // Fetch daily analytics for weekday/weekend patterns
  const { data: analytics, error: analyticsError } = await supabase
    .from("daily_analytics")
    .select("date, visitors, page_views, avg_session_duration, bounce_rate")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  if (analyticsError) {
    console.error("Error fetching analytics:", analyticsError)
  }

  // Fetch top pages for content performance analysis
  const { data: topPages, error: pagesError } = await supabase
    .from("top_pages")
    .select("page_path, page_views, avg_engagement_time, date")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  if (pagesError) {
    console.error("Error fetching top pages:", pagesError)
  }

  // Fetch geographic data and aggregate by country
  const { data: geographicRaw, error: geographicError } = await supabase
    .from("geographic_analytics")
    .select("country, country_code, city, visitors, page_views, date")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)

  if (geographicError) {
    console.error("Error fetching geographic data:", geographicError)
  }

  // Process geographic data to match expected format
  const geographicData = []
  if (geographicRaw && geographicRaw.length > 0) {
    const countryStats: Record<string, { visitors: number; pageViews: number; cities: Set<string> }> = {}

    for (const geo of geographicRaw) {
      if (!countryStats[geo.country]) {
        countryStats[geo.country] = {
          visitors: 0,
          pageViews: 0,
          cities: new Set(),
        }
      }

      countryStats[geo.country].visitors += geo.visitors || 0
      countryStats[geo.country].pageViews += geo.page_views || 0
      if (geo.city) {
        countryStats[geo.country].cities.add(geo.city)
      }
    }

    geographicData.push(
      ...Object.entries(countryStats)
        .map(([country, stats]) => ({
          country,
          visitors: stats.visitors,
          pageViews: stats.pageViews,
          cities: Array.from(stats.cities),
          cityCount: stats.cities.size,
        }))
        .sort((a, b) => b.visitors - a.visitors),
    )
  }

  // Fetch device data and aggregate
  const { data: deviceRaw, error: deviceError } = await supabase
    .from("device_analytics")
    .select("device_category, browser, operating_system, visitors, page_views, date")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)

  if (deviceError) {
    console.error("Error fetching device data:", deviceError)
  }

  // Process device data to match expected format
  const deviceData = {
    devices: [],
    browsers: [],
    operatingSystems: [],
  }

  if (deviceRaw && deviceRaw.length > 0) {
    const deviceStats: Record<string, number> = {}
    const browserStats: Record<string, number> = {}
    const osStats: Record<string, number> = {}

    for (const device of deviceRaw) {
      // Device category aggregation
      if (device.device_category) {
        deviceStats[device.device_category] = (deviceStats[device.device_category] || 0) + (device.visitors || 0)
      }

      // Browser aggregation
      if (device.browser) {
        browserStats[device.browser] = (browserStats[device.browser] || 0) + (device.visitors || 0)
      }

      // OS aggregation
      if (device.operating_system) {
        osStats[device.operating_system] = (osStats[device.operating_system] || 0) + (device.visitors || 0)
      }
    }

    deviceData.devices = Object.entries(deviceStats)
      .map(([category, visitors]) => ({ category, visitors }))
      .sort((a, b) => b.visitors - a.visitors)

    deviceData.browsers = Object.entries(browserStats)
      .map(([browser, visitors]) => ({ browser, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10)

    deviceData.operatingSystems = Object.entries(osStats)
      .map(([os, visitors]) => ({ os, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10)
  }

  return (
    <TrafficIntelligenceClient
      referrers={referrers || []}
      analytics={analytics || []}
      topPages={topPages || []}
      geographicData={geographicData}
      deviceData={deviceData}
      userId={userId}
    />
  )
}

function TrafficIntelligenceSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-80 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  )
}

export default async function TrafficIntelligencePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<TrafficIntelligenceSkeleton />}>
        <TrafficIntelligenceData userId={user.id} />
      </Suspense>
    </div>
  )
}
