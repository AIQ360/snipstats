"use client"

import { forwardRef } from "react"
import { format } from "date-fns"
import { ChartPreviewResponsive } from "./chart-preview-responsive"
import { backgroundThemes, contentThemes } from "@/lib/theme-constants"

interface ScreenshotPreviewResponsiveProps {
  analyticsData: any[]
  config: {
    title: string
    description: string
    chartType: string
    backgroundTheme: string
    contentTheme: string
    dateRange?: { from: Date; to: Date }
    showLogo: boolean
    showVisitors: boolean
    showPageViews: boolean
    showBounceRate: boolean
    showSessionDuration: boolean
  }
}

export const ScreenshotPreviewResponsive = forwardRef<HTMLDivElement, ScreenshotPreviewResponsiveProps>(
  ({ analyticsData, config }, ref) => {
    // Stats calculation
    const totalVisitors = analyticsData.reduce((sum: number, item: any) => sum + (item.visitors || 0), 0)
    const totalPageViews = analyticsData.reduce((sum: number, item: any) => sum + (item.page_views || 0), 0)
    const avgBounceRate =
      analyticsData.length > 0
        ? analyticsData.reduce((sum: number, item: any) => sum + (item.bounce_rate || 0), 0) / analyticsData.length
        : 0
    const avgSessionDuration =
      analyticsData.length > 0
        ? analyticsData.reduce((sum: number, item: any) => sum + (item.avg_session_duration || 0), 0) /
          analyticsData.length
        : 0

    // Get background style
    const getBackgroundStyle = () => {
      const theme = backgroundThemes.find((t: any) => t.id === config.backgroundTheme)
      if (!theme) return { backgroundColor: "#3b82f6" }
      if (theme.type === "solid") {
        return { backgroundColor: theme.colors[0] }
      } else {
        return {
          background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
        }
      }
    }

    // Get content theme
    const getContentThemeStyles = () => {
      const theme = contentThemes.find((t: any) => t.id === config.contentTheme)
      if (!theme) return { backgroundColor: "#FFFFFF", color: "#000000" }
      return { backgroundColor: theme.backgroundColor, color: theme.textColor }
    }

    const getDateRangeText = () => {
      if (!config.dateRange?.from) return "All time"
      return `${format(config.dateRange.from, "MMM d")} - ${format(config.dateRange.to || new Date(), "MMM d")}`
    }

    const metricColors = {
      visitors: "#06b6d4",
      page_views: "#a78bfa",
      bounce_rate: "#fbbf24",
      avg_session_duration: "#f472b6",
    }

    const contentStyles = getContentThemeStyles()

    return (
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <div ref={ref} className="absolute inset-0 p-1 sm:p-2" style={getBackgroundStyle()}>
          <div className="rounded-lg shadow-lg overflow-hidden h-full flex flex-col" style={contentStyles}>
            <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between">
              {/* Header - Ultra compact */}
              <div>
                <h3 className="text-[10px] sm:text-xs font-bold line-clamp-1">{config.title}</h3>
                {config.description && (
                  <p className="text-[7px] sm:text-[8px] opacity-70 line-clamp-1">{config.description}</p>
                )}
              </div>

              {/* Metrics - One line, tiny text */}
              <div className="flex flex-wrap gap-2 text-[6px] sm:text-[7px] font-medium justify-between">
                {config.showVisitors && (
                  <div style={{ color: metricColors.visitors }}>
                    <span className="opacity-70">Visitors:</span> {(totalVisitors / 1000).toFixed(1)}K
                  </div>
                )}
                {config.showPageViews && (
                  <div style={{ color: metricColors.page_views }}>
                    <span className="opacity-70">Views:</span> {(totalPageViews / 1000).toFixed(1)}K
                  </div>
                )}
                {config.showSessionDuration && (
                  <div style={{ color: metricColors.avg_session_duration }}>
                    <span className="opacity-70">Avg:</span> {(avgSessionDuration / 60).toFixed(1)}m
                  </div>
                )}
                {config.showBounceRate && (
                  <div style={{ color: metricColors.bounce_rate }}>
                    <span className="opacity-70">Bounce:</span> {avgBounceRate.toFixed(0)}%
                  </div>
                )}
              </div>

              {/* Date range */}
              <div className="text-[6px] sm:text-[7px] opacity-60">{getDateRangeText()}</div>

              {/* Chart - Maximize height */}
              <div className="flex-1 min-h-0">
                <ChartPreviewResponsive
                  data={analyticsData}
                  chartType={config.chartType}
                  showVisitors={config.showVisitors}
                  showPageViews={config.showPageViews}
                  showBounceRate={config.showBounceRate}
                  showSessionDuration={config.showSessionDuration}
                  contentTheme={contentStyles}
                  compactMode={true}
                />
              </div>

              {/* Logo */}
              {config.showLogo && (
                <div className="text-[5px] sm:text-[6px] opacity-40 text-center">Generated with SnapStats</div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

ScreenshotPreviewResponsive.displayName = "ScreenshotPreviewResponsive"
