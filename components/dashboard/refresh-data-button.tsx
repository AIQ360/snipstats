"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"
import { useSearchParams } from "next/navigation"

interface RefreshDataButtonProps {
  days?: number
}

export function RefreshDataButton({ days = 30 }: RefreshDataButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const searchParams = useSearchParams()

  // Get current date range from URL
  const startDate = searchParams.get("start")
  const endDate = searchParams.get("end")

  // Create the cache key that matches what we use in useDashboardData
  const cacheKey = `/api/analytics/dashboard-data?start=${startDate}&end=${endDate}`

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      console.log("REFRESH: Starting manual data refresh...")
      const response = await fetch("/api/analytics/force-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          days,
          startDate,
          endDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to refresh data")
      }

      // Revalidate the SWR cache for the current date range
      await mutate(cacheKey)

      toast.success("Analytics data refreshed successfully")
    } catch (error) {
      console.error("REFRESH: Error refreshing data:", error)
      toast.error("Failed to refresh analytics data")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Data"}
    </Button>
  )
}
