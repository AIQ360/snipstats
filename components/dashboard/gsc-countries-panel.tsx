"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface GeographicData {
    country: string
    country_code?: string
    city?: string
    visitors: number
}

interface GSCCountriesPanelProps {
    geographicData: GeographicData[]
}

type TabType = "country" | "city"

// Get flag emoji from country code
function getFlagEmoji(countryCode: string | undefined): string {
    if (!countryCode || countryCode.length !== 2) return "🌍"
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "k"
    return num.toString()
}

export function GSCCountriesPanel({ geographicData }: GSCCountriesPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>("country")

    const countryData = useMemo(() => {
        const countryMap = new Map<string, { visitors: number; code?: string }>()
        geographicData.forEach((geo) => {
            const existing = countryMap.get(geo.country)
            countryMap.set(geo.country, {
                visitors: (existing?.visitors || 0) + geo.visitors,
                code: geo.country_code || existing?.code,
            })
        })
        return Array.from(countryMap.entries())
            .map(([country, data]) => ({
                name: country,
                visitors: data.visitors,
                code: data.code,
            }))
            .sort((a, b) => b.visitors - a.visitors)
    }, [geographicData])

    const cityData = useMemo(() => {
        const cityMap = new Map<string, { visitors: number; country: string; code?: string }>()
        geographicData.forEach((geo) => {
            if (geo.city) {
                const key = `${geo.city}, ${geo.country}`
                const existing = cityMap.get(key)
                cityMap.set(key, {
                    visitors: (existing?.visitors || 0) + geo.visitors,
                    country: geo.country,
                    code: geo.country_code,
                })
            }
        })
        return Array.from(cityMap.entries())
            .map(([city, data]) => ({
                name: city,
                visitors: data.visitors,
                code: data.code,
            }))
            .sort((a, b) => b.visitors - a.visitors)
    }, [geographicData])

    const displayData = activeTab === "country"
        ? countryData.slice(0, 8)
        : cityData.slice(0, 8)

    const maxVisitors = useMemo(() => {
        return Math.max(...displayData.map((d) => d.visitors), 1)
    }, [displayData])

    return (
        <div className="rounded-xl border bg-card p-4">
            {/* Tabs */}
            <div className="mb-4 flex items-center gap-6 border-b pb-2">
                <button
                    onClick={() => setActiveTab("country")}
                    className={cn(
                        "text-sm font-medium transition-colors",
                        activeTab === "country"
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Country
                </button>
                <button
                    onClick={() => setActiveTab("city")}
                    className={cn(
                        "text-sm font-medium transition-colors",
                        activeTab === "city"
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    City
                </button>
            </div>

            {/* Header */}
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{activeTab === "country" ? "Country" : "City"}</span>
                <span>Visitors ↓</span>
            </div>

            {/* List */}
            <div className="space-y-2">
                {displayData.map((item) => {
                    const barWidth = (item.visitors / maxVisitors) * 100

                    return (
                        <div key={item.name} className="group relative">
                            {/* Background bar */}
                            <div
                                className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30 transition-all"
                                style={{ width: `${barWidth}%` }}
                            />
                            {/* Content */}
                            <div className="relative flex items-center justify-between py-2 px-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getFlagEmoji(item.code)}</span>
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <span className="text-sm font-semibold tabular-nums">
                                    {formatNumber(item.visitors)}
                                </span>
                            </div>
                        </div>
                    )
                })}
                {displayData.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No location data available
                    </div>
                )}
            </div>
        </div>
    )
}
