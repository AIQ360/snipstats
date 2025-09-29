"use client"

import { useState } from "react"
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
import { Chart } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AnalyticsChartProps {
  title: string
  description?: string
  data: Record<string, string | number>[] // Properly typed data array
  dataKey: string
  xAxisKey?: string
  chartType?: "line" | "area" | "bar"
}

// Custom tooltip component that doesn't use shadcn/ui TooltipContent directly
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="space-y-1">
        <p className="text-sm font-medium">{format(new Date(label), "MMM dd, yyyy")}</p>
        {payload.map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span style={{ color: item.color }} className="mr-2">
              •
            </span>
            <span>{item.name}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsChart({
  title,
  description,
  data,
  dataKey,
  xAxisKey = "date",
  chartType = "line",
}: AnalyticsChartProps) {
  const [selectedChartType, setSelectedChartType] = useState(chartType)

  const formatXAxis = (tickItem: string) => {
    if (xAxisKey === "date") {
      try {
        return format(new Date(tickItem), "MMM dd")
      } catch {
        return tickItem
      }
    }
    return tickItem
  }

  // Ensure data is properly formatted for charts
  const formattedData = data.map((item) => {
    // Make a copy of the item to avoid mutating the original
    const newItem = { ...item }

    // Ensure numeric values are numbers, not strings
    if (typeof newItem[dataKey] === "string") {
      newItem[dataKey] = Number.parseFloat(newItem[dataKey] as string) || 0
    }

    return newItem
  })

  const renderChart = () => {
    const commonProps = {
      data: formattedData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    switch (selectedChartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`colorData-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#colorData-${dataKey})`}
            />
          </AreaChart>
        )
      case "bar":
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill="hsl(var(--primary))" />
          </BarChart>
        )
      case "line":
      default:
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              isAnimationActive={true}
            />
          </LineChart>
        )
    }
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="relative z-10">
            <Select
              value={selectedChartType}
              onValueChange={(value: "line" | "area" | "bar") => setSelectedChartType(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                className="z-50 fixed"
                align="end"
                style={{ zIndex: 100 }}
              >
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Chart
            config={{
              [dataKey]: {
                label: title,
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </Chart>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
