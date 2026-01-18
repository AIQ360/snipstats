"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Clock,
  Eye,
  Trophy,
  Flame,
  Coffee,
  Zap,
  Globe,
  Smartphone,
} from "lucide-react"
import { GeographicInsights } from "./geographic-insights"
import { DeviceInsights } from "./device-insights"

interface ReferrerData {
  source: string
  visitors: number
  date: string
}

interface AnalyticsData {
  date: string
  visitors: number
  page_views: number
  avg_session_duration: number
  bounce_rate: number
}

interface TopPageData {
  page_path: string
  page_views: number
  avg_engagement_time: number
  date: string
}

interface GeographicData {
  country: string
  visitors: number
  pageViews: number
  cities: string[]
  cityCount: number
}

interface DeviceData {
  devices: { category: string; visitors: number }[]
  browsers: { browser: string; visitors: number }[]
  operatingSystems: { os: string; visitors: number }[]
}

interface Props {
  referrers: ReferrerData[]
  analytics: AnalyticsData[]
  topPages: TopPageData[]
  geographicData: GeographicData[]
  deviceData: DeviceData
  userId: string
}

export function TrafficIntelligenceClient({
  referrers,
  analytics,
  topPages,
  geographicData,
  deviceData,
  userId,
}: Props) {
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("30d")

  // Filter data by time range
  const filteredData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffString = cutoffDate.toISOString().split("T")[0]

    return {
      referrers: referrers.filter((r) => r.date >= cutoffString),
      analytics: analytics.filter((a) => a.date >= cutoffString),
      topPages: topPages.filter((p) => p.date >= cutoffString),
    }
  }, [referrers, analytics, topPages, timeRange])

  // Fixed Social Platform Detection - using exact domain matching
  const socialPlatformAnalysis = useMemo(() => {
    const platforms = {
      reddit: {
        domains: ["reddit.com", "www.reddit.com", "old.reddit.com", "new.reddit.com"],
        icon: "🔥",
        name: "Reddit",
      },
      twitter: {
        domains: ["twitter.com", "www.twitter.com", "x.com", "www.x.com", "t.co"],
        icon: "🐦",
        name: "Twitter/X",
      },
      hackernews: {
        domains: ["news.ycombinator.com", "ycombinator.com"],
        icon: "📰",
        name: "Hacker News",
      },
      producthunt: {
        domains: ["producthunt.com", "www.producthunt.com"],
        icon: "🦄",
        name: "Product Hunt",
      },
      indiehackers: {
        domains: ["indiehackers.com", "www.indiehackers.com"],
        icon: "🚀",
        name: "IndieHackers",
      },
    }

    const platformData = Object.entries(platforms)
      .map(([key, platform]) => {
        // More precise filtering - check if source exactly matches or starts with domain
        const platformReferrers = filteredData.referrers.filter((r) => {
          const source = r.source.toLowerCase()
          return platform.domains.some((domain) => {
            return (
              source === domain ||
              source.startsWith(domain + "/") ||
              source.startsWith("https://" + domain) ||
              source.startsWith("http://" + domain) ||
              source.endsWith("." + domain) ||
              (domain === "t.co" && source === "t.co")
            ) // Special case for t.co
          })
        })

        console.log(`${platform.name} referrers found:`, platformReferrers.length)
        console.log(
          `${platform.name} sources:`,
          platformReferrers.map((r) => r.source),
        )

        if (platformReferrers.length === 0) return null

        // Group by date and sum visitors
        const dailyTraffic = platformReferrers.reduce(
          (acc, ref) => {
            acc[ref.date] = (acc[ref.date] || 0) + ref.visitors
            return acc
          },
          {} as Record<string, number>,
        )

        const totalVisitors = Object.values(dailyTraffic).reduce((sum, visitors) => sum + visitors, 0)
        const avgDaily = totalVisitors / Object.keys(dailyTraffic).length
        const bestDay = Object.entries(dailyTraffic).sort(([, a], [, b]) => b - a)[0]

        // Find spikes (days with >2x average traffic)
        const spikes = Object.entries(dailyTraffic)
          .filter(([, visitors]) => visitors > avgDaily * 2)
          .sort(([, a], [, b]) => b - a)

        console.log(`${platform.name} total visitors:`, totalVisitors)
        console.log(`${platform.name} daily traffic:`, dailyTraffic)

        return {
          platform: key,
          name: platform.name,
          icon: platform.icon,
          totalVisitors,
          avgDaily: Math.round(avgDaily),
          bestDay: bestDay
            ? {
                date: bestDay[0],
                visitors: bestDay[1],
                dayName: new Date(bestDay[0]).toLocaleDateString("en-US", { weekday: "long" }),
              }
            : null,
          spikes: spikes.slice(0, 3).map(([date, visitors]) => ({
            date,
            visitors,
            dayName: new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
          })),
        }
      })
      .filter((platform): platform is NonNullable<typeof platform> => platform !== null)
      .sort((a, b) => b.totalVisitors - a.totalVisitors)

    return platformData
  }, [filteredData.referrers])

  // Weekend vs Weekday Patterns
  const dayPatterns = useMemo(() => {
    const dayStats = filteredData.analytics.reduce(
      (acc, day) => {
        const date = new Date(day.date)
        const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" })

        if (!acc[dayOfWeek]) {
          acc[dayOfWeek] = { dayName, visitors: [], pageViews: [] }
        }

        acc[dayOfWeek].visitors.push(day.visitors)
        acc[dayOfWeek].pageViews.push(day.page_views)

        return acc
      },
      {} as Record<number, { dayName: string; visitors: number[]; pageViews: number[] }>,
    )

    const dayAverages = Object.entries(dayStats)
      .map(([dayNum, data]) => {
        const avgVisitors = data.visitors.reduce((sum, v) => sum + v, 0) / data.visitors.length
        const avgPageViews = data.pageViews.reduce((sum, v) => sum + v, 0) / data.pageViews.length

        return {
          dayNum: Number.parseInt(dayNum),
          dayName: data.dayName,
          avgVisitors: Math.round(avgVisitors),
          avgPageViews: Math.round(avgPageViews),
          isWeekend: Number.parseInt(dayNum) === 0 || Number.parseInt(dayNum) === 6,
        }
      })
      .sort((a, b) => a.dayNum - b.dayNum)

    const maxVisitors = Math.max(...dayAverages.map((d) => d.avgVisitors))
    const bestDay = dayAverages.find((d) => d.avgVisitors === maxVisitors)

    const weekdayAvg = dayAverages.filter((d) => !d.isWeekend).reduce((sum, d) => sum + d.avgVisitors, 0) / 5
    const weekendAvg = dayAverages.filter((d) => d.isWeekend).reduce((sum, d) => sum + d.avgVisitors, 0) / 2

    return {
      dayAverages,
      bestDay,
      weekdayAvg: Math.round(weekdayAvg),
      weekendAvg: Math.round(weekendAvg),
      weekendBoost: weekendAvg > weekdayAvg ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100) : null,
    }
  }, [filteredData.analytics])

  // Sticky Content Score
  const stickyContent = useMemo(() => {
    const pageStats = filteredData.topPages.reduce(
      (acc, page) => {
        if (!acc[page.page_path]) {
          acc[page.page_path] = {
            totalViews: 0,
            engagementTimes: [],
            dates: [],
          }
        }

        acc[page.page_path].totalViews += page.page_views
        if (page.avg_engagement_time > 0) {
          acc[page.page_path].engagementTimes.push(page.avg_engagement_time)
        }
        acc[page.page_path].dates.push(page.date)

        return acc
      },
      {} as Record<string, { totalViews: number; engagementTimes: number[]; dates: string[] }>,
    )

    const scoredPages = Object.entries(pageStats)
      .map(([path, stats]) => {
        const avgEngagement =
          stats.engagementTimes.length > 0
            ? stats.engagementTimes.reduce((sum, time) => sum + time, 0) / stats.engagementTimes.length
            : 0

        // Sticky score: engagement time (in minutes) * log(views) to balance high-traffic vs high-engagement
        const stickyScore = (avgEngagement / 60) * Math.log(stats.totalViews + 1)

        return {
          path,
          totalViews: stats.totalViews,
          avgEngagement,
          stickyScore: Math.round(stickyScore * 100) / 100,
          engagementMinutes: Math.round((avgEngagement / 60) * 10) / 10,
        }
      })
      .sort((a, b) => b.stickyScore - a.stickyScore)
      .slice(0, 10)

    return scoredPages
  }, [filteredData.topPages])

  // Enhanced Content Optimization Opportunities
  const contentOptimization = useMemo(() => {
    // Adaptive time range logic
    const totalDays = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30
    const recentDays = Math.ceil(totalDays / 2)
    const comparisonDays = totalDays - recentDays

    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - recentDays)
    const comparisonDate = new Date()
    comparisonDate.setDate(comparisonDate.getDate() - totalDays)

    const recentDateStr = recentDate.toISOString().split("T")[0]
    const comparisonDateStr = comparisonDate.toISOString().split("T")[0]

    // Get pages for both periods
    const recentPages = filteredData.topPages.filter((p) => p.date >= recentDateStr)
    const olderPages = filteredData.topPages.filter((p) => p.date >= comparisonDateStr && p.date < recentDateStr)

    // Aggregate data by page
    const recentStats = recentPages.reduce(
      (acc, page) => {
        if (!acc[page.page_path]) {
          acc[page.page_path] = { views: 0, engagementTimes: [] }
        }
        acc[page.page_path].views += page.page_views
        if (page.avg_engagement_time > 0) {
          acc[page.page_path].engagementTimes.push(page.avg_engagement_time)
        }
        return acc
      },
      {} as Record<string, { views: number; engagementTimes: number[] }>,
    )

    const olderStats = olderPages.reduce(
      (acc, page) => {
        if (!acc[page.page_path]) {
          acc[page.page_path] = { views: 0, engagementTimes: [] }
        }
        acc[page.page_path].views += page.page_views
        if (page.avg_engagement_time > 0) {
          acc[page.page_path].engagementTimes.push(page.avg_engagement_time)
        }
        return acc
      },
      {} as Record<string, { views: number; engagementTimes: number[] }>,
    )

    // Analyze pages for optimization opportunities
    const opportunities = Object.keys(olderStats)
      .filter((path) => olderStats[path].views >= 5) // Only pages with meaningful traffic
      .map((path) => {
        const oldViews = olderStats[path].views
        const newViews = recentStats[path]?.views || 0
        const decline = oldViews > 0 ? ((oldViews - newViews) / oldViews) * 100 : 0

        // Calculate average engagement
        const oldEngagement =
          olderStats[path].engagementTimes.length > 0
            ? olderStats[path].engagementTimes.reduce((sum, time) => sum + time, 0) /
              olderStats[path].engagementTimes.length
            : 0

        const newEngagement =
          recentStats[path]?.engagementTimes.length > 0
            ? recentStats[path].engagementTimes.reduce((sum, time) => sum + time, 0) /
              recentStats[path].engagementTimes.length
            : 0

        const avgEngagement = (oldEngagement + newEngagement) / 2
        const engagementMinutes = avgEngagement / 60

        // Categorize opportunities
        let category = ""
        let priority = 0
        let action = ""
        let icon = ""

        if (decline >= 20 && decline <= 50 && engagementMinutes > 1) {
          // Quick wins: moderate decline but good engagement
          category = "Quick Win"
          priority = 3
          action = "Update title and meta description, add internal links"
          icon = "⚡"
        } else if (decline > 50 && engagementMinutes > 2) {
          // SEO refresh: major decline but great engagement
          category = "SEO Refresh"
          priority = 2
          action = "Research new keywords, update content with recent info"
          icon = "🔍"
        } else if (decline >= 30 && oldViews > 20) {
          // Content update: was popular, now declining
          category = "Content Update"
          priority = 2
          action = "Refresh with current examples, update statistics"
          icon = "📝"
        } else if (decline >= 20 && path.includes("2023")) {
          // Seasonal opportunity: dated content
          category = "Seasonal Update"
          priority = 1
          action = "Update year in title, refresh for 2025 trends"
          icon = "📅"
        }

        if (!category) return null

        return {
          path,
          oldViews,
          newViews,
          decline: Math.round(decline),
          engagementMinutes: Math.round(engagementMinutes * 10) / 10,
          category,
          priority,
          action,
          icon,
        }
      })
      .filter((opp): opp is NonNullable<typeof opp> => opp !== null)
      .sort((a, b) => b.priority - a.priority || a.decline - b.decline)
      .slice(0, 8) // Show top 8 opportunities

    // Group by category
    const grouped = opportunities.reduce(
      (acc, opp) => {
        if (!acc[opp.category]) acc[opp.category] = []
        acc[opp.category].push(opp)
        return acc
      },
      {} as Record<string, typeof opportunities>,
    )

    return { opportunities, grouped }
  }, [filteredData.topPages, timeRange])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-1">Traffic Intelligence</h1>
            <p className="text-muted-foreground">
              Pattern recognition for indie makers — know when your audience shows up and what keeps them engaged
            </p>
          </div>

          <div className="flex gap-2">
            {(["7d", "14d", "30d"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline-solid"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-full"
              >
                {range === "7d" ? "7 days" : range === "14d" ? "14 days" : "30 days"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="patterns" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Traffic Patterns</TabsTrigger>
          <TabsTrigger value="content">Content Intelligence</TabsTrigger>
          <TabsTrigger value="geographic">Global Reach</TabsTrigger>
          <TabsTrigger value="devices">Device Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-12">
          {/* Social Platform Days - Mobile-First Redesign */}
          <div className="relative">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Your Social Platform Days
            </h2>
            <p className="text-muted-foreground mb-8">When Reddit, Twitter, and other platforms send you love</p>

            {socialPlatformAnalysis.length === 0 ? (
              <div className="text-center py-12">
                <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No social platform traffic detected</h3>
                <p className="text-muted-foreground">Keep sharing your work! Your community will find you.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {socialPlatformAnalysis.map((platform) => (
                  <div
                    key={platform.platform}
                    className="bg-linear-to-r from-orange-50 to-transparent border-l-4 border-orange-400 rounded-r-lg p-4 md:p-6"
                  >
                    {/* Platform Header - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl md:text-3xl">{platform.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{platform.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">{platform.totalVisitors}</span> total visitors •{" "}
                            <span className="font-semibold">{platform.avgDaily}</span> avg/day
                          </p>
                        </div>
                      </div>
                      {platform.bestDay && (
                        <Badge className="bg-orange-500 text-white hover:bg-orange-600 shrink-0 self-start sm:self-center">
                          Best: {platform.bestDay.dayName}s
                        </Badge>
                      )}
                    </div>

                    {/* Recent Spikes - Mobile Optimized */}
                    {platform.spikes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          Recent Spikes
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {platform.spikes.map((spike, index) => (
                            <div
                              key={spike.date}
                              className="bg-white border border-orange-200 p-3 rounded-lg shadow-xs"
                            >
                              <div className="font-bold text-lg text-gray-900">{spike.visitors} visitors</div>
                              <div className="text-sm text-muted-foreground">{spike.dayName}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Rhythm Insights - NO CARDS */}
          <div className="relative">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Your Audience's Weekly Rhythm
            </h2>
            <p className="text-muted-foreground mb-8">Simple facts about when people visit your site</p>

            <div className="space-y-8">
              {dayPatterns.bestDay && (
                <div className="border-l-4 border-blue-500 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <h3 className="text-2xl font-bold">{dayPatterns.bestDay.dayName}s get the most traffic</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Average {dayPatterns.bestDay.avgVisitors} visitors on {dayPatterns.bestDay.dayName}s
                  </p>
                  {dayPatterns.weekendBoost && (
                    <div className="mt-3">
                      <Badge className="bg-green-100 text-green-800">
                        Weekends get {dayPatterns.weekendBoost}% more traffic than weekdays
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Simple Traffic Breakdown - NO CARDS */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="border-l-4 border-gray-300 pl-6">
                  <h4 className="text-lg font-bold mb-4">Busiest Days</h4>
                  <div className="space-y-3">
                    {dayPatterns.dayAverages
                      .sort((a, b) => b.avgVisitors - a.avgVisitors)
                      .slice(0, 3)
                      .map((day, index) => (
                        <div key={day.dayNum} className="flex justify-between items-center">
                          <span className="font-medium">{day.dayName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{day.avgVisitors} visitors</span>
                            {index === 0 && <span className="text-yellow-500">👑</span>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border-l-4 border-gray-300 pl-6">
                  <h4 className="text-lg font-bold mb-4">Quietest Days</h4>
                  <div className="space-y-3">
                    {dayPatterns.dayAverages
                      .sort((a, b) => a.avgVisitors - b.avgVisitors)
                      .slice(0, 3)
                      .map((day) => (
                        <div key={day.dayNum} className="flex justify-between items-center">
                          <span className="font-medium">{day.dayName}</span>
                          <span className="text-lg font-bold text-muted-foreground">{day.avgVisitors} visitors</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Simple Weekly Pattern - NO CARDS */}
              <div className="border-l-4 border-gray-300 pl-6">
                <h4 className="text-lg font-bold mb-4">Weekly Pattern</h4>
                <div className="space-y-4">
                  {dayPatterns.dayAverages.map((day) => {
                    const maxVisitors = Math.max(...dayPatterns.dayAverages.map((d) => d.avgVisitors))
                    const percentage = (day.avgVisitors / maxVisitors) * 100

                    return (
                      <div key={day.dayNum} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{day.dayName}</span>
                          <span className="text-sm text-muted-foreground">{day.avgVisitors} avg visitors</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              day.avgVisitors === maxVisitors
                                ? "bg-yellow-400"
                                : day.isWeekend
                                  ? "bg-purple-400"
                                  : "bg-blue-400"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weekday average: </span>
                      <span className="font-bold">{dayPatterns.weekdayAvg} visitors</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weekend average: </span>
                      <span className="font-bold">{dayPatterns.weekendAvg} visitors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-12 max-w-full overflow-hidden">
          {/* Sticky Content Score */}
          <div className="relative">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sticky Content Champions
            </h2>
            <p className="text-muted-foreground mb-8">Pages that grab attention AND keep people engaged</p>

            {stickyContent.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No content data yet</h3>
                <p className="text-muted-foreground">Keep creating! Your sticky content will show up here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stickyContent.map((page, index) => (
                  <div key={page.path} className="border-l-4 border-green-500 pl-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full text-lg font-bold shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold mb-1 wrap-break-word">{page.path}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {page.totalViews} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {page.engagementMinutes}m avg engagement
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold text-green-600">{page.stickyScore}</div>
                        <div className="text-sm text-muted-foreground">sticky score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Content Optimization Opportunities */}
          <div className="relative">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Content Worth Fixing
            </h2>
            <p className="text-muted-foreground mb-8">
              Pages losing traffic but worth your time — practical fixes that might actually help
            </p>

            {contentOptimization.opportunities.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">All your content looks stable</h3>
                <p className="text-muted-foreground">No major declines detected in your selected time range.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(contentOptimization.grouped).map(([category, opportunities]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span>{opportunities[0].icon}</span>
                      {category}s ({opportunities.length})
                    </h3>
                    <div className="space-y-4">
                      {opportunities.map((opp) => (
                        <div
                          key={opp.path}
                          className="bg-linear-to-r from-blue-50 to-transparent border-l-4 border-blue-400 rounded-r-lg p-4"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-gray-900 mb-2 wrap-break-word">{opp.path}</h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                  {opp.decline}% decline ({opp.oldViews} → {opp.newViews} views)
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {opp.engagementMinutes}m engagement
                                </span>
                              </div>
                              <div className="bg-white border border-blue-200 rounded p-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">What to try:</p>
                                <p className="text-sm text-gray-600">{opp.action}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-8">
          <div className="relative">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Geographic Intelligence
            </h2>
            <p className="text-muted-foreground mb-8">Understand where your global audience comes from</p>

            <GeographicInsights data={geographicData} timeRange={timeRange} />
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-8">
          <div className="relative">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Device & Browser Intelligence
            </h2>
            <p className="text-muted-foreground mb-8">Know how your audience accesses your content</p>

            <DeviceInsights data={deviceData} timeRange={timeRange} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-20 border-t pt-8 text-center">
        <p className="text-lg text-muted-foreground italic mb-2">"Know your patterns, optimize your hustle."</p>
        <p className="text-muted-foreground">Data-driven decisions for indie makers. 📊</p>
      </div>
    </div>
  )
}
