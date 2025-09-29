"use client"

import { useState } from "react"
import { format, isWithinInterval, subDays } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  className?: string
  isLoading?: boolean
}

export function DateRangePicker({ dateRange, onDateRangeChange, className, isLoading = false }: DateRangePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Calculate the valid date range (last 30 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = subDays(today, 1)
  const thirtyDaysAgo = subDays(yesterday, 29)

  // Custom day renderer to highlight the selected range and valid dates
  const dayClassNames = (date: Date) => {
    const isSelected =
      dateRange?.from &&
      dateRange?.to &&
      isWithinInterval(date, {
        start: dateRange.from,
        end: dateRange.to,
      })

    const isValidDate = isWithinInterval(date, {
      start: thirtyDaysAgo,
      end: yesterday,
    })

    return {
      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground":
        isSelected,
      "opacity-50 cursor-not-allowed": !isValidDate,
      "border border-primary/20":
        isValidDate && !isSelected && dateRange?.from && date.getTime() === dateRange.from.getTime(),
      "border border-primary/20":
        isValidDate && !isSelected && dateRange?.to && date.getTime() === dateRange.to.getTime(),
    }
  }

  const handlePresetChange = (preset: string) => {
    if (isLoading) return

    let from: Date

    switch (preset) {
      case "7d":
        from = subDays(yesterday, 6)
        break
      case "14d":
        from = subDays(yesterday, 13)
        break
      case "30d":
        from = thirtyDaysAgo
        break
      default:
        from = subDays(yesterday, 6)
    }

    onDateRangeChange({ from, to: yesterday })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground",
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 fixed"
            align="start"
            side="bottom"
            sideOffset={4}
            alignOffset={0}
            avoidCollisions={true}
            style={{ zIndex: 100 }}
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from || thirtyDaysAgo}
              selected={dateRange}
              onSelect={(range) => {
                // Ensure the range is within the valid dates
                if (range?.from && range?.to) {
                  const validFrom = new Date(Math.max(range.from.getTime(), thirtyDaysAgo.getTime()))
                  const validTo = new Date(Math.min(range.to.getTime(), yesterday.getTime()))
                  onDateRangeChange({ from: validFrom, to: validTo })
                } else {
                  onDateRangeChange(range)
                }
                setIsCalendarOpen(false)
              }}
              numberOfMonths={1}
              disabled={(date) => {
                // Disable dates outside the 30-day range
                return date < thirtyDaysAgo || date >= today
              }}
              classNames={{
                day_range_start: "rounded-l-md",
                day_range_end: "rounded-r-md",
                day_range_middle: "bg-primary/20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                row: "flex w-full mt-2",
                table: "w-full border-collapse space-y-1",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                head: "text-xs",
              }}
              modifiersClassNames={{
                selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                today: "bg-accent text-accent-foreground",
                range_start: "rounded-l-md",
                range_end: "rounded-r-md",
                range_middle: "bg-primary/20",
              }}
              modifiers={{
                selected: (date) => {
                  if (!dateRange?.from || !dateRange?.to) return false
                  return isWithinInterval(date, {
                    start: dateRange.from,
                    end: dateRange.to,
                  })
                },
              }}
              styles={{
                caption: { position: "relative" },
                caption_label: { fontWeight: 500 },
                nav_button_previous: { position: "absolute", left: "0.5rem" },
                nav_button_next: { position: "absolute", right: "0.5rem" },
                table: { width: "100%", borderCollapse: "collapse" },
                head_cell: { width: "2.25rem", textAlign: "center", padding: "0.25rem 0" },
                cell: { width: "2.25rem", height: "2.25rem", padding: 0 },
                day: { width: "2.25rem", height: "2.25rem", margin: "0 auto" },
              }}
              dayClassNames={dayClassNames}
            />
          </PopoverContent>
        </Popover>

        <Select onValueChange={handlePresetChange} defaultValue="7d" disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-[180px]">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select range" />
            )}
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-50 fixed" align="start" style={{ zIndex: 100 }}>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="14d">Last 14 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
