"use client"

import useSWR from "swr"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Define types for our data
export interface DashboardData {
  analyticsData: any[]
  events: any[]
  referrers: any[]
  topPages: any[]
  stats: {
    totalVisitors: number
    totalPageViews: number
    avgBounceRate: number
    avgSessionDuration: number
  }
}

// Fetcher function for SWR with optimized caching
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    // Add cache control headers to improve performance
    headers: {
      "Cache-Control": "max-age=60", // Cache for 1 minute
    },
  })

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }

  return res.json()
}

export function useDashboardData(startDate: string, endDate: string) {
  // Create a cache key based on the date range
  const cacheKey = `/api/analytics/dashboard-data?start=${startDate}&end=${endDate}`
  const [hasTriedFallback, setHasTriedFallback] = useState(false)

  // Use SWR for data fetching with optimized caching
  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardData>(cacheKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 120000, // 2 minutes - increase cache time
    keepPreviousData: true, // Keep showing previous data while loading new data
    errorRetryCount: 2, // Limit retry attempts
    loadingTimeout: 5000, // Set timeout to 5 seconds
    onSuccess: (data) => {
      // Check if we got empty data
      if (
        data &&
        data.analyticsData.length === 0 &&
        data.events.length === 0 &&
        data.referrers.length === 0 &&
        data.topPages.length === 0 &&
        !hasTriedFallback
      ) {
        console.log("DASHBOARD_DATA: No data found in Supabase, trying fallback to API...")
        handleFallbackToAPI()
      }
    },
  })

  // Fallback to API when no data is found
  const handleFallbackToAPI = async () => {
    setHasTriedFallback(true)
    try {
      console.log("DASHBOARD_DATA: Triggering force refresh as fallback...")
      const response = await fetch("/api/analytics/force-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to refresh data")
      }

      // Revalidate the data after force refresh
      await mutate()
      console.log("DASHBOARD_DATA: Fallback refresh completed")
    } catch (error) {
      console.error("DASHBOARD_DATA: Error in fallback refresh:", error)
      toast.error("Failed to load analytics data")
    }
  }

  // Prefetch adjacent date ranges
  useEffect(() => {
    // Only prefetch after the main data has loaded and only for common ranges
    if (data && !isLoading && !isValidating) {
      // We'll skip prefetching to improve performance
    }
  }, [data, isLoading, isValidating, startDate, endDate])

  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}
