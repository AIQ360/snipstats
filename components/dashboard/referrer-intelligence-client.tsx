"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Eye, Target, TrendingUp, TrendingDown } from "lucide-react"

interface ReferrerData {
  source: string
  visitors: number
  date: string
}

interface TopPageData {
  page_path: string
  page_views: number
  avg_engagement_time: number
  date: string
}

interface AnalyticsData {
  date: string
  visitors: number
  page_views: number
}

interface Props {
  referrers: ReferrerData[]
  topPages: TopPageData[]
  analytics: AnalyticsData[]
  userId: string
}

export function ReferrerIntelligenceClient({ referrers, topPages, analytics, userId }: Props) {
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("7d")
  const [showAllReferrers, setShowAllReferrers] = useState(false)

  // Filter data by time range
  const filteredData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffString = cutoffDate.toISOString().split("T")[0]

    return {
      referrers: referrers.filter((r) => r.date >= cutoffString),
      topPages: topPages.filter((p) => p.date >= cutoffString),
      analytics: analytics.filter((a) => a.date >= cutoffString),
    }
  }, [referrers, topPages, analytics, timeRange])

  // Aggregate referrer data
  const aggregatedReferrers = useMemo(() => {
    const grouped = filteredData.referrers.reduce(
      (acc, ref) => {
        if (!acc[ref.source]) {
          acc[ref.source] = 0
        }
        acc[ref.source] += ref.visitors
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(grouped)
      .map(([source, visitors]) => ({ source, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
  }, [filteredData.referrers])

  // Aggregate top pages
  const aggregatedPages = useMemo(() => {
    const grouped = filteredData.topPages.reduce(
      (acc, page) => {
        if (!acc[page.page_path]) {
          acc[page.page_path] = { views: 0, engagementTimes: [] }
        }
        acc[page.page_path].views += page.page_views
        if (page.avg_engagement_time) {
          acc[page.page_path].engagementTimes.push(page.avg_engagement_time)
        }
        return acc
      },
      {} as Record<string, { views: number; engagementTimes: number[] }>,
    )

    return Object.entries(grouped)
      .map(([path, data]) => ({
        page_path: path,
        page_views: data.views,
        avg_engagement_time:
          data.engagementTimes.length > 0
            ? data.engagementTimes.reduce((a, b) => a + b, 0) / data.engagementTimes.length
            : 0,
      }))
      .sort((a, b) => b.page_views - a.page_views)
      .slice(0, 10)
  }, [filteredData.topPages])

  // Calculate totals
  const totalVisitors = filteredData.analytics.reduce((sum, day) => sum + day.visitors, 0)
  const totalPageViews = filteredData.analytics.reduce((sum, day) => sum + day.page_views, 0)

  // Generate insights
  const generateInsights = () => {
    const insights = []

    if (aggregatedReferrers.length > 0) {
      const topReferrer = aggregatedReferrers[0]
      const percentage = Math.round((topReferrer.visitors / totalVisitors) * 100)

      insights.push({
        type: "traffic-source",
        title: `${topReferrer.source} is your biggest source`,
        description: `${percentage}% of traffic (${topReferrer.visitors} visitors)`,
      })
    }

    if (aggregatedPages.length > 0) {
      const topPage = aggregatedPages[0]
      const engagementMinutes = Math.round(topPage.avg_engagement_time / 60)

      insights.push({
        type: "content-performance",
        title: `${topPage.page_path} is your top page`,
        description: `${topPage.page_views} views, ${engagementMinutes}m avg engagement`,
      })
    }

    // Growth insight
    if (filteredData.analytics.length >= 7) {
      const recent = filteredData.analytics.slice(0, 3).reduce((sum, day) => sum + day.visitors, 0)
      const older = filteredData.analytics.slice(-3).reduce((sum, day) => sum + day.visitors, 0)
      const growth = ((recent - older) / older) * 100

      if (growth > 10) {
        insights.push({
          type: "growth",
          title: `${Math.round(growth)}% growth trend`,
          description: "Recent traffic is trending upward",
        })
      } else if (growth < -10) {
        insights.push({
          type: "growth",
          title: `${Math.abs(Math.round(growth))}% decline`,
          description: "Recent traffic is trending downward",
        })
      }
    }

    return insights
  }

  const insights = generateInsights()

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrer Intelligence</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Understand where your visitors come from and how they engage
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["7d", "14d", "30d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="rounded-full"
            >
              {range === "7d" ? "7 days" : range === "14d" ? "14 days" : "30 days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics - Proper Grid Alignment */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold">
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Visitors */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
              <Users className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{totalVisitors.toLocaleString()}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Total visitors</div>
            </div>
          </div>

          {/* Page Views */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
              <Eye className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{totalPageViews.toLocaleString()}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Page views</div>
            </div>
          </div>

          {/* Sources */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
              <Target className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{aggregatedReferrers.length}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Traffic sources</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold">
            Key Insights
          </h2>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {insight.type === "growth" && insight.title.includes("+") ? (
                    <TrendingUp className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  ) : insight.type === "growth" ? (
                    <TrendingDown className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  ) : null}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">{insight.title}</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">{insight.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="referrers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referrers">Traffic Sources</TabsTrigger>
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
        </TabsList>

        {/* Traffic Sources Tab */}
        <TabsContent value="referrers" className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold mb-2">
              Where Your Visitors Come From
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your traffic sources ranked by visitor count
            </p>
          </div>

          {aggregatedReferrers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-400 dark:text-neutral-600 text-sm">No referrer data available</div>
            </div>
          ) : (
            <div className="space-y-2">
              {(showAllReferrers ? aggregatedReferrers : aggregatedReferrers.slice(0, 10)).map((referrer, index) => {
                const percentage = Math.round((referrer.visitors / totalVisitors) * 100)

                return (
                  <div
                    key={referrer.source}
                    className="flex items-center justify-between p-4 rounded border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 dark:text-neutral-400 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {referrer.source}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{percentage}% of traffic</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {referrer.visitors}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">visitors</div>
                    </div>
                  </div>
                )
              })}

              {!showAllReferrers && aggregatedReferrers.length > 10 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowAllReferrers(true)}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline decoration-dotted underline-offset-4 transition-colors"
                  >
                    Show {aggregatedReferrers.length - 10} more sources
                  </button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Daily Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold mb-2">
              Daily Activity
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Traffic trends over time</p>
          </div>

          {filteredData.analytics.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-400 dark:text-neutral-600 text-sm">No activity data available</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredData.analytics.map((day) => {
                const dayReferrers = filteredData.referrers.filter((r) => r.date === day.date)
                const topReferrer = dayReferrers.sort((a, b) => b.visitors - a.visitors)[0]
                const avgPerDay = totalVisitors / filteredData.analytics.length

                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-4 rounded border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {day.visitors} visitors • {day.page_views} views
                        {topReferrer && ` • Top: ${topReferrer.source}`}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {day.visitors > avgPerDay
                          ? `+${Math.round(((day.visitors - avgPerDay) / avgPerDay) * 100)}%`
                          : `${Math.round(((day.visitors - avgPerDay) / avgPerDay) * 100)}%`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
