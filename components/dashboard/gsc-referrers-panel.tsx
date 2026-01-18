"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface Referrer {
    source: string
    visitors: number
}

interface GSCReferrersPanelProps {
    referrers: Referrer[]
}

type TabType = "channel" | "referrer"

// Map sources to channels
function getChannel(source: string): string {
    const lowerSource = source.toLowerCase()
    if (lowerSource.includes("google") || lowerSource.includes("bing") || lowerSource.includes("yahoo") || lowerSource.includes("duckduckgo")) {
        return "Organic Search"
    }
    if (lowerSource === "direct" || lowerSource === "(direct)" || lowerSource === "none" || lowerSource === "(none)") {
        return "Direct"
    }
    if (lowerSource.includes("twitter") || lowerSource.includes("facebook") || lowerSource.includes("linkedin") || lowerSource.includes("instagram") || lowerSource === "x" || lowerSource === "t.co") {
        return "Social"
    }
    if (lowerSource.includes("email") || lowerSource.includes("newsletter")) {
        return "Email"
    }
    return "Referral"
}

// Get icon for source
function getSourceIcon(source: string): string {
    const lowerSource = source.toLowerCase()
    if (lowerSource === "x" || lowerSource.includes("twitter") || lowerSource === "t.co") return "𝕏"
    if (lowerSource.includes("google")) return "G"
    if (lowerSource.includes("facebook")) return "f"
    if (lowerSource.includes("linkedin")) return "in"
    if (lowerSource === "direct" || lowerSource === "(direct)" || lowerSource === "none" || lowerSource === "(none)") return "◎"
    return "↗"
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "k"
    return num.toString()
}

export function GSCReferrersPanel({ referrers }: GSCReferrersPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>("referrer")

    const channelData = useMemo(() => {
        const channelMap = new Map<string, number>()
        referrers.forEach((ref) => {
            const channel = getChannel(ref.source)
            channelMap.set(channel, (channelMap.get(channel) || 0) + ref.visitors)
        })
        return Array.from(channelMap.entries())
            .map(([name, visitors]) => ({ name, visitors }))
            .sort((a, b) => b.visitors - a.visitors)
    }, [referrers])

    const maxVisitors = useMemo(() => {
        if (activeTab === "channel") {
            return Math.max(...channelData.map((c) => c.visitors), 1)
        }
        return Math.max(...referrers.map((r) => r.visitors), 1)
    }, [activeTab, channelData, referrers])

    const displayData = activeTab === "channel"
        ? channelData.slice(0, 8)
        : referrers.slice(0, 8)

    return (
        <div className="rounded-xl border bg-card p-4">
            {/* Tabs */}
            <div className="mb-4 flex items-center gap-6 border-b pb-2">
                <button
                    onClick={() => setActiveTab("channel")}
                    className={cn(
                        "text-sm font-medium transition-colors",
                        activeTab === "channel"
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Channel
                </button>
                <button
                    onClick={() => setActiveTab("referrer")}
                    className={cn(
                        "text-sm font-medium transition-colors",
                        activeTab === "referrer"
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Referrer
                </button>
            </div>

            {/* Header */}
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{activeTab === "channel" ? "Channel" : "Source"}</span>
                <span>Visitors ↓</span>
            </div>

            {/* List */}
            <div className="space-y-2">
                {displayData.map((item, index) => {
                    const name = "name" in item ? item.name : item.source
                    const visitors = item.visitors
                    const barWidth = (visitors / maxVisitors) * 100

                    return (
                        <div key={name} className="group relative">
                            {/* Background bar */}
                            <div
                                className="absolute inset-0 rounded bg-[#f4a58a]/20 transition-all"
                                style={{ width: `${barWidth}%` }}
                            />
                            {/* Content */}
                            <div className="relative flex items-center justify-between py-2 px-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-medium">
                                        {activeTab === "referrer" ? getSourceIcon(name) : index + 1}
                                    </span>
                                    <span className="text-sm font-medium">{name}</span>
                                </div>
                                <span className="text-sm font-semibold tabular-nums">
                                    {formatNumber(visitors)}
                                </span>
                            </div>
                        </div>
                    )
                })}
                {displayData.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No referrer data available
                    </div>
                )}
            </div>
        </div>
    )
}
