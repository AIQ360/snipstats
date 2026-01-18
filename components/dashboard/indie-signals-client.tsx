"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { LineChart, AlertCircle, Loader2, RefreshCw, TableIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface AnalyticsData {
  id: string
  user_id: string
  date: string
  visitors: number
  page_views: number
  avg_session: number
  bounce_rate: number
  created_at: string
}

interface Insight {
  bestDay?: {
    date: string
    visitors: number
  }
}

interface Event {
  id?: string
  user_id: string
  date: string
  event_type: "weekly_momentum" | "quality_traffic" | "referrer_milestone" | "growth_acceleration" | "referrer_risk"
  title: string
  description: string
  value: number
  metadata?: Record<string, any>
}

const IndieSignalsClient: React.FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [insights, setInsights] = useState<Insight | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")
  const [dayRange, setDayRange] = useState<7 | 14 | 30>(7)
  const [isConnectedToGA, setIsConnectedToGA] = useState<boolean | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/sign-in")
        return
      }

      setUser(user)
    }

    getUser()
  }, [router])

  useEffect(() => {
    const checkGAConnection = async () => {
      if (!user) return

      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("ga_accounts").select("ga_property_id").eq("user_id", user.id)

        if (error) {
          console.error("Error checking GA connection:", error)
          setIsConnectedToGA(false)
        } else {
          setIsConnectedToGA(data && data.length > 0)
        }
      } catch (error) {
        console.error("Error in GA connection check:", error)
        setIsConnectedToGA(false)
      }
    }

    checkGAConnection()
  }, [user])

  useEffect(() => {
    if (user && isConnectedToGA) {
      setIsLoading(false)
      fetchAnalyticsData()
    } else if (user && isConnectedToGA === false) {
      setIsLoading(false)
    }
  }, [user, isConnectedToGA])

  useEffect(() => {
    if (user && isConnectedToGA) {
      fetchAnalyticsData()
    }
  }, [dayRange, user, isConnectedToGA])

  const fetchAnalyticsData = async (showLoading = true) => {
    if (!user) return

    try {
      if (showLoading) {
        setIsLoadingData(true)
      }

      const supabase = createClient()

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - dayRange)

      const { data: analyticsData, error: analyticsError } = await supabase
        .from("daily_analytics")
        .select("id, user_id, date, visitors, page_views, avg_session_duration, bounce_rate, created_at")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])
        .order("date", { ascending: true })

      if (analyticsError) {
        console.error("Error fetching analytics data:", analyticsError)
        toast.error("Failed to fetch analytics data")
        return
      }

      const transformedData: AnalyticsData[] = (analyticsData || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        date: item.date,
        visitors: item.visitors || 0,
        page_views: item.page_views || 0,
        avg_session: item.avg_session_duration || 0,
        bounce_rate: item.bounce_rate || 0,
        created_at: item.created_at,
      }))

      const calculatedInsights = calculateInsights(transformedData)

      setAnalyticsData(transformedData)
      setInsights(calculatedInsights)

      await fetchEvents()
    } catch (error) {
      console.error("Error in analytics fetch:", error)
      toast.error("Failed to fetch analytics data")
    } finally {
      if (showLoading) {
        setIsLoadingData(false)
      }
    }
  }

  const fetchEvents = async () => {
    if (!user) return

    try {
      const supabase = createClient()

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - dayRange)

      // Only fetch NEW event types (not old daily spike/drop/streak/milestone)
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .in("event_type", [
          "weekly_momentum",
          "quality_traffic",
          "referrer_milestone",
          "growth_acceleration",
          "referrer_risk",
        ])
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (eventsError) {
        console.error("Error fetching events:", eventsError)
        return
      }

      console.log(`Fetched ${eventsData?.length || 0} weekly insight events for ${dayRange} days`)
      setEvents(eventsData || [])
    } catch (error) {
      console.error("Error in events fetch:", error)
    }
  }

  const calculateInsights = (data: AnalyticsData[]): Insight => {
    if (!data || data.length === 0) {
      return {}
    }

    const bestDay = data.reduce((max, current) => (current.visitors > max.visitors ? current : max))

    return {
      bestDay: {
        date: bestDay.date,
        visitors: bestDay.visitors,
      },
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const chartData = analyticsData.map((item) => ({
    date: formatDate(item.date),
    visitors: item.visitors,
    pageViews: item.page_views,
    bounceRate: Math.round(item.bounce_rate * 100),
  }))

  const handleDayRangeChange = (newRange: 7 | 14 | 30) => {
    if (newRange === dayRange) return
    setDayRange(newRange)
  }

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case "weekly_momentum":
        return "bg-green-100 text-green-800"
      case "quality_traffic":
        return "bg-blue-100 text-blue-800"
      case "referrer_milestone":
        return "bg-orange-100 text-orange-800"
      case "growth_acceleration":
        return "bg-purple-100 text-purple-800"
      case "referrer_risk":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <div className="absolute inset-0 animate-ping-slow rounded-full bg-purple-600 opacity-20"></div>
        </div>
        <span className="mt-4 font-medium text-lg">Loading your dashboard...</span>
      </div>
    )
  }

  if (!isConnectedToGA) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Google Analytics Not Connected</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Please connect your Google Analytics account to enable analytics data collection and view insights.
          </p>
          <Button
            onClick={() => router.push("/connect-ga")}
            className="bg-purple-600 hover:bg-purple-700 rounded-full px-6"
          >
            Connect Google Analytics
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header with controls */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-1">Analytics</h1>
            <p className="text-muted-foreground">The numbers don't lie, but they do tell stories</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-muted rounded-full p-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                className={dayRange === 7 ? "bg-background rounded-full" : "rounded-full"}
                onClick={() => handleDayRangeChange(7)}
              >
                7 Days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={dayRange === 14 ? "bg-background rounded-full" : "rounded-full"}
                onClick={() => handleDayRangeChange(14)}
              >
                14 Days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={dayRange === 30 ? "bg-background rounded-full" : "rounded-full"}
                onClick={() => handleDayRangeChange(30)}
              >
                30 Days
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalyticsData(true)}
              disabled={isLoadingData}
              className="rounded-full"
            >
              {isLoadingData ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {analyticsData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No Analytics Data Yet</h3>
          <p className="text-muted-foreground max-w-md">
            We're collecting your analytics data. Please check back later.
          </p>
        </div>
      ) : (
        <>
          {/* Best Day Hero Section */}
          {insights?.bestDay && (
            <div className="mb-16 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-amber-500 to-amber-300 rounded-full"></div>
              <div className="flex items-center gap-4 ml-2">
                <div className="text-5xl">🏆</div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">Best Day</h2>
                  <p className="text-xl text-muted-foreground">
                    <span className="font-semibold">{formatDate(insights.bestDay.date)}</span> —{" "}
                    <span className="font-bold text-foreground">{insights.bestDay.visitors} visitors</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Section */}
          <div className="mb-16 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-blue-600 to-blue-400 rounded-full"></div>
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 ml-2">Numbers That Don't Lie</h2>

            <div className="space-y-8 ml-2">
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12">
                <h3 className="text-3xl font-bold">
                  {analyticsData.reduce((sum, item) => sum + item.visitors, 0).toLocaleString()}
                </h3>
                <div className="text-xl">
                  <span className="text-muted-foreground">visitors in the last</span> {dayRange}{" "}
                  <span className="text-muted-foreground">days</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12">
                <h3 className="text-3xl font-bold">
                  {analyticsData.reduce((sum, item) => sum + item.page_views, 0).toLocaleString()}
                </h3>
                <div className="text-xl">
                  <span className="text-muted-foreground">page views</span>
                  <span className="block text-sm text-muted-foreground">
                    Your content's getting eyes. Don't mess it up now.
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12">
                <h3 className="text-3xl font-bold">
                  {formatTime(analyticsData.reduce((sum, item) => sum + item.avg_session, 0) / analyticsData.length)}
                </h3>
                <div className="text-xl">
                  <span className="text-muted-foreground">average session time</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12">
                <h3 className="text-3xl font-bold">
                  {(
                    (analyticsData.reduce((sum, item) => sum + item.bounce_rate, 0) / analyticsData.length) *
                    100
                  ).toFixed(1)}
                  %
                </h3>
                <div className="text-xl">
                  <span className="text-muted-foreground">bounce rate</span>
                  {(analyticsData.reduce((sum, item) => sum + item.bounce_rate, 0) / analyticsData.length) * 100 >
                  50 ? (
                    <span className="block text-sm text-rose-500">Ouch, fix your content.</span>
                  ) : (
                    <span className="block text-sm text-green-600">Not bad, they're sticking around.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground ml-2">Traffic Flow</h2>
            <div className="bg-muted rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                className={viewMode === "chart" ? "bg-background rounded-full" : "rounded-full"}
                onClick={() => setViewMode("chart")}
              >
                <LineChart className="h-4 w-4 mr-1" /> Chart
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={viewMode === "table" ? "bg-background rounded-full" : "rounded-full"}
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-4 w-4 mr-1" /> Table
              </Button>
            </div>
          </div>

          {/* Chart or Table View */}
          <div className="mb-16 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-purple-600 to-purple-400 rounded-full"></div>

            {viewMode === "chart" ? (
              <div className="bg-linear-to-br from-slate-50 to-white border border-slate-100 rounded-xl p-6 shadow-xs">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #E4E7ED",
                          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "20px",
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="visitors"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ stroke: "#8B5CF6", strokeWidth: 2, r: 4, fill: "white" }}
                        activeDot={{ r: 6, stroke: "#8B5CF6", strokeWidth: 2, fill: "white" }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="pageViews"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ stroke: "#3B82F6", strokeWidth: 2, r: 4, fill: "white" }}
                        activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2, fill: "white" }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bounceRate"
                        stroke="#F43F5E"
                        strokeWidth={2}
                        dot={{ stroke: "#F43F5E", strokeWidth: 2, r: 4, fill: "white" }}
                        activeDot={{ r: 6, stroke: "#F43F5E", strokeWidth: 2, fill: "white" }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Visitors</TableHead>
                        <TableHead className="text-xs">Views</TableHead>
                        <TableHead className="text-xs">Session</TableHead>
                        <TableHead className="text-xs">Bounce</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 transition-all duration-300">
                          <TableCell className="text-xs font-medium py-2">{formatDate(item.date)}</TableCell>
                          <TableCell className="text-xs font-mono py-2">{item.visitors}</TableCell>
                          <TableCell className="text-xs font-mono py-2">{item.page_views}</TableCell>
                          <TableCell className="text-xs font-mono py-2">{formatTime(item.avg_session)}</TableCell>
                          <TableCell className="text-xs font-mono py-2">
                            {(item.bounce_rate * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          {/* Key Insights - Weekly Events */}
          {events.length > 0 && (
            <div className="mb-16 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-indigo-600 to-indigo-400 rounded-full"></div>
              <div className="ml-2">
                <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Key Insights</h2>
                <p className="text-muted-foreground mb-8">Meaningful weekly trends and patterns in your data</p>

                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id || `${event.date}-${event.event_type}`}
                      className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="text-2xl shrink-0 mt-0.5">{event.title.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge className={`text-xs px-2 py-1 capitalize ${getEventBadgeColor(event.event_type)}`}>
                            {event.event_type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2 wrap-break-word text-sm">{event.description}</p>
                        <p className="text-xs text-muted-foreground">{formatEventDate(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State for Events */}
          {events.length === 0 && (
            <div className="mb-16 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-slate-300 to-slate-200 rounded-full"></div>
              <div className="ml-2 text-center py-8">
                <p className="text-muted-foreground">No significant insights yet. Check back next week!</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-20 border-t pt-6 text-center text-muted-foreground">
            <p className="italic">Come back tomorrow, legends don't sleep.</p>
          </div>
        </>
      )}
    </div>
  )
}

export default IndieSignalsClient
