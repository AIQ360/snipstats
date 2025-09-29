"use client"

import type { InsightData } from "@/lib/insights-types"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface TrafficInsightCardProps {
  insight: InsightData
  className?: string
}

export function TrafficInsightCard({ insight, className = "" }: TrafficInsightCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Format date to be more readable
  const formattedDate = new Date(insight.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  // Determine if it's a spike or drop
  const isSpike = insight.spike_type === "Traffic Spike"

  // Create a summary text for copying
  const summaryText = `${isSpike ? "Traffic increased" : "Traffic decreased"} by ${insight.percentage_change}% on ${formattedDate}${
    insight.top_sources.length > 0 ? ` — mostly from ${insight.top_sources[0].source}` : ""
  }${insight.top_pages.length > 0 ? `, landing on ${insight.top_pages[0].page}` : ""}`

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        // You could add a toast notification here
        console.log("Copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  return (
    <Card
      className={`overflow-hidden border-[#EAEAEA] bg-white transition-all hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                isSpike
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
              }`}
            >
              {isSpike ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{insight.spike_type}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{formattedDate}</p>
            </div>
          </div>
          <div
            className={`text-sm font-semibold ${
              isSpike ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isSpike ? "+" : "-"}
            {insight.percentage_change}%
          </div>
        </div>

        <button
          className="mt-3 w-full text-left text-sm text-neutral-700 dark:text-neutral-300"
          onClick={() => setExpanded(!expanded)}
        >
          {summaryText}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {insight.top_sources.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Top Sources</h4>
                <div className="space-y-2">
                  {insight.top_sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="truncate text-neutral-700 dark:text-neutral-300">{source.source}</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {source.visitors} visitors
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insight.top_pages.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Top Pages</h4>
                <div className="space-y-2">
                  {insight.top_pages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="truncate text-neutral-700 dark:text-neutral-300">{page.page}</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {page.visitors} visitors
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" className="mt-2 w-full text-xs" onClick={handleCopy}>
              <ExternalLink className="mr-1 h-3 w-3" />
              Copy Insight
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
