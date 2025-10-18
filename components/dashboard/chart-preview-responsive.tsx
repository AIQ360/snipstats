"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartPreviewResponsiveProps {
  data: any[]
  chartType: string
  showVisitors: boolean
  showPageViews: boolean
  showBounceRate: boolean
  showSessionDuration: boolean
  contentTheme: { backgroundColor: string; color: string }
  compactMode?: boolean
}

export function ChartPreviewResponsive({
  data,
  chartType,
  showVisitors,
  showPageViews,
  showBounceRate,
  showSessionDuration,
  contentTheme,
  compactMode = true,
}: ChartPreviewResponsiveProps) {
  const isMobile = useMemo(() => {
    return typeof window !== "undefined" && window.innerWidth < 768
  }, [])

  const metricColors = {
    visitors: "#06b6d4",
    page_views: "#a78bfa",
    bounce_rate: "#fbbf24",
    avg_session_duration: "#f472b6",
  }

  // Format data - reduce points on mobile
  const formattedData = useMemo(() => {
    let processedData = [...data]

    if (compactMode && isMobile && data.length > 14) {
      const n = Math.ceil(data.length / 14)
      processedData = data.filter((_: any, i: number) => i % n === 0)
    }

    return processedData.map((item: any) => ({
      ...item,
      date: format(new Date(item.date), "MMM d"),
    }))
  }, [data, compactMode, isMobile])

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div
        className="rounded border p-1 shadow-md text-[7px] sm:text-[9px]"
        style={{
          backgroundColor: contentTheme.backgroundColor,
          color: contentTheme.color,
          borderColor: "rgba(0,0,0,0.1)",
        }}
      >
        <div className="space-y-0.5">
          {payload.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-1">
              <span style={{ color: item.color }}>•</span>
              <span>{item.name}:</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const metrics = []
  if (showVisitors) metrics.push({ key: "visitors", name: "Visitors", color: metricColors.visitors })
  if (showPageViews) metrics.push({ key: "page_views", name: "Page Views", color: metricColors.page_views })
  if (showBounceRate) metrics.push({ key: "bounce_rate", name: "Bounce Rate", color: metricColors.bounce_rate })
  if (showSessionDuration)
    metrics.push({
      key: "avg_session_duration",
      name: "Avg Session",
      color: metricColors.avg_session_duration,
    })

  const getNiceNumber = (value: number) => {
    if (value <= 10) return 10
    if (value <= 50) return 50
    if (value <= 100) return 100
    if (value <= 200) return 200
    if (value <= 500) return 500
    if (value <= 1000) return 1000
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
    const normalized = value / magnitude
    if (normalized <= 2) return 2 * magnitude
    if (normalized <= 5) return 5 * magnitude
    return 10 * magnitude
  }

  const getYAxisDomain = () => {
    if (showVisitors && data.length > 0) {
      const maxVisitors = Math.max(...data.map((item: any) => item.visitors || 0))
      return [0, getNiceNumber(maxVisitors * 1.2)]
    }
    if (showPageViews && data.length > 0) {
      const maxPageViews = Math.max(...data.map((item: any) => item.page_views || 0))
      return [0, getNiceNumber(maxPageViews * 1.2)]
    }
    return undefined
  }

  const margins =
    compactMode || isMobile ? { top: 0, right: 0, left: 0, bottom: 0 } : { top: 10, right: 10, left: 0, bottom: 10 }

  const commonProps = {
    data: formattedData,
    margin: margins,
  }

  const xAxisProps = {
    dataKey: "date",
    axisLine: true,
    tickLine: false,
    tick: { fontSize: isMobile ? 6 : 8, fill: contentTheme.color },
    tickCount: isMobile ? 4 : 6,
    height: isMobile ? 8 : 12,
  }

  const yAxisProps = {
    axisLine: true,
    tickLine: false,
    tick: { fontSize: isMobile ? 6 : 8, fill: contentTheme.color },
    width: isMobile ? 20 : 30,
    tickCount: isMobile ? 4 : 5,
    domain: getYAxisDomain(),
    tickFormatter: (value: number) => Math.round(value).toString(),
  }

  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map((metric) => (
              <Area
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.name}
                stroke={metric.color}
                fill={metric.color}
                fillOpacity={0.3}
                strokeWidth={isMobile ? 1 : 1.5}
                dot={false}
              />
            ))}
          </AreaChart>
        )
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map((metric) => (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                name={metric.name}
                fill={metric.color}
                radius={[1, 1, 0, 0]}
                barSize={isMobile ? 1 : 2}
              />
            ))}
          </BarChart>
        )
      case "line":
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.name}
                stroke={metric.color}
                strokeWidth={isMobile ? 1 : 1.5}
                dot={false}
              />
            ))}
          </LineChart>
        )
    }
  }

  return (
    <div style={{ color: contentTheme.color }} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}
