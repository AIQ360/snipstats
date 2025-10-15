"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ScreenshotEditor } from "@/components/dashboard/screenshot-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardClientProps {
  userId: string
  websiteUrl: string
  initialStartDate: string
  initialEndDate: string
}

export function DashboardClient({ userId, websiteUrl, initialStartDate, initialEndDate }: DashboardClientProps) {
  const searchParams = useSearchParams()

  // Helper to format a Date to yyyy-mm-dd for APIs
  const toISODate = (d: Date) => d.toISOString().split("T")[0]

  // Compute safe default range: last 28 days
  const today = new Date()
  const startDefDate = new Date()
  startDefDate.setDate(startDefDate.getDate() - 28)
  const defaultStart = initialStartDate || toISODate(startDefDate)
  const defaultEnd = initialEndDate || toISODate(today)

  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)
  const [data, setData] = useState<any>({ analyticsData: [], stats: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Keep state in sync with URL params but fall back to safe defaults
  useEffect(() => {
    const spStart = searchParams.get("start")
    const spEnd = searchParams.get("end")
    setStartDate(spStart || defaultStart)
    setEndDate(spEnd || defaultEnd)
  }, [searchParams, defaultStart, defaultEnd])

  useEffect(() => {
    const fetchData = async () => {
      // Abort the request if it hangs too long
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s safety timeout

      try {
        setLoading(true)
        setError(null)

        const qs = new URLSearchParams({ start: startDate, end: endDate }).toString()
        const response = await fetch(`/api/analytics/dashboard-data?${qs}`, { signal: controller.signal })

        if (!response.ok) {
          const errorText = await response.text().catch(() => "")
          throw new Error(`API Error: ${response.status} ${errorText}`)
        }

        // Handle cases where a redirect returns HTML instead of JSON
        let result: any = null
        try {
          result = await response.json()
        } catch (e) {
          throw new Error("Failed to parse analytics JSON response")
        }

        // Ensure a safe shape for the editor even if result is partial
        const safeResult = {
          analyticsData: Array.isArray(result?.analyticsData) ? result.analyticsData : [],
          stats: result?.stats ?? {},
        }

        setData(safeResult)
      } catch (err: any) {
        console.error("Error fetching analytics data:", err)
        setError(err?.message || "Failed to load analytics data")

        // Provide a safe fallback so the editor can still render
        setData({ analyticsData: [], stats: {} })
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    if (startDate && endDate) {
      fetchData()
    } else {
      // If dates are still missing, fall back and stop loading
      setData({ analyticsData: [], stats: {} })
      setLoading(false)
    }
  }, [startDate, endDate])

  if (error && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Screenshot Creator</h1>
          <p className="text-muted-foreground">Create shareable screenshots for {websiteUrl || "your site"}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure we always have a usable data object
  const safe = data ?? { analyticsData: [], stats: {} }
  const dateRange = {
    from: new Date(startDate || defaultStart),
    to: new Date(endDate || defaultEnd),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Screenshot Creator</h1>
        <p className="text-muted-foreground">Create shareable screenshots for {websiteUrl || "your site"}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analytics records: {safe.analyticsData?.length || 0}</p>
          <p>Total visitors: {safe.stats?.totalVisitors || 0}</p>
          <p>
            Date range: {startDate} to {endDate}
          </p>
          {error ? <p className="text-red-600">Note: {error}</p> : null}
          {loading ? <p className="text-muted-foreground">Loading analytics…</p> : null}
        </CardContent>
      </Card>

      <ScreenshotEditor websiteUrl={websiteUrl} dateRange={dateRange} analyticsData={safe.analyticsData || []} />
    </div>
  )
}
