"use client"

import { TrendingUp, TrendingDown, Users, Clock, Percent } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    change?: number
    icon: React.ReactNode
    suffix?: string
}

function StatCard({ title, value, change, icon, suffix }: StatCardProps) {
    const isPositive = change !== undefined && change >= 0
    const changeColor = isPositive ? "text-emerald-600" : "text-red-500"
    const TrendIcon = isPositive ? TrendingUp : TrendingDown

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {icon}
                <span>{title}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">
                    {value}
                    {suffix && <span className="text-lg font-normal">{suffix}</span>}
                </span>
                {change !== undefined && (
                    <span className={`flex items-center gap-0.5 text-sm font-medium ${changeColor}`}>
                        <TrendIcon className="h-3.5 w-3.5" />
                        {Math.abs(change).toFixed(1)}%
                    </span>
                )}
            </div>
        </div>
    )
}

interface GSCStatCardsProps {
    stats: {
        totalVisitors: number
        totalPageViews: number
        avgBounceRate: number
        avgSessionDuration: number
    }
    previousStats?: {
        totalVisitors: number
        totalPageViews: number
        avgBounceRate: number
        avgSessionDuration: number
    }
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}m ${secs}s`
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + "k"
    }
    return num.toLocaleString()
}

function calculateChange(current: number, previous: number): number | undefined {
    if (!previous || previous === 0) return undefined
    return ((current - previous) / previous) * 100
}

export function GSCStatCards({ stats, previousStats }: GSCStatCardsProps) {
    const visitorChange = previousStats
        ? calculateChange(stats.totalVisitors, previousStats.totalVisitors)
        : undefined
    const bounceChange = previousStats
        ? calculateChange(stats.avgBounceRate, previousStats.avgBounceRate)
        : undefined
    const sessionChange = previousStats
        ? calculateChange(stats.avgSessionDuration, previousStats.avgSessionDuration)
        : undefined

    return (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
            <StatCard
                title="Unique Visitors"
                value={formatNumber(stats.totalVisitors)}
                change={visitorChange}
                icon={<Users className="h-4 w-4" />}
            />
            <StatCard
                title="Page Views"
                value={formatNumber(stats.totalPageViews)}
                icon={<Users className="h-4 w-4" />}
            />
            <StatCard
                title="Bounce Rate"
                value={stats.avgBounceRate.toFixed(1)}
                suffix="%"
                change={bounceChange}
                icon={<Percent className="h-4 w-4" />}
            />
            <StatCard
                title="Session Time"
                value={formatDuration(stats.avgSessionDuration)}
                change={sessionChange}
                icon={<Clock className="h-4 w-4" />}
            />
        </div>
    )
}
