"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SocialShare } from "./social-share"
import { format } from "date-fns"
import { toPng } from "html-to-image"
import type { DateRange } from "react-day-picker"
import { Download, Save, Layout, Palette, Type, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { DateRangeFilter } from "./date-range-filter"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

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

// Simple collapsible section component to replace Accordion
interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 font-medium transition-all hover:underline"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen && <div className="pb-4 pt-0">{children}</div>}
    </div>
  )
}

interface ScreenshotEditorProps {
  websiteUrl: string
  dateRange?: DateRange
  analyticsData: any[]
}

// Background themes
const backgroundThemes = [
  { id: "gradient-blue", name: "Ocean", colors: ["#4B79A1", "#283E51"], type: "gradient" },
  { id: "gradient-purple", name: "Purple Haze", colors: ["#8E2DE2", "#4A00E0"], type: "gradient" },
  { id: "gradient-sunset", name: "Sunset", colors: ["#FF8C00", "#FF5733"], type: "gradient" },
  { id: "gradient-emerald", name: "Emerald", colors: ["#43C6AC", "#191654"], type: "gradient" },
  { id: "gradient-cosmic", name: "Cosmic", colors: ["#FF00CC", "#333399"], type: "gradient" },
  { id: "gradient-mojito", name: "Mojito", colors: ["#1D976C", "#93F9B9"], type: "gradient" },
  { id: "gradient-cherry", name: "Cherry", colors: ["#EB3349", "#F45C43"], type: "gradient" },
  { id: "gradient-stellar", name: "Stellar", colors: ["#7474BF", "#348AC7"], type: "gradient" },
  { id: "gradient-warm", name: "Warm Flame", colors: ["#FF9A9E", "#FAD0C4"], type: "gradient" },
  { id: "gradient-dusk", name: "Dusk", colors: ["#2C3E50", "#4CA1AF"], type: "gradient" },
  { id: "gradient-midnight", name: "Midnight", colors: ["#232526", "#414345"], type: "gradient" },
  { id: "gradient-juicy", name: "Juicy Peach", colors: ["#FF8008", "#FFC837"], type: "gradient" },
  { id: "solid-white", name: "White", colors: ["#FFFFFF"], type: "solid" },
  { id: "solid-light", name: "Light Gray", colors: ["#F8F9FA"], type: "solid" },
  { id: "solid-blue", name: "Blue", colors: ["#0070F3"], type: "solid" },
  { id: "solid-green", name: "Green", colors: ["#10B981"], type: "solid" },
  { id: "solid-red", name: "Red", colors: ["#EF4444"], type: "solid" },
  { id: "solid-yellow", name: "Yellow", colors: ["#F59E0B"], type: "solid" },
  { id: "solid-purple", name: "Purple", colors: ["#8B5CF6"], type: "solid" },
  { id: "solid-pink", name: "Pink", colors: ["#EC4899"], type: "solid" },
  { id: "solid-indigo", name: "Indigo", colors: ["#6366F1"], type: "solid" },
  { id: "solid-teal", name: "Teal", colors: ["#14B8A6"], type: "solid" },
  { id: "solid-dark", name: "Dark", colors: ["#1A1A2E"], type: "solid" },
  { id: "solid-black", name: "Black", colors: ["#000000"], type: "solid" },
]

// Content themes
const contentThemes = [
  { id: "content-light", name: "Light", backgroundColor: "#FFFFFF", textColor: "#000000" },
  { id: "content-dark", name: "Dark", backgroundColor: "#1A1A2E", textColor: "#FFFFFF" },
  { id: "content-blue", name: "Blue", backgroundColor: "#EFF6FF", textColor: "#1E3A8A" },
  { id: "content-green", name: "Green", backgroundColor: "#ECFDF5", textColor: "#065F46" },
  { id: "content-red", name: "Red", backgroundColor: "#FEF2F2", textColor: "#991B1B" },
  { id: "content-yellow", name: "Yellow", backgroundColor: "#FFFBEB", textColor: "#92400E" },
  { id: "content-purple", name: "Purple", backgroundColor: "#F5F3FF", textColor: "#5B21B6" },
  { id: "content-pink", name: "Pink", backgroundColor: "#FDF2F8", textColor: "#9D174D" },
  { id: "content-gray", name: "Gray", backgroundColor: "#F9FAFB", textColor: "#111827" },
]

