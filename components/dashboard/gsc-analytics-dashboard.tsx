"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RefreshCw } from "lucide-react"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, subWeeks } from "date-fns"
import { cn } from "@/lib/utils"
import { GSCStatCards } from "./gsc-stat-cards"
import { GSCComboChart } from "./gsc-combo-chart"
import { GSCReferrersPanel } from "./gsc-referrers-panel"
import { GSCCountriesPanel } from "./gsc-countries-panel"

interface GSCAnalyticsDashboardProps {
    userId: string
    websiteUrl?: string
}

interface DashboardData {
    analyticsData: Array<{
        date: string
        visitors: number
        page_views: number
        bounce_rate: number
        avg_session_duration: number
    }>
    referrers: Array<{
        source: string
        visitors: number
    }>
    geographicData: Array<{
        country: string
        country_code?: string
        city?: string
        visitors: number
    }>
    stats: {
        totalVisitors: number
        totalPageViews: number
        avgBounceRate: number
        avgSessionDuration: number
    }
}

type DateRangePreset =
    | "today"
    | "yesterday"
    | "last7days"
    | "thisWeek"
    | "lastWeek"
    | "last14days"
    | "last30days"
    | "thisMonth"

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 days" },
    { value: "thisWeek", label: "This week" },
    { value: "lastWeek", label: "Last week" },
    { value: "last14days", label: "Last 14 days" },
    { value: "last30days", label: "Last 30 days" },
    { value: "thisMonth", label: "This month" },
]

function getDateRangeFromPreset(preset: DateRangePreset): { from: Date; to: Date } {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    switch (preset) {
        case "today":
            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)
            return { from: todayStart, to: today }

        case "yesterday":
            const yesterdayStart = subDays(today, 1)
            yesterdayStart.setHours(0, 0, 0, 0)
            const yesterdayEnd = subDays(today, 1)
            yesterdayEnd.setHours(23, 59, 59, 999)
            return { from: yesterdayStart, to: yesterdayEnd }

        case "last7days":
            return { from: subDays(today, 6), to: today }

        case "thisWeek":
            return { from: startOfWeek(today, { weekStartsOn: 1 }), to: today }

        case "lastWeek":
            const lastWeekEnd = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1)
            return { from: startOfWeek(lastWeekEnd, { weekStartsOn: 1 }), to: lastWeekEnd }

        case "last14days":
            return { from: subDays(today, 13), to: today }

        case "last30days":
            return { from: subDays(today, 29), to: today }

        case "thisMonth":
            return { from: startOfMonth(today), to: today }

        default:
            return { from: subDays(today, 29), to: today }
    }
}

export function GSCAnalyticsDashboard({ userId, websiteUrl }: GSCAnalyticsDashboardProps) {
    const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("last30days")
    const [dateRange, setDateRange] = useState(() => getDateRangeFromPreset("last30days"))
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const handlePresetChange = (value: DateRangePreset) => {
        setSelectedPreset(value)
        setDateRange(getDateRangeFromPreset(value))
    }

    const fetchData = async () => {
        if (!dateRange.from || !dateRange.to) return

        setLoading(true)
        setError(null)

        try {
            const startDate = format(dateRange.from, "yyyy-MM-dd")
            const endDate = format(dateRange.to, "yyyy-MM-dd")

            const response = await fetch(
                `/api/analytics/dashboard-data?start=${startDate}&end=${endDate}`
            )

            if (!response.ok) {
                throw new Error("Failed to fetch data")
            }

            const result = await response.json()
            setData(result)
        } catch (err) {
            console.error("Error fetching dashboard data:", err)
            setError(err instanceof Error ? err.message : "Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [dateRange])

    const displayUrl = websiteUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "Your Site"

    const currentLabel = DATE_RANGE_OPTIONS.find(opt => opt.value === selectedPreset)?.label || "Last 30 days"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 items-center gap-2 rounded-lg border bg-card px-3">
                        <span className="text-sm font-medium">{displayUrl}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Date Range Dropdown */}
                    <Select value={selectedPreset} onValueChange={handlePresetChange}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            {DATE_RANGE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchData}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && !data && (
                <div className="flex h-64 items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Dashboard Content */}
            {data && (
                <>
                    {/* Stat Cards */}
                    <GSCStatCards stats={data.stats} />

                    {/* Main Chart */}
                    <Card>
                        <CardContent className="pt-6">
                            <GSCComboChart data={data.analyticsData} />
                        </CardContent>
                    </Card>

                    {/* Bottom Panels */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <GSCReferrersPanel referrers={data.referrers} />
                        <GSCCountriesPanel geographicData={data.geographicData} />
                    </div>
                </>
            )}
        </div>
    )
}
