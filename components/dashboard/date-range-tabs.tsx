"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DateRangeTabsProps {
  onRangeChange: (range: { start: string; end: string }) => void
  className?: string
  initialRange?: {
    start: string
    end: string
  }
}

export function DateRangeTabs({ onRangeChange, className, initialRange }: DateRangeTabsProps) {
  const [activeTab, setActiveTab] = useState<"7d" | "14d" | "30d">("7d")
  const [isLoading, setIsLoading] = useState(false)
  const [dateRangeText, setDateRangeText] = useState("")

  // Calculate the date ranges
  const getDateRange = (days: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = subDays(today, 1)
    const startDate = subDays(yesterday, days - 1)
    return {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(yesterday, "yyyy-MM-dd"),
      displayText: `${format(startDate, "MMM d")} - ${format(yesterday, "MMM d, yyyy")}`,
    }
  }

  // Set initial active tab based on initialRange if provided
  useEffect(() => {
    if (initialRange) {
      const start = new Date(initialRange.start)
      const end = new Date(initialRange.end)
      const dayDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      if (dayDiff <= 7) setActiveTab("7d")
      else if (dayDiff <= 14) setActiveTab("14d")
      else setActiveTab("30d")

      setDateRangeText(`${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`)
    } else {
      // Set default to 7 days
      const range = getDateRange(7)
      setDateRangeText(range.displayText)
    }
  }, [initialRange])

  const handleTabChange = async (tab: "7d" | "14d" | "30d") => {
    if (isLoading) return
    setIsLoading(true)
    setActiveTab(tab)

    try {
      let days: number
      switch (tab) {
        case "7d":
          days = 7
          break
        case "14d":
          days = 14
          break
        case "30d":
          days = 30
          break
        default:
          days = 7
      }

      const range = getDateRange(days)
      setDateRangeText(range.displayText)
      onRangeChange({ start: range.start, end: range.end })
    } catch (error) {
      console.error("Error updating date range:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col space-y-2">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <Button
            variant={activeTab === "7d" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 text-xs sm:text-sm",
              activeTab === "7d" ? "bg-background text-foreground shadow-sm" : "",
            )}
            onClick={() => handleTabChange("7d")}
            disabled={isLoading}
          >
            7 days
          </Button>
          <Button
            variant={activeTab === "14d" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 text-xs sm:text-sm",
              activeTab === "14d" ? "bg-background text-foreground shadow-sm" : "",
            )}
            onClick={() => handleTabChange("14d")}
            disabled={isLoading}
          >
            14 days
          </Button>
          <Button
            variant={activeTab === "30d" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 text-xs sm:text-sm",
              activeTab === "30d" ? "bg-background text-foreground shadow-sm" : "",
            )}
            onClick={() => handleTabChange("30d")}
            disabled={isLoading}
          >
            30 days
          </Button>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          <span>{dateRangeText}</span>
        </div>
      </div>
    </div>
  )
}
