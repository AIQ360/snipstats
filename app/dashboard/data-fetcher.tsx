import { createClient } from "@/utils/supabase/server"

export async function fetchDashboardData(userId: string, startDate: string, endDate: string) {
  const supabase = await createClient()

  try {
    // Get the user's GA account
    const { data: gaAccount, error } = await supabase
      .from("ga_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !gaAccount) {
      return { error: "No Google Analytics account connected" }
    }

    // Check if token is marked as invalid in our database
    if (gaAccount.token_status === "invalid") {
      return { error: "Authentication token is invalid", redirectUrl: "/connect-ga/reconnect" }
    }

    // Fetch analytics data
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("analytics_data")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (analyticsError) {
      return { error: "Failed to fetch analytics data" }
    }

    // Fetch other data as needed
    // ...

    return {
      analyticsData,
      gaAccount,
      // Add other data as needed
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return { error: "Failed to fetch dashboard data" }
  }
}