// Update the layout templates array to remove the unnecessary layouts
const layoutTemplates = [
  { id: "standard", name: "Standard", description: "Stats with chart" },
  { id: "minimal", name: "Minimal", description: "Single metric with chart" },
  { id: "custom", name: "Custom", description: "Build your own layout" },
]

// Update the chart types array to remove pie chart
const chartTypes = [
  { id: "area", name: "Area Chart", description: "Show volume over time" },
  { id: "line", name: "Line Chart", description: "Visualize trends over time" },
  { id: "bar", name: "Bar Chart", description: "Compare values across categories" },
]

// Add a new component type for the combined metrics view
const componentTypes = [
  { id: "metrics-header", name: "Metrics Header", type: "header" },
  { id: "multi-metric-chart", name: "Multi-Metric Chart", type: "chart" },
  { id: "title", name: "Title", type: "text" },
  { id: "description", name: "Description", type: "text" },
]

interface CustomComponent {
  id: string
  type: string
  componentId: string
  props: Record<string, any>
}

export function ScreenshotEditor({ websiteUrl, dateRange, analyticsData }: ScreenshotEditorProps) {
  // Theme state
  const [selectedBackgroundTheme, setSelectedBackgroundTheme] = useState("gradient-blue")
  const [selectedContentTheme, setSelectedContentTheme] = useState("content-light")
  const [selectedLayout, setSelectedLayout] = useState("standard")
  const [selectedChartType, setSelectedChartType] = useState("line")

  // Custom background state
  const [customBackgroundType, setCustomBackgroundType] = useState<"solid" | "gradient">("solid")
  const [customSolidColor, setCustomSolidColor] = useState("#3B82F6")
  const [customGradientColors, setCustomGradientColors] = useState(["#4B79A1", "#283E51"])
  const [customGradientDirection, setCustomGradientDirection] = useState(135)
  const [useCustomBackground, setUseCustomBackground] = useState(false)

  // Custom layout state
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([])

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [showLogo, setShowLogo] = useState(true)
  const [title, setTitle] = useState(websiteUrl || "Website Analytics")
  const [description, setDescription] = useState("")
  const editorRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Chart display state
  const [showVisitors, setShowVisitors] = useState(true)
  const [showPageViews, setShowPageViews] = useState(true)
  const [showBounceRate, setShowBounceRate] = useState(true)
  const [showSessionDuration, setShowSessionDuration] = useState(true)

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Stats calculation
  const totalVisitors = analyticsData.reduce((sum, item) => sum + item.visitors, 0)
  const totalPageViews = analyticsData.reduce((sum, item) => sum + item.page_views, 0)
  const avgBounceRate =
    analyticsData.length > 0 ? analyticsData.reduce((sum, item) => sum + item.bounce_rate, 0) / analyticsData.length : 0
  const avgSessionDuration =
    analyticsData.length > 0
      ? analyticsData.reduce((sum, item) => sum + item.avg_session_duration, 0) / analyticsData.length
      : 0

  // Update the addComponent function to handle the combined metrics component
  const addComponent = (componentId: string) => {
    const componentType = componentTypes.find((c) => c.id === componentId)
    if (!componentType) return

    const newComponent: CustomComponent = {
      id: uuidv4(),
      type: componentType.type,
      componentId,
      props: {},
    }

    // Set default props based on component type
    if (componentType.type === "header") {
      newComponent.props = {
        visitors: totalVisitors,
        pageViews: totalPageViews,
        bounceRate: avgBounceRate,
        sessionDuration: avgSessionDuration,
      }
    } else if (componentType.type === "chart") {
      newComponent.props = {
        title: "Key Metrics Over Time",
        chartType: selectedChartType,
      }
    } else if (componentType.type === "text") {
      newComponent.props = {
        content: componentId === "title" ? title : "Add your description here",
      }
    }

    setCustomComponents([...customComponents, newComponent])
  }

  // Remove a component from custom layout
  const removeComponent = (id: string) => {
    setCustomComponents(customComponents.filter((c) => c.id !== id))
  }

  // Handle custom background changes
  const handleCustomSolidColorChange = (color: string) => {
    setCustomSolidColor(color)
    setUseCustomBackground(true)
  }

  const handleCustomGradientChange = (colors: string[], direction: number) => {
    setCustomGradientColors(colors)
    setCustomGradientDirection(direction)
    setUseCustomBackground(true)
  }

  // Generate screenshot for download
  const generateScreenshot = async (): Promise<string> => {
    if (!previewRef.current) {
      throw new Error("Preview element not found")
    }

    setIsLoading(true)

    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 0.95,
        backgroundColor: null,
        canvasWidth: previewRef.current.offsetWidth * 2,
        canvasHeight: previewRef.current.offsetHeight * 2,
        pixelRatio: 2,
      })

      return dataUrl
    } catch (error) {
      console.error("Error capturing screenshot:", error)
      throw new Error("Failed to capture screenshot")
    } finally {
      setIsLoading(false)
    }
  }

  // Download screenshot
  const downloadScreenshot = async () => {
    try {
      const dataUrl = await generateScreenshot()

      // Create download link
      const link = document.createElement("a")
      link.download = `${websiteUrl.replace(/[^a-z0-9]/gi, "-")}-${format(new Date(), "yyyy-MM-dd")}.png`
      link.href = dataUrl
      link.click()

      toast.success("Screenshot downloaded successfully")
    } catch (error) {
      toast.error("Failed to download screenshot")
    }
  }

  // Handle social sharing
  const handleSocialShare = async (): Promise<string> => {
    try {
      // Generate the image
      const imageUrl = await generateScreenshot()
      return imageUrl
    } catch (err) {
      console.error("Error sharing:", err)
      throw new Error("Failed to share screenshot")
    }
  }

  // Get date range display text
  const getDateRangeText = () => {
    if (!dateRange?.from) return "All time"
    return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to || new Date(), "MMM d")}`
  }

  // Format session duration
  const formatSessionDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}.${remainingSeconds} min`
  }

  // Get background style based on theme
  const getBackgroundStyle = () => {
    if (useCustomBackground) {
      if (customBackgroundType === "solid") {
        return { backgroundColor: customSolidColor }
      } else {
        return {
          background: `linear-gradient(${customGradientDirection}deg, ${customGradientColors[0]}, ${customGradientColors[1]})`,
        }
      }
    }

    const theme = backgroundThemes.find((t) => t.id === selectedBackgroundTheme)
    if (!theme) return { backgroundColor: "#3b82f6" }

    if (theme.type === "solid") {
      return { backgroundColor: theme.colors[0] }
    } else {
      return {
        background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
      }
    }
  }

  // Get content theme styles
  const getContentThemeStyles = () => {
    const theme = contentThemes.find((t) => t.id === selectedContentTheme)
    if (!theme) return { backgroundColor: "#FFFFFF", color: "#000000" }
    return { backgroundColor: theme.backgroundColor, color: theme.textColor }
  }

  // Define colors for each metric
  const metricColors = {
    visitors: "#06b6d4", // cyan-500
    page_views: "#a78bfa", // violet-400
    bounce_rate: "#fbbf24", // amber-400
    avg_session_duration: "#f472b6", // pink-400
  }

  // Render metrics header
  const renderMetricsHeader = () => {
    const contentStyles = getContentThemeStyles()

    return (
      <div className="flex flex-wrap gap-3 mb-3 justify-between">
        <div className="text-sm font-medium" style={{ color: metricColors.visitors }}>
          Visitors: {totalVisitors.toLocaleString()}
        </div>
        <div className="text-sm font-medium" style={{ color: metricColors.page_views }}>
          Page Views: {totalPageViews.toLocaleString()}
        </div>
        <div className="text-sm font-medium" style={{ color: metricColors.avg_session_duration }}>
          Avg Session: {formatSessionDuration(avgSessionDuration)}
        </div>
        <div className="text-sm font-medium" style={{ color: metricColors.bounce_rate }}>
          Bounce Rate: {avgBounceRate.toFixed(1)}%
        </div>
      </div>
    )
  }

  // Render multi-metric chart
  const renderMultiMetricChart = () => {
    const contentStyles = getContentThemeStyles()

    // Format the data for the chart
    const formattedData = analyticsData.map((item) => ({
      ...item,
      date: new Date(item.date).toISOString().split("T")[0], // Format date consistently
    }))

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (!active || !payload || payload.length === 0) {
        return null
      }

      return (
        <div
          className="rounded-lg border p-2 shadow-md"
          style={{
            backgroundColor: contentStyles.backgroundColor,
            color: contentStyles.color,
            borderColor: "rgba(0,0,0,0.1)",
          }}
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">{format(new Date(label), "MMM dd")}</p>
            {payload.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: item.color }} className="mr-1">
                  •
                </span>
                <span>{item.name}</span>
                <span className="font-medium">
                  {item.dataKey === "bounce_rate" ? `${item.value.toFixed(1)}%` : item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Determine which metrics to show
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

    // Render the chart based on the selected type
    const renderChart = () => {
      const commonProps = {
        data: formattedData,
        margin: { top: 10, right: 10, left: 0, bottom: 0 },
      }

      switch (selectedChartType) {
        case "area":
          return (
            <AreaChart {...commonProps}>
              <defs>
                {metrics.map((metric) => (
                  <linearGradient key={metric.key} id={`color-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={{ fontSize: 12, fill: contentStyles.color }}
                tickFormatter={(value) => format(new Date(value), "MMM d")}
              />
              <YAxis axisLine={false} tickLine={false} dx={-10} tick={{ fontSize: 12, fill: contentStyles.color }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
              <Tooltip content={<CustomTooltip />} />
              {metrics.map((metric) => (
                <Area
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.name}
                  stroke={metric.color}
                  fill={`url(#color-${metric.key})`}
                  strokeWidth={2}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          )
        case "bar":
          return (
            <BarChart {...commonProps}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={{ fontSize: 12, fill: contentStyles.color }}
                tickFormatter={(value) => format(new Date(value), "MMM d")}
              />
              <YAxis axisLine={false} tickLine={false} dx={-10} tick={{ fontSize: 12, fill: contentStyles.color }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
              <Tooltip content={<CustomTooltip />} />
              {metrics.map((metric) => (
                <Bar
                  key={metric.key}
                  dataKey={metric.key}
                  name={metric.name}
                  fill={metric.color}
                  radius={[4, 4, 0, 0]}
                  barSize={6}
                />
              ))}
            </BarChart>
          )
        case "line":
        default:
          return (
            <LineChart {...commonProps}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={{ fontSize: 12, fill: contentStyles.color }}
                tickFormatter={(value) => format(new Date(value), "MMM d")}
              />
              <YAxis axisLine={false} tickLine={false} dx={-10} tick={{ fontSize: 12, fill: contentStyles.color }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
              <Tooltip content={<CustomTooltip />} />
              {metrics.map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.name}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: metric.color }}
                  activeDot={{ r: 5, fill: metric.color }}
                />
              ))}
            </LineChart>
          )
      }
    }

    return (
      <div style={{ color: contentStyles.color }}>
        <div style={{ height: "300px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  // Update the renderContent function to include the combined metrics view for standard and minimal layouts
  const renderContent = () => {
    const contentStyles = getContentThemeStyles()

    switch (selectedLayout) {
      case "standard":
        return (
          <div className="space-y-4">
            {renderMetricsHeader()}
            <div className="mt-2 text-sm opacity-70" style={{ color: contentStyles.color }}>
              {getDateRangeText()}
            </div>
            {renderMultiMetricChart()}
          </div>
        )
      case "minimal":
        return (
          <div className="space-y-4" style={contentStyles}>
            <div className="text-center">
              <div className="text-5xl font-bold">{totalVisitors}</div>
              <div className="text-sm opacity-70 mt-1">Total Visitors</div>
            </div>
            <div className="mt-2 text-center text-sm opacity-70">{getDateRangeText()}</div>
            {renderMultiMetricChart()}
          </div>
        )
      case "custom":
        return (
          <div className="space-y-4">
            {customComponents.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-lg" style={contentStyles}>
                <p className="opacity-70">Add components from the sidebar to create your custom layout</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {customComponents.map((component) => renderCustomComponent(component))}
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // Update the renderCustomComponent function to handle the combined metrics component
  const renderCustomComponent = (component: CustomComponent) => {
    const contentStyles = getContentThemeStyles()

    if (component.type === "header") {
      return (
        <div key={component.id} className="relative group">
          {renderMetricsHeader()}
          <button
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeComponent(component.id)}
          >
            ×
          </button>
        </div>
      )
    } else if (component.type === "chart") {
      return (
        <div key={component.id} className="relative group">
          {renderMultiMetricChart()}
          <button
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeComponent(component.id)}
          >
            ×
          </button>
        </div>
      )
    } else if (component.type === "text") {
      return (
        <div key={component.id} className="relative group" style={{ color: contentStyles.color }}>
          {component.componentId === "title" ? (
            <h3 className="text-xl font-bold">{component.props.content}</h3>
          ) : (
            <p className="opacity-70">{component.props.content}</p>
          )}
          <button
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeComponent(component.id)}
          >
            ×
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Controls */}
      <div className="md:w-80 bg-card rounded-lg border p-4 space-y-4">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="layout" className="flex items-center gap-1">
              <Layout className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="background" className="flex items-center gap-1">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Background</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1">
              <Type className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
          </TabsList>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-4">
              <CollapsibleSection title="Layout Template" defaultOpen={true}>
                <div className="grid grid-cols-2 gap-2">
                  {layoutTemplates.map((template) => (
                    <button
                      key={template.id}
                      className={cn(
                        "flex flex-col items-start rounded-md border p-3 transition-all hover:border-primary",
                        selectedLayout === template.id ? "border-primary bg-primary/5" : "border-border",
                      )}
                      onClick={() => setSelectedLayout(template.id)}
                    >
                      <span className="font-medium text-sm">{template.name}</span>
                      <span className="text-xs text-muted-foreground">{template.description}</span>
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              {selectedLayout === "custom" && (
                <CollapsibleSection title="Add Components">
                  <div className="grid grid-cols-2 gap-2">
                    {componentTypes.map((component) => (
                      <button
                        key={component.id}
                        className="flex flex-col items-start rounded-md border p-2 transition-all hover:border-primary"
                        onClick={() => addComponent(component.id)}
                      >
                        <span className="font-medium text-sm">{component.name}</span>
                        <span className="text-xs text-muted-foreground">{component.type}</span>
                      </button>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              <CollapsibleSection title="Chart Type">
                <div className="grid grid-cols-2 gap-2">
                  {chartTypes.map((chart) => (
                    <button
                      key={chart.id}
                      className={cn(
                        "flex flex-col items-start rounded-md border p-3 transition-all hover:border-primary",
                        selectedChartType === chart.id ? "border-primary bg-primary/5" : "border-border",
                      )}
                      onClick={() => setSelectedChartType(chart.id)}
                    >
                      <span className="font-medium text-sm">{chart.name}</span>
                      <span className="text-xs text-muted-foreground">{chart.description}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t mt-4">
                  <h4 className="text-sm font-medium mb-2">Metrics to Display</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="control-visitors"
                        checked={showVisitors}
                        onCheckedChange={setShowVisitors}
                        style={{ backgroundColor: showVisitors ? metricColors.visitors : undefined }}
                      />
                      <Label htmlFor="control-visitors" style={{ color: metricColors.visitors }}>
                        Visitors
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="control-pageviews"
                        checked={showPageViews}
                        onCheckedChange={setShowPageViews}
                        style={{ backgroundColor: showPageViews ? metricColors.page_views : undefined }}
                      />
                      <Label htmlFor="control-pageviews" style={{ color: metricColors.page_views }}>
                        Page Views
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="control-bouncerate"
                        checked={showBounceRate}
                        onCheckedChange={setShowBounceRate}
                        style={{ backgroundColor: showBounceRate ? metricColors.bounce_rate : undefined }}
                      />
                      <Label htmlFor="control-bouncerate" style={{ color: metricColors.bounce_rate }}>
                        Bounce Rate
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="control-session"
                        checked={showSessionDuration}
                        onCheckedChange={setShowSessionDuration}
                        style={{
                          backgroundColor: showSessionDuration ? metricColors.avg_session_duration : undefined,
                        }}
                      />
                      <Label htmlFor="control-session" style={{ color: metricColors.avg_session_duration }}>
                        Avg Session
                      </Label>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Date Range">
                <DateRangeFilter
                  initialRange={{
                    from: dateRange?.from || new Date(),
                    to: dateRange?.to || new Date(),
                  }}
                />
              </CollapsibleSection>
            </div>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-4">
            <div className="space-y-4">
              <CollapsibleSection title="Background Presets" defaultOpen={true}>
                <div className="grid grid-cols-4 gap-2">
                  {backgroundThemes.map((theme) => {
                    const style =
                      theme.type === "solid"
                        ? { backgroundColor: theme.colors[0] }
                        : { background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})` }

                    return (
                      <button
                        key={theme.id}
                        className={cn(
                          "h-10 rounded-md border transition-all",
                          selectedBackgroundTheme === theme.id && !useCustomBackground
                            ? "ring-2 ring-primary ring-offset-2"
                            : "",
                          theme.id === "solid-white" || theme.id === "solid-light" ? "border border-gray-200" : "",
                        )}
                        style={style}
                        onClick={() => {
                          setSelectedBackgroundTheme(theme.id)
                          setUseCustomBackground(false)
                        }}
                        aria-label={theme.name}
                        title={theme.name}
                      />
                    )
                  })}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Custom Background">
                <div className="flex items-center justify-between">
                  <Label>Background Type</Label>
                  <div className="flex items-center space-x-2">
                    <button
                      className={cn(
                        "px-3 py-1 text-sm rounded-md",
                        customBackgroundType === "solid"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                      onClick={() => setCustomBackgroundType("solid")}
                    >
                      Solid
                    </button>
                    <button
                      className={cn(
                        "px-3 py-1 text-sm rounded-md",
                        customBackgroundType === "gradient"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                      onClick={() => setCustomBackgroundType("gradient")}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {customBackgroundType === "solid" ? (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="custom-color">Background Color</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="custom-color"
                        type="color"
                        value={customSolidColor}
                        onChange={(e) => handleCustomSolidColorChange(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <span className="text-sm font-mono">{customSolidColor}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Gradient Colors</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={customGradientColors[0]}
                          onChange={(e) =>
                            handleCustomGradientChange(
                              [e.target.value, customGradientColors[1]],
                              customGradientDirection,
                            )
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="color"
                          value={customGradientColors[1]}
                          onChange={(e) =>
                            handleCustomGradientChange(
                              [customGradientColors[0], e.target.value],
                              customGradientDirection,
                            )
                          }
                          className="w-16 h-10 p-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Direction: {customGradientDirection}°</Label>
                      </div>
                      <Slider
                        value={[customGradientDirection]}
                        min={0}
                        max={360}
                        step={1}
                        onValueChange={(value) => handleCustomGradientChange(customGradientColors, value[0])}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="h-20 w-full rounded-md border" style={getBackgroundStyle()} />
                </div>
              </CollapsibleSection>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <CollapsibleSection title="Content Theme" defaultOpen={true}>
                <div className="grid grid-cols-3 gap-2">
                  {contentThemes.map((theme) => (
                    <button
                      key={theme.id}
                      className={cn(
                        "h-16 rounded-md overflow-hidden border-2 transition-all",
                        selectedContentTheme === theme.id ? "border-primary" : "border-transparent",
                        theme.id === "content-light" ? "border border-gray-200" : "",
                      )}
                      style={{ backgroundColor: theme.backgroundColor }}
                      onClick={() => setSelectedContentTheme(theme.id)}
                      title={theme.name}
                    >
                      <div className="h-4 w-16 mx-auto rounded" style={{ backgroundColor: theme.textColor }} />
                      <div className="text-xs mt-1" style={{ color: theme.textColor }}>
                        {theme.name}
                      </div>
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Text Content">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Label htmlFor="show-logo" className="cursor-pointer">
                    Show SnapStats Logo
                  </Label>
                  <Switch id="show-logo" checked={showLogo} onCheckedChange={setShowLogo} />
                </div>
              </CollapsibleSection>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <div className="flex flex-col gap-2">
            <Button onClick={downloadScreenshot} className="flex items-center gap-2" disabled={isLoading}>
              <Download size={16} />
              {isLoading ? "Processing..." : "Download PNG"}
            </Button>
            <div className="flex gap-2">
              <SocialShare onShare={handleSocialShare} isLoading={isLoading} className="flex-1" />
              <Button variant="outline" className="flex items-center gap-2 flex-1">
                <Save size={16} />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div ref={editorRef} className="flex-1 rounded-lg overflow-hidden border">
        <div ref={previewRef} className="p-6 min-h-[500px] max-w-full overflow-auto" style={getBackgroundStyle()}>
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl mx-auto"
            style={getContentThemeStyles()}
          >
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold">{title}</h3>
                {description && <p className="opacity-70 mt-1">{description}</p>}
              </div>

              {renderContent()}

              {showLogo && <div className="text-xs opacity-50 text-center mt-4 pb-2">Generated with SnapStats</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
