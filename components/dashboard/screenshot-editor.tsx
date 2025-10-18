"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ScreenshotPreviewResponsive } from "./screenshot-preview-responsive"
import { backgroundThemes, contentThemes } from "@/lib/theme-constants"

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
  analyticsData?: any[]
}

const layoutTemplates = [
  { id: "standard", name: "Standard", description: "Stats with chart" },
  { id: "minimal", name: "Minimal", description: "Single metric" },
]

const chartTypes = [
  { id: "area", name: "Area Chart", description: "Show volume" },
  { id: "line", name: "Line Chart", description: "Show trends" },
  { id: "bar", name: "Bar Chart", description: "Compare values" },
]

export function ScreenshotEditor({ websiteUrl, dateRange, analyticsData = [] }: ScreenshotEditorProps) {
  const [selectedBackgroundTheme, setSelectedBackgroundTheme] = useState("gradient-blue")
  const [selectedContentTheme, setSelectedContentTheme] = useState("content-light")
  const [selectedChartType, setSelectedChartType] = useState("line")
  const [customBackgroundType, setCustomBackgroundType] = useState<"solid" | "gradient">("solid")
  const [customSolidColor, setCustomSolidColor] = useState("#3B82F6")
  const [customGradientColors, setCustomGradientColors] = useState(["#4B79A1", "#283E51"])
  const [customGradientDirection, setCustomGradientDirection] = useState(135)
  const [useCustomBackground, setUseCustomBackground] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLogo, setShowLogo] = useState(true)
  const [title, setTitle] = useState(websiteUrl || "Website Analytics")
  const [description, setDescription] = useState("")
  const [showVisitors, setShowVisitors] = useState(true)
  const [showPageViews, setShowPageViews] = useState(true)
  const [showBounceRate, setShowBounceRate] = useState(true)
  const [showSessionDuration, setShowSessionDuration] = useState(true)

  const previewRef = useRef<HTMLDivElement>(null)

  const safeData = Array.isArray(analyticsData) ? analyticsData.filter((d) => d && typeof d === "object") : []

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

  const downloadScreenshot = async () => {
    try {
      const dataUrl = await generateScreenshot()
      const link = document.createElement("a")
      link.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.png`
      link.href = dataUrl
      link.click()
      toast.success("Screenshot downloaded successfully")
    } catch (error) {
      toast.error("Failed to download screenshot")
    }
  }

  const handleSocialShare = async (): Promise<string> => {
    try {
      const imageUrl = await generateScreenshot()
      return imageUrl
    } catch (err) {
      console.error("Error sharing:", err)
      throw new Error("Failed to share screenshot")
    }
  }

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

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Controls */}
      <div className="md:w-80 bg-card rounded-lg border p-4 space-y-4 h-fit">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="layout" className="flex items-center gap-1">
              <Layout className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="background" className="flex items-center gap-1">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">BG</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1">
              <Type className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4">
            <CollapsibleSection title="Chart Type" defaultOpen={true}>
              <div className="grid grid-cols-1 gap-2">
                {chartTypes.map((chart) => (
                  <button
                    key={chart.id}
                    className={cn(
                      "flex flex-col items-start rounded-md border p-3 transition-all hover:border-primary text-left",
                      selectedChartType === chart.id ? "border-primary bg-primary/5" : "border-border",
                    )}
                    onClick={() => setSelectedChartType(chart.id)}
                  >
                    <span className="font-medium text-sm">{chart.name}</span>
                    <span className="text-xs text-muted-foreground">{chart.description}</span>
                  </button>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Metrics">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Visitors</Label>
                  <Switch checked={showVisitors} onCheckedChange={setShowVisitors} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Page Views</Label>
                  <Switch checked={showPageViews} onCheckedChange={setShowPageViews} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Bounce Rate</Label>
                  <Switch checked={showBounceRate} onCheckedChange={setShowBounceRate} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Avg Session</Label>
                  <Switch checked={showSessionDuration} onCheckedChange={setShowSessionDuration} />
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <CollapsibleSection title="Background" defaultOpen={true}>
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
                      )}
                      style={style}
                      onClick={() => {
                        setSelectedBackgroundTheme(theme.id)
                        setUseCustomBackground(false)
                      }}
                      title={theme.name}
                    />
                  )
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Custom BG">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    className={cn(
                      "flex-1 px-3 py-1 text-sm rounded-md",
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
                      "flex-1 px-3 py-1 text-sm rounded-md",
                      customBackgroundType === "gradient"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                    onClick={() => setCustomBackgroundType("gradient")}
                  >
                    Gradient
                  </button>
                </div>

                {customBackgroundType === "solid" ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customSolidColor}
                      onChange={(e) => {
                        setCustomSolidColor(e.target.value)
                        setUseCustomBackground(true)
                      }}
                      className="w-12 h-10 p-1"
                    />
                    <span className="text-xs font-mono">{customSolidColor}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customGradientColors[0]}
                        onChange={(e) => {
                          setCustomGradientColors([e.target.value, customGradientColors[1]])
                          setUseCustomBackground(true)
                        }}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="color"
                        value={customGradientColors[1]}
                        onChange={(e) => {
                          setCustomGradientColors([customGradientColors[0], e.target.value])
                          setUseCustomBackground(true)
                        }}
                        className="w-12 h-10 p-1"
                      />
                    </div>
                    <Slider
                      value={[customGradientDirection]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={(value) => {
                        setCustomGradientDirection(value[0])
                        setUseCustomBackground(true)
                      }}
                    />
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <CollapsibleSection title="Content Theme" defaultOpen={true}>
              <div className="grid grid-cols-2 gap-2">
                {contentThemes.map((theme) => (
                  <button
                    key={theme.id}
                    className={cn(
                      "h-12 rounded-md border-2 transition-all",
                      selectedContentTheme === theme.id ? "border-primary" : "border-transparent",
                    )}
                    style={{ backgroundColor: theme.backgroundColor }}
                    onClick={() => setSelectedContentTheme(theme.id)}
                    title={theme.name}
                  >
                    <div className="text-xs" style={{ color: theme.textColor }}>
                      {theme.name}
                    </div>
                  </button>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Text">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-2 block">Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Logo</Label>
                  <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t space-y-2">
          <Button onClick={downloadScreenshot} className="w-full" disabled={isLoading}>
            <Download size={16} />
            {isLoading ? "Processing..." : "Download"}
          </Button>
          <div className="flex gap-2">
            <SocialShare onShare={handleSocialShare} isLoading={isLoading} className="flex-1" />
            <Button variant="outline" className="flex-1 bg-transparent">
              <Save size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 bg-muted rounded-lg p-4 overflow-auto">
        <div style={getBackgroundStyle()} className="rounded-lg overflow-hidden">
          <ScreenshotPreviewResponsive
            ref={previewRef}
            analyticsData={safeData}
            config={{
              title,
              description,
              chartType: selectedChartType,
              backgroundTheme: selectedBackgroundTheme,
              contentTheme: selectedContentTheme,
              dateRange,
              showLogo,
              showVisitors,
              showPageViews,
              showBounceRate,
              showSessionDuration,
            }}
          />
        </div>
      </div>
    </div>
  )
}
