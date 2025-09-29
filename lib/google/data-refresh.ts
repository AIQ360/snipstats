import { createClient } from "@/utils/supabase/server"
import { format } from "date-fns"

// Function to check if we need to refresh data from Google Analytics
export async function needsDataRefresh(userId: string, startDate: string, endDate: string) {
  console.log(`NEEDS_REFRESH: Checking if data refresh is needed for user ${userId} from ${startDate} to ${endDate}`)
  const supabase = await createClient()

  try {
    // Check if we have data for the date range
    const { data: analytics, error } = await supabase
      .from("daily_analytics")
      .select("date")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)

    if (error) {
      console.error("NEEDS_REFRESH: Error checking analytics data:", error)
      return true // Refresh if there's an error
    }

    // If we have no data, we need to refresh
    if (!analytics || analytics.length === 0) {
      console.log("NEEDS_REFRESH: No data found, refresh needed")
      return true
    }

    // Check if we have data for all dates in the range
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    const dateRange = []
    const currentDate = new Date(startDateObj)

    while (currentDate <= endDateObj) {
      dateRange.push(format(currentDate, "yyyy-MM-dd"))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const datesInDb = analytics.map((item) => item.date)
    const missingDates = dateRange.filter((date) => !datesInDb.includes(date))

    if (missingDates.length > 0) {
      console.log(`NEEDS_REFRESH: Missing data for dates: ${missingDates.join(", ")}`)
      return true
    }

    // Check if data is stale (older than 24 hours)
    const { data: latestUpdate, error: updateError } = await supabase
      .from("daily_analytics")
      .select("updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (updateError) {
      console.error("NEEDS_REFRESH: Error checking latest update:", updateError)
      return true // Refresh if there's an error
    }

    if (latestUpdate) {
      const lastUpdate = new Date(latestUpdate.updated_at)
      const now = new Date()
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

      if (hoursSinceUpdate > 24) {
        console.log(`NEEDS_REFRESH: Data is stale (${hoursSinceUpdate.toFixed(1)} hours old)`)
        return true
      }
    }

    console.log("NEEDS_REFRESH: Data is up to date, no refresh needed")
    return false
  } catch (error) {
    console.error("NEEDS_REFRESH: Error checking if refresh is needed:", error)
    return true // Refresh if there's an error
  }
}
