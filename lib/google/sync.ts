import { createClient } from "@/utils/supabase/server"
import { getGoogleAnalyticsData, processAndStoreAnalyticsData } from "@/lib/google/analytics"
import { format } from "date-fns"

// Function to sync Google Analytics data for a specific date range
export async function syncGoogleAnalyticsData(userId: string, startDate: string, endDate: string) {
  console.log(`SYNC: Syncing Google Analytics data for user ${userId} from ${startDate} to ${endDate}`)
  const supabase = await createClient()

  try {
    // Get the user's GA account to access tokens
    const { data: gaAccount, error: gaError } = await supabase
      .from("ga_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (gaError || !gaAccount) {
      console.error("SYNC: Error fetching GA account:", gaError)
      throw new Error("GA account not found")
    }

    console.log("SYNC: Found GA account:", {
      propertyId: gaAccount.ga_property_id,
      hasAccessToken: !!gaAccount.access_token,
      hasRefreshToken: !!gaAccount.refresh_token,
    })

    if (!gaAccount.access_token || !gaAccount.refresh_token) {
      console.error("SYNC: Missing access or refresh token")
      throw new Error("Missing authentication tokens")
    }

    // Fetch the data from Google Analytics
    console.log("SYNC: Fetching data from Google Analytics...")
    // Pass only the property ID, let getGoogleAnalyticsData handle token fetching and refreshing
    const data = await getGoogleAnalyticsData(
      userId,
      startDate,
      endDate,
      undefined,
      undefined,
      gaAccount.ga_property_id,
    )

    // Process and store the data
    console.log("SYNC: Processing and storing data...")
    await processAndStoreAnalyticsData(userId, data)
    console.log("SYNC: Data processed and stored successfully")

    return true
  } catch (error) {
    console.error("SYNC: Error syncing Google Analytics data:", error)
    throw error
  }
}

// Function to check if we need to refresh data from Google Analytics
export async function checkDataRefreshNeeded(userId: string, startDate: string, endDate: string) {
  console.log(`CHECK_REFRESH: Checking if data refresh is needed for user ${userId} from ${startDate} to ${endDate}`)
  const supabase = await createServerSupabaseClient()

  try {
    // Check if we have data for the date range
    const { data: analytics, error } = await supabase
      .from("daily_analytics")
      .select("date")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)

    if (error) {
      console.error("CHECK_REFRESH: Error checking analytics data:", error)
      return true // Refresh if there's an error
    }

    // If we have no data, we need to refresh
    if (!analytics || analytics.length === 0) {
      console.log("CHECK_REFRESH: No data found, refresh needed")
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
      console.log(`CHECK_REFRESH: Missing data for dates: ${missingDates.join(", ")}`)
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
      console.error("CHECK_REFRESH: Error checking latest update:", updateError)
      return true // Refresh if there's an error
    }

    if (latestUpdate) {
      const lastUpdate = new Date(latestUpdate.updated_at)
      const now = new Date()
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

      if (hoursSinceUpdate > 24) {
        console.log(`CHECK_REFRESH: Data is stale (${hoursSinceUpdate.toFixed(1)} hours old)`)
        return true
      }
    }

    console.log("CHECK_REFRESH: Data is up to date, no refresh needed")
    return false
  } catch (error) {
    console.error("CHECK_REFRESH: Error checking if refresh is needed:", error)
    return true // Refresh if there's an error
  }
}
