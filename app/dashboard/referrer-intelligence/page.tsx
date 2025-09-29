import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ReferrerIntelligenceClient } from "@/components/dashboard/referrer-intelligence-client"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

async function ReferrerIntelligenceData({ userId }: { userId: string }) {
  const supabase = await createClient()

  // Get last 30 days for referrer analysis
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const startDate = thirtyDaysAgo.toISOString().split("T")[0]
  const endDate = new Date().toISOString().split("T")[0]

  // Fetch referrers data
  const { data: referrers, error: referrersError } = await supabase
    .from("referrers")
    .select("source, visitors, date")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("visitors", { ascending: false })

  if (referrersError) {
    console.error("Error fetching referrers:", referrersError)
  }

  // Fetch top pages data
  const { data: topPages, error: pagesError } = await supabase
    .from("top_pages")
    .select("page_path, page_views, avg_engagement_time, date")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("page_views", { ascending: false })

  if (pagesError) {
    console.error("Error fetching top pages:", pagesError)
  }

  // Fetch daily analytics for context
  const { data: analytics, error: analyticsError } = await supabase
    .from("daily_analytics")
    .select("date, visitors, page_views")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  if (analyticsError) {
    console.error("Error fetching analytics:", analyticsError)
  }

  return (
    <ReferrerIntelligenceClient
      referrers={referrers || []}
      topPages={topPages || []}
      analytics={analytics || []}
      userId={userId}
    />
  )
}

function ReferrerIntelligenceSkeleton() {
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
    </div>
  )
}

export default async function ReferrerIntelligencePage() {
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
      <Suspense fallback={<ReferrerIntelligenceSkeleton />}>
        <ReferrerIntelligenceData userId={user.id} />
      </Suspense>
    </div>
  )
}
