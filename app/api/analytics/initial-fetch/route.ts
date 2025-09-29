import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getGoogleAnalyticsData, processAndStoreAnalyticsData } from "@/lib/google/analytics"
import { format, subDays } from "date-fns"

export async function processRequest(params: { days: number; propertyId: string; userId: string }) {
  console.log("INITIAL_FETCH_DIRECT: Starting direct data fetch...")
  const supabase = await createClient()

  try {
    const { days, propertyId, userId } = params

    if (!userId) {
      console.log("INITIAL_FETCH_DIRECT: No user ID provided")
      return { success: false, error: "User ID is required" }
    }

    if (!propertyId) {
      console.log("INITIAL_FETCH_DIRECT: No property ID provided")
      return { success: false, error: "Property ID is required" }
    }

    console.log(`INITIAL_FETCH_DIRECT: Fetching data for the last ${days} days for property ${propertyId}`)

    // Update status in database to indicate fetch is in progress
    await updateFetchStatus(supabase, userId, "fetching", "Starting data fetch...")

    // Verify property exists for user in ga_accounts
    const { data: gaAccount, error: accountError } = await supabase
      .from("ga_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("ga_property_id", propertyId)
      .maybeSingle()

    if (accountError && accountError.code !== "PGRST116") {
      // PGRST116 = no rows
      console.error("INITIAL_FETCH_DIRECT: Error checking GA account:", accountError.message)
      await updateFetchStatus(supabase, userId, "error", "Failed to check GA account")
      return { success: false, error: "Failed to check GA account" }
    }

    if (!gaAccount) {
      console.log("INITIAL_FETCH_DIRECT: No matching GA account found for property")
      await updateFetchStatus(supabase, userId, "error", "No GA account found for this property")
      return { success: false, error: "No GA account found for this property" }
    }

    // Calculate date range - EXPLICITLY use 30 days
    const endDate = format(new Date(), "yyyy-MM-dd")
    const startDate = format(subDays(new Date(), days), "yyyy-MM-dd")
    console.log(`INITIAL_FETCH_DIRECT: Date range: ${startDate} to ${endDate} (${days} days)`)

    // Update status to show we're fetching from Google
    await updateFetchStatus(supabase, userId, "fetching", `Fetching data from ${startDate} to ${endDate}...`)

    // Fetch GA data
    console.log("INITIAL_FETCH_DIRECT: Fetching data from Google Analytics...")
    const data = await getGoogleAnalyticsData(
      userId,
      startDate,
      endDate,
      gaAccount.access_token,
      gaAccount.refresh_token,
      propertyId,
    )

    if (!data) {
      throw new Error("No data returned from Google Analytics")
    }
    console.log("INITIAL_FETCH_DIRECT: Data fetched successfully")

    // Update status to show we're processing data
    await updateFetchStatus(supabase, userId, "processing", "Processing and storing data...")

    // Process and store data
    console.log("INITIAL_FETCH_DIRECT: Processing and storing data...")
    await processAndStoreAnalyticsData(userId, data)
    console.log("INITIAL_FETCH_DIRECT: Data processed and stored successfully")

    // Verify data
    const { data: verifyData, error: verifyError } = await supabase
      .from("daily_analytics")
      .select("count")
      .eq("user_id", userId)

    if (verifyError) {
      console.error("INITIAL_FETCH_DIRECT: Error verifying data:", verifyError.message)
      await updateFetchStatus(supabase, userId, "error", "Error verifying data")
    } else {
      console.log(`INITIAL_FETCH_DIRECT: Verified ${verifyData?.[0]?.count || 0} records stored in daily_analytics`)

      // Update status to complete
      await updateFetchStatus(
        supabase,
        userId,
        "complete",
        `Successfully fetched ${verifyData?.[0]?.count || 0} days of data`,
      )

      // Verify the status was updated to complete
      const { data: finalStatusCheck, error: finalStatusCheckError } = await supabase
        .from("data_fetch_status")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle()

      console.log(
        "INITIAL_FETCH_DIRECT: Final status check:",
        finalStatusCheck?.status || "unknown",
        finalStatusCheckError?.message || "",
      )
    }

    return {
      success: true,
      userId,
      propertyId,
      daysRequested: days,
      daysProcessed: verifyData?.[0]?.count || 0,
    }
  } catch (error) {
    console.error("INITIAL_FETCH_DIRECT: Error fetching analytics:", error)
    await updateFetchStatus(supabase, params.userId, "error", error instanceof Error ? error.message : String(error))
    return {
      success: false,
      error: "Failed to fetch analytics data",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function POST(request: NextRequest) {
  console.log("INITIAL_FETCH: Starting initial data fetch via API...")
  const supabase = await createClient()

  // Debug authentication
  const headers = Object.fromEntries(request.headers)
  console.log("INITIAL_FETCH: Request headers:", headers)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  console.log("INITIAL_FETCH: Auth result - User:", user?.id, "Error:", userError?.message)

  if (userError || !user) {
    console.log("INITIAL_FETCH: User not authenticated - Details:", userError?.message)
    return NextResponse.json({ error: "Not authenticated", details: userError?.message }, { status: 401 })
  }

  console.log("INITIAL_FETCH: User authenticated - ID:", user.id)

  try {
    const body = await request.json()
    // Ensure days is explicitly set to 30 if not provided
    const days = body.days || 30
    const propertyId = body.propertyId

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    const result = await processRequest({
      days,
      propertyId,
      userId: user.id,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error, details: result.details }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("INITIAL_FETCH: Error fetching analytics:", error)
    await updateFetchStatus(supabase, user.id, "error", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Failed to fetch analytics data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// Helper function to update fetch status
async function updateFetchStatus(supabase, userId, status, message) {
  console.log(`FETCH_STATUS_UPDATE: Updating status for user ${userId} to '${status}' with message: ${message}`)

  try {
    // First check if a record exists for this user
    const { data: existingRecord, error: checkError } = await supabase
      .from("data_fetch_status")
      .select("id, started_at")
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) {
      console.error(`FETCH_STATUS_UPDATE: Error checking existing record: ${checkError.message}`)
    }

    const now = new Date().toISOString()

    if (existingRecord) {
      // Record exists, use UPDATE
      console.log(`FETCH_STATUS_UPDATE: Record exists, updating status for user ${userId}`)

      // Handle started_at properly - keep existing value or set new one if null
      let started_at = existingRecord.started_at
      if (!started_at && status === "fetching") {
        started_at = now
      }

      const { error: updateError } = await supabase
        .from("data_fetch_status")
        .update({
          status: status,
          message: message,
          updated_at: now,
          started_at: started_at,
          completed_at: status === "complete" || status === "error" ? now : null,
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error(`FETCH_STATUS_UPDATE: Error updating status: ${updateError.message}`)
      } else {
        console.log(`FETCH_STATUS_UPDATE: Status updated successfully to '${status}'`)
      }
    } else {
      // Record doesn't exist, use INSERT
      console.log(`FETCH_STATUS_UPDATE: No record exists, inserting new status for user ${userId}`)

      const { error: insertError } = await supabase.from("data_fetch_status").insert({
        user_id: userId,
        status: status,
        message: message,
        updated_at: now,
        started_at: status === "fetching" ? now : null,
        completed_at: status === "complete" || status === "error" ? now : null,
      })

      if (insertError) {
        console.error(`FETCH_STATUS_UPDATE: Error inserting status: ${insertError.message}`)
      } else {
        console.log(`FETCH_STATUS_UPDATE: Status inserted successfully as '${status}'`)
      }
    }
  } catch (error) {
    console.error(`FETCH_STATUS_UPDATE: Exception during status update: ${error.message || error}`)
  }
}
