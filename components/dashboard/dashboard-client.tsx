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
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStartDate(searchParams.get("start") || initialStartDate)
    setEndDate(searchParams.get("end") || initialEndDate)
  }, [searchParams, initialStartDate, initialEndDate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log(`Fetching data from ${startDate} to ${endDate}`)

        const response = await fetch(`/api/analytics/dashboard-data?start=${startDate}&end=${endDate}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", response.status, errorText)
          throw new Error(`API Error: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log("API Response:", result)

        setData(result)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError(err instanceof Error ? err.message : "Failed to load analytics data")
      } finally {
        setLoading(false)
      }
    }

    if (startDate && endDate) {
      fetchData()
    }
  }, [startDate, endDate])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Screenshot Creator</h1>
          <p className="text-muted-foreground">Create shareable screenshots for {websiteUrl}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 h-full">
          <div className="h-[600px] w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-[600px] w-full bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Screenshot Creator</h1>
          <p className="text-muted-foreground">Create shareable screenshots for {websiteUrl}</p>
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

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Screenshot Creator</h1>
          <p className="text-muted-foreground">Create shareable screenshots for {websiteUrl}</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p>No data available. Please connect your Google Analytics account.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dateRange = {
    from: new Date(startDate),
    to: new Date(endDate),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Screenshot Creator</h1>
        <p className="text-muted-foreground">Create shareable screenshots for {websiteUrl}</p>
      </div>

      {/* Debug info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analytics records: {data.analyticsData?.length || 0}</p>
          <p>Total visitors: {data.stats?.totalVisitors || 0}</p>
          <p>
            Date range: {startDate} to {endDate}
          </p>
        </CardContent>
      </Card>

      <ScreenshotEditor websiteUrl={websiteUrl} dateRange={dateRange} analyticsData={data.analyticsData || []} />
    </div>
  )
}
