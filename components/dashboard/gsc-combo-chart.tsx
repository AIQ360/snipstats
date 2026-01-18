"use client"

import { useMemo } from "react"
import {
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
} from "recharts"

interface AnalyticsDataPoint {
    date: string
    visitors: number
    page_views: number
}

interface GSCComboChartProps {
    data: AnalyticsDataPoint[]
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" })
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null

    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
            <p className="mb-2 font-medium">{formatDate(label)}</p>
            <div className="space-y-1">
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-medium">{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function GSCComboChart({ data }: GSCComboChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            date: item.date,
            visitors: item.visitors || 0,
            pageViews: item.page_views || 0,
        }))
    }, [data])

    const maxVisitors = Math.max(...chartData.map((d) => d.visitors), 1)
    const maxPageViews = Math.max(...chartData.map((d) => d.pageViews), 1)

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                            value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                        }
                        domain={[0, Math.ceil(maxVisitors * 1.1)]}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                            value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                        }
                        domain={[0, Math.ceil(maxPageViews * 1.1)]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        yAxisId="left"
                        dataKey="visitors"
                        name="Visitors"
                        fill="#f4a58a"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="pageViews"
                        name="Page Views"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: "#60a5fa" }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
