"use client"

import { useState } from "react"
import { DateRangePicker } from "./ui/date-range-picker"
import { Button } from "./ui/button"
import { subDays } from "date-fns"
import type { DateRange } from "react-day-picker"

export function DateRangeSelector() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([subDays(new Date(), 30), new Date()])

  const presetRanges = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ]

  const handleDateChange = async (start: Date, end: Date) => {
    try {
      const response = await fetch("/api/analytics/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to sync analytics")
      }

      // Trigger a page refresh to show new data
      window.location.reload()
    } catch (error) {
      console.error("Error syncing analytics:", error)
    }
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      <DateRangePicker
        value={dateRange}
        onChange={(range: DateRange | undefined) => {
          if (range?.from && range?.to) {
            const newRange: [Date, Date] = [range.from, range.to]
            setDateRange(newRange)
            handleDateChange(range.from, range.to)
          }
        }}
      />
      <div className="flex gap-2">
        {presetRanges.map(({ label, days }) => (
          <Button
            key={days}
            variant="outline"
            onClick={() => {
              const end = new Date()
              const start = subDays(end, days)
              setDateRange([start, end])
              handleDateChange(start, end)
            }}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
