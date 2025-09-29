import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-[#EAEAEA] bg-white transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-neutral-400 dark:text-neutral-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{value}</div>
        {description && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>}
        {trend && (
          <div
            className={`mt-3 flex items-center text-xs ${trend.isPositive ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            <span className="ml-1 text-neutral-500 dark:text-neutral-400">from previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
