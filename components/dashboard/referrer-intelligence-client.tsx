"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Eye, Zap, Target, Rocket, Coffee } from "lucide-react"

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

  // Generate indie insights
  const generateInsights = () => {
    const insights = []

    if (aggregatedReferrers.length > 0) {
      const topReferrer = aggregatedReferrers[0]
      const percentage = Math.round((topReferrer.visitors / totalVisitors) * 100)

      insights.push({
        type: "traffic-source",
        title: `${topReferrer.source} is your biggest fan`,
        description: `${percentage}% of your traffic (${topReferrer.visitors} visitors) came from ${topReferrer.source}`,
        action: "Double down on what's working!",
      })
    }

    if (aggregatedPages.length > 0) {
      const topPage = aggregatedPages[0]
      const engagementMinutes = Math.round(topPage.avg_engagement_time / 60)

      insights.push({
        type: "content-performance",
        title: `📈 ${topPage.page_path} is crushing it`,
        description: `${topPage.page_views} views with ${engagementMinutes}m average engagement`,
        action:
          engagementMinutes > 2
            ? "People love this content — create more like it!"
            : "Good traffic, but try to increase engagement time",
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
          title: `🚀 You're on fire — ${Math.round(growth)}% growth!`,
          description: "Your recent traffic is significantly higher than before",
          action: "Whatever you did recently, keep doing it!",
        })
      } else if (growth < -10) {
        insights.push({
          type: "growth",
          title: `📉 Traffic dipped ${Math.abs(Math.round(growth))}%`,
          description: "Recent traffic is lower than usual",
          action: "Time to ship something new or engage your community!",
        })
      }
    }

    return insights
  }

  const insights = generateInsights()

  const formatEngagementTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col gap-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Referrer Intelligence</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your site's daily health check — see where your people come from
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["7d", "14d", "30d"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-full text-xs sm:text-sm"
              >
                {range === "7d" ? "7 days" : range === "14d" ? "14 days" : "30 days"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Numbers */}
      <div className="mb-12 sm:mb-16 relative">
        <div className="absolute -left-2 sm:-left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
        <h2 className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6 ml-4 sm:ml-6">
          The Numbers
        </h2>

        <div className="space-y-6 sm:space-y-8 ml-4 sm:ml-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 lg:gap-12">
            <h3 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              {totalVisitors.toLocaleString()}
            </h3>
            <div className="text-base sm:text-xl">
              <span className="text-muted-foreground">real humans who found your work</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 lg:gap-12">
            <h3 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              {totalPageViews.toLocaleString()}
            </h3>
            <div className="text-base sm:text-xl">
              <span className="text-muted-foreground">page views — content consumption happening</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 lg:gap-12">
            <h3 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              {aggregatedReferrers.length}
            </h3>
            <div className="text-base sm:text-xl">
              <span className="text-muted-foreground">different places finding you</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indie Intelligence */}
      {insights.length > 0 && (
        <div className="mb-12 sm:mb-16 relative">
          <h2 className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6 ml-4 sm:ml-6 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Indie Intelligence
          </h2>

          <div className="space-y-4 sm:space-y-6 ml-4 sm:ml-6">
            {insights.map((insight, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 sm:pl-6 py-3 sm:py-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 break-words">{insight.title}</h3>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-2 break-words">
                  {insight.description}
                </p>
                <p className="text-sm sm:text-base text-blue-600 font-medium break-words">{insight.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="referrers" className="space-y-6 sm:space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referrers" className="text-xs sm:text-sm">
            Traffic Sources
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">
            Daily Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrers" className="space-y-4 sm:space-y-6">
          <div className="relative">
            <h2 className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6 ml-4 sm:ml-6">
              Where Your Visitors Come From
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 ml-4 sm:ml-6">
              Not just raw URLs — grouped and explained for real builders
            </p>

            {aggregatedReferrers.length === 0 ? (
              <div className="text-center py-8 sm:py-12 ml-4 sm:ml-6">
                <Coffee className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No referrer data yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Keep building and sharing! Your audience will find you.
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 ml-4 sm:ml-6">
                {(showAllReferrers ? aggregatedReferrers : aggregatedReferrers.slice(0, 10)).map((referrer, index) => {
                  const percentage = Math.round((referrer.visitors / totalVisitors) * 100)

                  // Determine background color based on performance
                  const getBgColor = (percentage: number) => {
                    if (percentage >= 20) return "from-green-50 to-emerald-50 border-green-500"
                    if (percentage >= 10) return "from-blue-50 to-cyan-50 border-blue-500"
                    if (percentage >= 5) return "from-yellow-50 to-orange-50 border-yellow-500"
                    return "from-gray-50 to-slate-50 border-gray-400"
                  }

                  return (
                    <div
                      key={referrer.source}
                      className={`p-3 sm:p-4 lg:p-6 bg-gradient-to-r ${getBgColor(percentage)} rounded-lg border-l-4`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full text-sm sm:text-lg font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold break-all">{referrer.source}</h3>
                              <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm w-fit">
                                {percentage}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl sm:text-2xl font-bold">{referrer.visitors}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">visitors</div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {!showAllReferrers && aggregatedReferrers.length > 10 && (
                  <div className="text-center py-4 sm:py-6">
                    <span
                      onClick={() => setShowAllReferrers(true)}
                      className="text-sm sm:text-base text-blue-600 hover:text-blue-800 cursor-pointer font-medium underline decoration-dotted underline-offset-4 transition-colors"
                    >
                      load more sources ({aggregatedReferrers.length - 10} remaining)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 sm:space-y-6">
          <div className="relative">
            <h2 className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6 ml-4 sm:ml-6">
              Daily Activity Log
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 ml-4 sm:ml-6">
              Your launch diary meets traffic tracker
            </p>

            {filteredData.analytics.length === 0 ? (
              <div className="text-center py-8 sm:py-12 ml-4 sm:ml-6">
                <Rocket className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No activity data yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Your journey starts here!</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 ml-4 sm:ml-6">
                {filteredData.analytics.map((day, index) => {
                  const dayReferrers = filteredData.referrers.filter((r) => r.date === day.date)
                  const topReferrer = dayReferrers.sort((a, b) => b.visitors - a.visitors)[0]

                  return (
                    <div
                      key={day.date}
                      className="p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border-l-4 border-gray-400"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div className="space-y-2">
                          <h3 className="text-base sm:text-lg font-bold">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              {day.visitors} visitors
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              {day.page_views} views
                            </span>
                          </div>
                        </div>
                        {day.visitors > 0 && (
                          <Badge variant="secondary" className="text-sm sm:text-lg px-2 sm:px-3 py-1 w-fit">
                            {day.visitors > 100 ? "🔥 Hot day!" : day.visitors > 50 ? "📈 Good day" : "👀 Steady"}
                          </Badge>
                        )}
                      </div>

                      {topReferrer && (
                        <div className="text-sm sm:text-base text-muted-foreground break-all">
                          <span className="font-medium">Top source:</span> {topReferrer.source} ({topReferrer.visitors}{" "}
                          visitors)
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-16 sm:mt-20 border-t pt-6 sm:pt-8 text-center">
        <p className="text-base sm:text-lg text-muted-foreground italic mb-2">
          "Analytics that speak indie: simple, honest, action-ready."
        </p>
        <p className="text-sm sm:text-base text-muted-foreground">
          Keep building, keep shipping. Your audience is out there. 🚀
        </p>
      </div>
    </div>
  )
}
