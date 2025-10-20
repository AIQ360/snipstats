import { createClient } from "@/utils/supabase/server"
import { subWeeks, startOfWeek, endOfWeek, format } from "date-fns"

export interface EventInsight {
  id: string
  user_id: string
  date: string
  event_type: "weekly_momentum" | "quality_traffic" | "referrer_milestone" | "growth_acceleration" | "referrer_risk"
  title: string
  description: string
  value: number
  metadata?: Record<string, any>
  created_at: string
}

export async function detectAndStoreWeeklyEvents(userId: string) {
  const supabase = await createClient()

  try {
    // Get last 8 weeks of data
    const endDate = new Date()
    const startDate = subWeeks(endDate, 8)

    const { data: analytics, error } = await supabase
      .from("daily_analytics")
      .select("*")
      .eq("user_id", userId)
      .gte("date", format(startDate, "yyyy-MM-dd"))
      .lte("date", format(endDate, "yyyy-MM-dd"))
      .order("date", { ascending: true })

    if (error || !analytics || analytics.length === 0) {
      console.log("No analytics data for event detection")
      return
    }

    // Get referrer data for the same period
    const { data: referrers } = await supabase
      .from("referrers")
      .select("*")
      .eq("user_id", userId)
      .gte("date", format(startDate, "yyyy-MM-dd"))
      .lte("date", format(endDate, "yyyy-MM-dd"))

    // Clear OLD event types (spike, drop, streak) - only keep new weekly ones
    await supabase
      .from("events")
      .delete()
      .eq("user_id", userId)
      .in("event_type", ["spike", "drop", "streak", "milestone"])

    // Also clear old weekly events in date range to avoid duplication
    await supabase
      .from("events")
      .delete()
      .eq("user_id", userId)
      .in("event_type", [
        "weekly_momentum",
        "quality_traffic",
        "referrer_milestone",
        "growth_acceleration",
        "referrer_risk",
      ])
      .gte("date", format(startDate, "yyyy-MM-dd"))
      .lte("date", format(endDate, "yyyy-MM-dd"))

    // Organize data by week
    const weeks: Record<string, any> = {}
    for (const day of analytics) {
      const week = format(new Date(day.date), "yyyy-'W'ww")
      if (!weeks[week]) {
        weeks[week] = {
          week,
          startDate: startOfWeek(new Date(day.date)),
          endDate: endOfWeek(new Date(day.date)),
          days: [],
          stats: {
            totalVisitors: 0,
            totalPageViews: 0,
            totalEngagementScore: 0,
            avgBounceRate: 0,
            avgSessionDuration: 0,
            qualityDays: 0,
          },
        }
      }
      weeks[week].days.push(day)
      weeks[week].stats.totalVisitors += day.visitors
      weeks[week].stats.totalPageViews += day.page_views
      weeks[week].stats.avgBounceRate += day.bounce_rate
      weeks[week].stats.avgSessionDuration += day.avg_session_duration
    }

    // Finalize weekly stats
    const weekArray = Object.values(weeks)
    for (const week of weekArray) {
      week.stats.avgBounceRate = week.stats.avgBounceRate / week.days.length
      week.stats.avgSessionDuration = week.stats.avgSessionDuration / week.days.length

      // Calculate quality days (low bounce + high engagement)
      week.stats.qualityDays = week.days.filter(
        (d) => d.bounce_rate < 0.4 && d.avg_session_duration > 180, // <40% bounce, >3min session
      ).length
    }

    const events: EventInsight[] = []

    // 1. WEEKLY MOMENTUM - Compare consecutive weeks
    if (weekArray.length >= 2) {
      for (let i = 1; i < weekArray.length; i++) {
        const thisWeek = weekArray[i]
        const lastWeek = weekArray[i - 1]

        if (lastWeek.stats.totalVisitors === 0) continue

        const growth =
          ((thisWeek.stats.totalVisitors - lastWeek.stats.totalVisitors) / lastWeek.stats.totalVisitors) * 100

        // Only create event if meaningful growth (>15%) or significant decline (<-15%)
        if (Math.abs(growth) > 15) {
          events.push({
            id: `momentum-${thisWeek.week}`,
            user_id: userId,
            date: format(thisWeek.endDate, "yyyy-MM-dd"),
            event_type: "weekly_momentum",
            title:
              growth > 0
                ? `📈 ${Math.round(growth)}% week-over-week growth`
                : `📉 ${Math.round(Math.abs(growth))}% decline`,
            description:
              growth > 0
                ? `This week: ${thisWeek.stats.totalVisitors.toLocaleString()} visitors (was ${lastWeek.stats.totalVisitors.toLocaleString()} last week). You're on an upward trajectory!`
                : `This week trending down. ${thisWeek.stats.totalVisitors.toLocaleString()} visitors vs ${lastWeek.stats.totalVisitors.toLocaleString()} last week. Time to investigate what changed.`,
            value: growth,
            metadata: {
              weekNumber: i,
              thisWeekVisitors: thisWeek.stats.totalVisitors,
              lastWeekVisitors: lastWeek.stats.totalVisitors,
            },
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    // 2. QUALITY TRAFFIC DAYS - Weeks with high engagement
    for (const week of weekArray) {
      // Quality score: engagement + consistency + bounce rate
      const avgEngagement = week.stats.avgSessionDuration / 60 // Convert to minutes
      const engagementScore = Math.min(avgEngagement / 2, 10) // Cap at 10
      const bounceScore = Math.max(10 - week.stats.avgBounceRate * 25, 0) // Lower bounce = higher score
      const qualityScore = (engagementScore + bounceScore) / 2

      if (qualityScore >= 7 && week.stats.qualityDays >= 3) {
        events.push({
          id: `quality-${week.week}`,
          user_id: userId,
          date: format(week.endDate, "yyyy-MM-dd"),
          event_type: "quality_traffic",
          title: `✨ Quality traffic week - High engagement`,
          description: `${week.stats.qualityDays} high-quality days this week. Avg ${Math.round(avgEngagement * 10) / 10}m session time, ${(week.stats.avgBounceRate * 100).toFixed(1)}% bounce rate. People are genuinely interested in your content.`,
          value: qualityScore,
          metadata: {
            qualityDays: week.stats.qualityDays,
            avgEngagementMinutes: Math.round(avgEngagement * 10) / 10,
            bounceRate: Math.round(week.stats.avgBounceRate * 100),
          },
          created_at: new Date().toISOString(),
        })
      }
    }

    // 3. REFERRER MILESTONES - When one referrer dominates a week
    if (referrers && referrers.length > 0) {
      for (const week of weekArray) {
        const weekStart = format(week.startDate, "yyyy-MM-dd")
        const weekEnd = format(week.endDate, "yyyy-MM-dd")

        const weekReferrers = referrers.filter((r) => r.date >= weekStart && r.date <= weekEnd)

        const referrerStats: Record<string, number> = {}
        for (const ref of weekReferrers) {
          referrerStats[ref.source] = (referrerStats[ref.source] || 0) + ref.visitors
        }

        const totalRefVisitors = Object.values(referrerStats).reduce((a, b) => a + b, 0)
        if (totalRefVisitors === 0) continue

        // Find dominant referrer (>20% of week's traffic)
        for (const [source, visitors] of Object.entries(referrerStats)) {
          const percentage = (visitors / totalRefVisitors) * 100
          if (percentage > 20) {
            events.push({
              id: `referrer-${week.week}-${source}`,
              user_id: userId,
              date: format(week.endDate, "yyyy-MM-dd"),
              event_type: "referrer_milestone",
              title: `🔥 ${source} dominated this week`,
              description: `${source} brought ${Math.round(percentage)}% of your weekly traffic (${visitors.toLocaleString()} visitors). This is your top performer this week.`,
              value: percentage,
              metadata: {
                source,
                visitors,
                percentage: Math.round(percentage),
              },
              created_at: new Date().toISOString(),
            })
          }
        }
      }
    }

    // 4. GROWTH ACCELERATION - Increasing velocity
    if (weekArray.length >= 3) {
      for (let i = 2; i < weekArray.length; i++) {
        const week3 = weekArray[i]
        const week2 = weekArray[i - 1]
        const week1 = weekArray[i - 2]

        if (week1.stats.totalVisitors === 0 || week2.stats.totalVisitors === 0) continue

        const growth1 = week2.stats.totalVisitors - week1.stats.totalVisitors
        const growth2 = week3.stats.totalVisitors - week2.stats.totalVisitors

        // Acceleration: is growth rate increasing? (week2 growth > week1 growth by >10%)
        if (growth1 > 0 && growth2 > growth1 * 1.1) {
          const acceleration = ((growth2 - growth1) / growth1) * 100

          events.push({
            id: `accel-${week3.week}`,
            user_id: userId,
            date: format(week3.endDate, "yyyy-MM-dd"),
            event_type: "growth_acceleration",
            title: `🚀 Acceleration detected - Growing faster`,
            description: `Your growth is accelerating. Last week +${growth1.toLocaleString()} visitors, this week +${growth2.toLocaleString()} visitors. You're gaining momentum!`,
            value: acceleration,
            metadata: {
              lastWeekGrowth: growth1,
              thisWeekGrowth: growth2,
              accelerationPercent: Math.round(acceleration),
            },
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    // 5. REFERRER RISK - Over-reliance on one source
    if (referrers && referrers.length > 0) {
      const lastWeek = weekArray[weekArray.length - 1]
      if (lastWeek) {
        const weekStart = format(lastWeek.startDate, "yyyy-MM-dd")
        const weekEnd = format(lastWeek.endDate, "yyyy-MM-dd")

        const weekReferrers = referrers.filter((r) => r.date >= weekStart && r.date <= weekEnd)
        const referrerStats: Record<string, number> = {}

        for (const ref of weekReferrers) {
          referrerStats[ref.source] = (referrerStats[ref.source] || 0) + ref.visitors
        }

        const totalRefVisitors = Object.values(referrerStats).reduce((a, b) => a + b, 0)
        if (totalRefVisitors > 0) {
          // Find if any source is >50% of traffic
          for (const [source, visitors] of Object.entries(referrerStats)) {
            const percentage = (visitors / totalRefVisitors) * 100
            if (percentage > 50) {
              events.push({
                id: `risk-${lastWeek.week}`,
                user_id: userId,
                date: format(lastWeek.endDate, "yyyy-MM-dd"),
                event_type: "referrer_risk",
                title: `⚠️ Over-dependent on one source`,
                description: `${source} is ${Math.round(percentage)}% of your traffic. This is risky. Diversify your marketing - don't put all your eggs in one basket.`,
                value: percentage,
                metadata: {
                  source,
                  percentage: Math.round(percentage),
                  dependencyRisk: percentage > 70 ? "critical" : "warning",
                },
                created_at: new Date().toISOString(),
              })
            }
          }
        }
      }
    }

    // Store all events
    if (events.length > 0) {
      const { error: insertError } = await supabase.from("events").insert(
        events.map((e) => ({
          user_id: e.user_id,
          date: e.date,
          event_type: e.event_type,
          title: e.title,
          description: e.description,
          value: e.value,
          metadata: e.metadata,
        })),
      )

      if (insertError) {
        console.error("Error inserting events:", insertError)
      } else {
        console.log(`Successfully stored ${events.length} new weekly events for user ${userId}`)
      }
    } else {
      console.log("No significant weekly events to store")
    }

    return events
  } catch (error) {
    console.error("Error in detectAndStoreWeeklyEvents:", error)
    return []
  }
}
