"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { format, subDays } from "date-fns"
import { DateRangeTabs } from "./date-range-tabs"
import { toast } from "sonner"

interface DateRangeFilterProps {
  initialRange?: {
    from: Date
    to: Date
  }
  onRangeChange?: (range: { start: string; end: string }) => void
}

export function DateRangeFilter({ initialRange, onRangeChange }: DateRangeFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // Get initial range from URL or props
  const getInitialRange = () => {
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")

    if (startParam && endParam) {
      return {
        start: startParam,
        end: endParam,
      }
    }

    if (initialRange?.from && initialRange?.to) {
      return {
        start: format(initialRange.from, "yyyy-MM-dd"),
        end: format(initialRange.to, "yyyy-MM-dd"),
      }
    }

    // Default to last 7 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = subDays(today, 1)
    const sevenDaysAgo = subDays(yesterday, 6)

    return {
      start: format(sevenDaysAgo, "yyyy-MM-dd"),
      end: format(yesterday, "yyyy-MM-dd"),
    }
  }

  const handleDateRangeChange = async (range: { start: string; end: string }) => {
    setIsLoading(true)

    try {
      // Create new URLSearchParams
      const params = new URLSearchParams(searchParams.toString())
      params.set("start", range.start)
      params.set("end", range.end)

      // Update URL without full page refresh
      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      // Call the callback if provided
      if (onRangeChange) {
        onRangeChange(range)
      }
    } catch (error) {
      console.error("Error updating date range:", error)
      toast.error("Failed to update date range")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-4">
      <DateRangeTabs onRangeChange={handleDateRangeChange} initialRange={getInitialRange()} />
    </div>
  )
}
