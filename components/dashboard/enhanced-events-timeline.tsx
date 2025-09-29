"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Award, TrendingUp } from "lucide-react"
import { TrafficInsightCard } from "@/components/dashboard/traffic-insight-card"
import type { InsightData } from "@/lib/insights-types"

interface Event {
  id: string
  date: string
  event_type: "spike" | "drop" | "milestone" | "streak"
  title: string
  description: string
  value: number
}

interface EnhancedEventsTimelineProps {
  events: Event[]
}

export function EnhancedEventsTimeline({ events }: EnhancedEventsTimelineProps) {
  const [insights, setInsights] = useState<Record<string, InsightData | null>>({})
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({})

  // Load insights for spike and drop events
  useEffect(() => {
    const fetchInsights = async () => {
      const spikeDropEvents = events.filter((event) => event.event_type === "spike" || event.event_type === "drop")

      for (const event of spikeDropEvents) {
        // Skip if we already have this insight or are loading it
        if (insights[event.date] !== undefined || loadingInsights[event.date]) continue

        // Mark as loading
        setLoadingInsights((prev) => ({ ...prev, [event.date]: true }))

        // Extract percentage change from description
        const percentageMatch = event.description.match(/(\d+)%/)
        const percentageChange = percentageMatch ? Number.parseInt(percentageMatch[1]) : 0

        try {
          // Fetch insight data from API
          const response = await fetch(
            `/api/insights/${event.date}?type=${event.event_type}&change=${percentageChange}`,
          )

          if (response.ok) {
            const insightData = await response.json()
            // Store the result
            setInsights((prev) => ({ ...prev, [event.date]: insightData }))
          } else {
            console.error(`Failed to fetch insight for ${event.date}: ${response.statusText}`)
            setInsights((prev) => ({ ...prev, [event.date]: null }))
          }
        } catch (error) {
          console.error(`Error fetching insight for ${event.date}:`, error)
          setInsights((prev) => ({ ...prev, [event.date]: null }))
        } finally {
          setLoadingInsights((prev) => ({ ...prev, [event.date]: false }))
        }
      }
    }

    fetchInsights()
  }, [events, insights, loadingInsights])

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">No events to display</p>
        </CardContent>
      </Card>
    )
  }

  // Group events by month
  const groupedEvents: Record<string, Event[]> = {}
  events.forEach((event) => {
    const date = new Date(event.date)
    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

    if (!groupedEvents[monthYear]) {
      groupedEvents[monthYear] = []
    }

    groupedEvents[monthYear].push(event)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
          <div key={monthYear}>
            <h3 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">{monthYear}</h3>
            <div className="space-y-4">
              {monthEvents.map((event) => {
                const date = new Date(event.date)
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })

                const hasInsight = insights[event.date] !== undefined && insights[event.date] !== null
                const isLoadingInsight = loadingInsights[event.date]

                return (
                  <div key={event.id} className="space-y-2">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          event.event_type === "spike"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : event.event_type === "drop"
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                              : event.event_type === "milestone"
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                                : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}
                      >
                        {event.event_type === "spike" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : event.event_type === "drop" ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : event.event_type === "milestone" ? (
                          <Award className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{event.title}</h4>
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">{formattedDate}</span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{event.description}</p>
                      </div>
                    </div>

                    {/* Show insight card if available */}
                    {hasInsight && (
                      <div className="ml-12">
                        <TrafficInsightCard insight={insights[event.date]!} className="mt-2" />
                      </div>
                    )}

                    {/* Show loading state if fetching insight */}
                    {isLoadingInsight && (
                      <div className="ml-12 mt-2 rounded-md border border-neutral-200 p-3 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                        Loading insights...
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
