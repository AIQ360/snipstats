import { google, type analyticsdata_v1beta } from "googleapis"
import { getOAuth2Client } from "./auth"
import { createClient } from "@/utils/supabase/server"
import { format, subDays } from "date-fns"
// Add this function at the top of the file
import { cache } from "react"

// Define the schema for GA account data from Supabase
interface GaAccount {
  user_id: string
  ga_property_id: string // TEXT NOT NULL in schema
  access_token: string
  refresh_token: string
  token_expiry: string
}

// Get Google Analytics data for a specific date range
export async function getGoogleAnalyticsData(
  userId: string,
  startDate: string,
  endDate: string,
  accessToken?: string,
  refreshToken?: string,
  propertyId?: string,
) {
  console.log(`GA_DATA: Fetching Google Analytics data for user ${userId} from ${startDate} to ${endDate}`)
  const supabase = await createClient()

  // If tokens are not provided, fetch them from the database
  if (!accessToken || !refreshToken || !propertyId) {
    console.log("GA_DATA: Tokens not provided, fetching from database")
    const { data, error: gaError } = await supabase
      .from("ga_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (gaError || !data) {
      console.error("GA_DATA: Error fetching GA account:", gaError)
      throw new Error("Google Analytics account not found")
    }

    const gaAccount = data
    accessToken = gaAccount.access_token
    refreshToken = gaAccount.refresh_token
    propertyId = gaAccount.ga_property_id
  }

  if (!accessToken || !refreshToken) {
    console.error("GA_DATA: Missing access or refresh token")
    throw new Error("Missing authentication tokens")
  }

  if (!propertyId || propertyId === "pending" || propertyId === "pending_selection") {
    console.error("GA_DATA: Invalid property ID:", propertyId)
    throw new Error("Invalid property ID")
  }

  console.log(`GA_DATA: Using property ID: ${propertyId}`)

  // Check if token is expired and refresh if needed
  const { data, error } = await supabase
    .from("ga_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("GA_DATA: Error fetching GA account:", error)
    throw new Error("Google Analytics account not found")
  }

  if (data && data.token_expiry && new Date(data.token_expiry) < new Date()) {
    console.log("GA_DATA: Access token expired, refreshing...")
    await refreshGoogleToken(userId, refreshToken)
    const { data: updatedAccount } = await supabase
      .from("ga_accounts")
      .select("access_token")
      .eq("user_id", userId)
      .single()
    accessToken = updatedAccount?.access_token || accessToken
    console.log("GA_DATA: Token refreshed successfully")
  }

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const analyticsData = google.analyticsdata({
    version: "v1beta",
    auth: oauth2Client,
  })

  // Log the exact date range being used
  console.log(`GA_DATA: Fetching data for date range: ${startDate} to ${endDate}`)

  console.log("GA_DATA: Fetching main report...")
  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
      dimensions: [{ name: "date" }],
    },
  })
  console.log(`GA_DATA: Main report fetched with ${response.data.rows?.length || 0} rows`)

  console.log("GA_DATA: Fetching referrers report...")
  const referrersResponse = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "date" }, { name: "sessionSource" }],
    },
  })
  console.log(`GA_DATA: Referrers report fetched with ${referrersResponse.data.rows?.length || 0} rows`)

  console.log("GA_DATA: Fetching pages report with engagement time...")
  const pagesResponse = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "screenPageViews" },
        { name: "averageSessionDuration" }, // Add this metric to get engagement time
      ],
      dimensions: [{ name: "date" }, { name: "pagePath" }],
    },
  })
  console.log(`GA_DATA: Pages report fetched with ${pagesResponse.data.rows?.length || 0} rows`)

  // NEW: Fetch geographic data
  console.log("GA_DATA: Fetching geographic report...")
  const geographicResponse = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      dimensions: [{ name: "date" }, { name: "country" }, { name: "countryId" }, { name: "city" }],
    },
  })
  console.log(`GA_DATA: Geographic report fetched with ${geographicResponse.data.rows?.length || 0} rows`)

  // NEW: Fetch device/browser data
  console.log("GA_DATA: Fetching device report...")
  const deviceResponse = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      dimensions: [{ name: "date" }, { name: "deviceCategory" }, { name: "browser" }, { name: "operatingSystem" }],
    },
  })
  console.log(`GA_DATA: Device report fetched with ${deviceResponse.data.rows?.length || 0} rows`)

  return {
    mainReport: response.data,
    referrers: referrersResponse.data,
    pages: pagesResponse.data,
    geographic: geographicResponse.data,
    device: deviceResponse.data,
  }
}

// Refresh Google token with better error handling
async function refreshGoogleToken(userId: string, refreshToken: string) {
  console.log(`REFRESH_TOKEN: Refreshing token for user ${userId}`)
  const supabase = await createClient()

  try {
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    })

    const response = await oauth2Client.refreshAccessToken()
    const tokens = response.credentials

    if (!tokens.access_token) {
      console.error("REFRESH_TOKEN: No access token returned from refresh")
      throw new Error("No access token returned from refresh")
    }

    console.log("REFRESH_TOKEN: Token refreshed successfully")

    // Update the token in the database
    const { error: updateError } = await supabase
      .from("ga_accounts")
      .update({
        access_token: tokens.access_token,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("REFRESH_TOKEN: Error updating token in database:", updateError)
      // Continue anyway since we have a valid token
    }

    return tokens
  } catch (error) {
    console.error("REFRESH_TOKEN: Error refreshing token:", error)

    // If the refresh token is invalid, we need to mark it as such in the database
    // This will prompt the user to reconnect their Google account
    if (error.message?.includes("invalid_grant")) {
      console.log("REFRESH_TOKEN: Invalid grant error, marking token as invalid")
      await supabase
        .from("ga_accounts")
        .update({
          token_status: "invalid",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      throw new Error("Failed to refresh access token - please reconnect your Google account")
    }

    throw new Error("Failed to refresh access token")
  }
}

// Process and store Google Analytics data
export async function processAndStoreAnalyticsData(
  userId: string,
  data: {
    mainReport: analyticsdata_v1beta.Schema$RunReportResponse
    referrers: analyticsdata_v1beta.Schema$RunReportResponse
    pages: analyticsdata_v1beta.Schema$RunReportResponse
    geographic: analyticsdata_v1beta.Schema$RunReportResponse
    device: analyticsdata_v1beta.Schema$RunReportResponse
  },
) {
  console.log(`PROCESS_DATA: Processing analytics data for user ${userId}`)
  const supabase = await createClient()

  // Get the user's GA account to get property_id
  const { data: gaAccount } = await supabase.from("ga_accounts").select("ga_property_id").eq("user_id", userId).single()

  if (!gaAccount) {
    console.error("PROCESS_DATA: No Google Analytics account found")
    throw new Error("No Google Analytics account found")
  }

  console.log(`PROCESS_DATA: Using property ID: ${gaAccount.ga_property_id}`)

  const dailyMetrics = data.mainReport.rows || []
  console.log(`PROCESS_DATA: Processing ${dailyMetrics.length} daily metrics rows`)

  // Process referrers with date dimension
  const referrersByDate: Record<string, { source: string; visitors: number }[]> = {}
  if (data.referrers.rows) {
    console.log(`PROCESS_DATA: Processing ${data.referrers.rows.length} referrers rows`)
    data.referrers.rows.forEach((row) => {
      if (!row.dimensionValues || row.dimensionValues.length < 2) {
        console.warn("PROCESS_DATA: Skipping referrer row with missing dimensions")
        return
      }

      const date = row.dimensionValues[0].value!
      // FIX: Properly format the date as YYYY-MM-DD
      const formattedDate = formatGoogleAnalyticsDate(date)
      const source = row.dimensionValues[1].value!

      if (!row.metricValues || row.metricValues.length < 1) {
        console.warn("PROCESS_DATA: Skipping referrer row with missing metrics")
        return
      }

      const visitors = Number.parseInt(row.metricValues[0].value!)

      if (!referrersByDate[formattedDate]) {
        referrersByDate[formattedDate] = []
      }

      referrersByDate[formattedDate].push({ source, visitors })
    })

    // Debug log to check if referrers are being processed correctly
    console.log(`PROCESS_DATA: Processed referrers for ${Object.keys(referrersByDate).length} dates`)
    for (const date in referrersByDate) {
      console.log(`PROCESS_DATA: Date ${date} has ${referrersByDate[date].length} referrers`)
    }
  }

  // Process top pages with date dimension
  const pagesByDate: Record<string, { pagePath: string; pageViews: number; avgEngagementTime: number }[]> = {}
  if (data.pages.rows) {
    console.log(`PROCESS_DATA: Processing ${data.pages.rows.length} pages rows`)
    data.pages.rows.forEach((row) => {
      if (!row.dimensionValues || row.dimensionValues.length < 2) {
        console.warn("PROCESS_DATA: Skipping page row with missing dimensions")
        return
      }

      const date = row.dimensionValues[0].value!
      // FIX: Properly format the date as YYYY-MM-DD
      const formattedDate = formatGoogleAnalyticsDate(date)
      const pagePath = row.dimensionValues[1].value!

      if (!row.metricValues || row.metricValues.length < 2) {
        console.warn("PROCESS_DATA: Skipping page row with missing metrics")
        return
      }

      const pageViews = Number.parseInt(row.metricValues[0].value || "0")
      const avgEngagementTime = Number.parseFloat(row.metricValues[1].value || "0")

      if (!pagesByDate[formattedDate]) {
        pagesByDate[formattedDate] = []
      }

      pagesByDate[formattedDate].push({ pagePath, pageViews, avgEngagementTime })
    })

    // Debug log to check if pages are being processed correctly
    console.log(`PROCESS_DATA: Processed pages for ${Object.keys(pagesByDate).length} dates`)
    for (const date in pagesByDate) {
      console.log(`PROCESS_DATA: Date ${date} has ${pagesByDate[date].length} pages`)
    }
  }

  // NEW: Process geographic data
  const geographicByDate: Record<
    string,
    { country: string; countryCode: string; city: string; visitors: number; pageViews: number }[]
  > = {}
  if (data.geographic.rows) {
    console.log(`PROCESS_DATA: Processing ${data.geographic.rows.length} geographic rows`)
    data.geographic.rows.forEach((row) => {
      if (!row.dimensionValues || row.dimensionValues.length < 4) {
        console.warn("PROCESS_DATA: Skipping geographic row with missing dimensions")
        return
      }

      const date = row.dimensionValues[0].value!
      const formattedDate = formatGoogleAnalyticsDate(date)
      const country = row.dimensionValues[1].value!
      const countryCode = row.dimensionValues[2].value!
      const city = row.dimensionValues[3].value!

      if (!row.metricValues || row.metricValues.length < 2) {
        console.warn("PROCESS_DATA: Skipping geographic row with missing metrics")
        return
      }

      const visitors = Number.parseInt(row.metricValues[0].value || "0")
      const pageViews = Number.parseInt(row.metricValues[1].value || "0")

      if (!geographicByDate[formattedDate]) {
        geographicByDate[formattedDate] = []
      }

      geographicByDate[formattedDate].push({ country, countryCode, city, visitors, pageViews })
    })

    console.log(`PROCESS_DATA: Processed geographic data for ${Object.keys(geographicByDate).length} dates`)
  }

  // NEW: Process device data
  const deviceByDate: Record<
    string,
    { deviceCategory: string; browser: string; operatingSystem: string; visitors: number; pageViews: number }[]
  > = {}
  if (data.device.rows) {
    console.log(`PROCESS_DATA: Processing ${data.device.rows.length} device rows`)
    data.device.rows.forEach((row) => {
      if (!row.dimensionValues || row.dimensionValues.length < 4) {
        console.warn("PROCESS_DATA: Skipping device row with missing dimensions")
        return
      }

      const date = row.dimensionValues[0].value!
      const formattedDate = formatGoogleAnalyticsDate(date)
      const deviceCategory = row.dimensionValues[1].value!
      const browser = row.dimensionValues[2].value!
      const operatingSystem = row.dimensionValues[3].value!

      if (!row.metricValues || row.metricValues.length < 2) {
        console.warn("PROCESS_DATA: Skipping device row with missing metrics")
        return
      }

      const visitors = Number.parseInt(row.metricValues[0].value || "0")
      const pageViews = Number.parseInt(row.metricValues[1].value || "0")

      if (!deviceByDate[formattedDate]) {
        deviceByDate[formattedDate] = []
      }

      deviceByDate[formattedDate].push({ deviceCategory, browser, operatingSystem, visitors, pageViews })
    })

    console.log(`PROCESS_DATA: Processed device data for ${Object.keys(deviceByDate).length} dates`)
  }

  // Process and store daily metrics
  for (const row of dailyMetrics) {
    if (!row.dimensionValues?.[0]?.value) {
      console.error("PROCESS_DATA: Missing dimension values for row")
      continue
    }
    const date = row.dimensionValues[0].value
    // FIX: Properly format the date as YYYY-MM-DD
    const formattedDate = formatGoogleAnalyticsDate(date)

    if (!row.metricValues || row.metricValues.length < 4) {
      console.error("PROCESS_DATA: Missing or incomplete metric values for row")
      continue
    }
    const visitors = Number.parseInt(row.metricValues[0].value || "0")
    const pageViews = Number.parseInt(row.metricValues[1].value || "0")
    const avgSessionDuration = Number.parseFloat(row.metricValues[2].value || "0")
    const bounceRate = Number.parseFloat(row.metricValues[3].value || "0")

    console.log(`PROCESS_DATA: Processing data for date ${formattedDate}: visitors=${visitors}, pageViews=${pageViews}`)

    // Check if we already have data for this date
    const { data: existingData, error: checkError } = await supabase
      .from("daily_analytics")
      .select("id")
      .eq("user_id", userId)
      .eq("date", formattedDate)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("PROCESS_DATA: Error checking existing data:", checkError)
      continue
    }

    if (existingData) {
      // Update existing record
      console.log(`PROCESS_DATA: Updating existing record for date ${formattedDate}`)
      const { error: updateError } = await supabase
        .from("daily_analytics")
        .update({
          visitors,
          page_views: pageViews,
          avg_session_duration: avgSessionDuration,
          bounce_rate: bounceRate,
          property_id: gaAccount.ga_property_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)

      if (updateError) {
        console.error("PROCESS_DATA: Error updating daily analytics:", updateError)
        continue
      }

      // Delete existing referrers, top pages, geographic, and device data
      await supabase.from("referrers").delete().eq("daily_analytics_id", existingData.id)
      await supabase.from("top_pages").delete().eq("daily_analytics_id", existingData.id)
      await supabase.from("geographic_analytics").delete().eq("daily_analytics_id", existingData.id)
      await supabase.from("device_analytics").delete().eq("daily_analytics_id", existingData.id)

      // Insert new referrers for this day
      const referrersForDay = referrersByDate[formattedDate] || []
      if (referrersForDay.length > 0) {
        console.log(`PROCESS_DATA: Inserting ${referrersForDay.length} referrers for date ${formattedDate}`)
        const { error: referrersError } = await supabase.from("referrers").insert(
          referrersForDay.map((referrer) => ({
            daily_analytics_id: existingData.id,
            user_id: userId, // Add user_id
            source: referrer.source,
            visitors: referrer.visitors,
            date: formattedDate,
            created_at: new Date().toISOString(),
          })),
        )

        if (referrersError) {
          console.error("PROCESS_DATA: Error inserting referrers:", referrersError)
        }
      }

      // Insert new top pages for this day
      const pagesForDay = pagesByDate[formattedDate] || []
      if (pagesForDay.length > 0) {
        console.log(`PROCESS_DATA: Inserting ${pagesForDay.length} top pages for date ${formattedDate}`)
        const { error: pagesError } = await supabase.from("top_pages").insert(
          pagesForDay.map((page) => ({
            daily_analytics_id: existingData.id,
            user_id: userId,
            page_path: page.pagePath,
            page_views: page.pageViews,
            avg_engagement_time: page.avgEngagementTime,
            date: formattedDate,
            created_at: new Date().toISOString(),
          })),
        )

        if (pagesError) {
          console.error("PROCESS_DATA: Error inserting top pages:", pagesError)
        }
      }

      // NEW: Insert geographic data for this day
      const geographicForDay = geographicByDate[formattedDate] || []
      if (geographicForDay.length > 0) {
        console.log(`PROCESS_DATA: Inserting ${geographicForDay.length} geographic records for date ${formattedDate}`)
        const { error: geographicError } = await supabase.from("geographic_analytics").insert(
          geographicForDay.map((geo) => ({
            daily_analytics_id: existingData.id,
            user_id: userId,
            date: formattedDate,
            country: geo.country,
            country_code: geo.countryCode,
            city: geo.city,
            visitors: geo.visitors,
            page_views: geo.pageViews,
            created_at: new Date().toISOString(),
          })),
        )

        if (geographicError) {
          console.error("PROCESS_DATA: Error inserting geographic data:", geographicError)
        }
      }

      // NEW: Insert device data for this day
      const deviceForDay = deviceByDate[formattedDate] || []
      if (deviceForDay.length > 0) {
        console.log(`PROCESS_DATA: Inserting ${deviceForDay.length} device records for date ${formattedDate}`)
        const { error: deviceError } = await supabase.from("device_analytics").insert(
          deviceForDay.map((device) => ({
            daily_analytics_id: existingData.id,
            user_id: userId,
            date: formattedDate,
            device_category: device.deviceCategory,
            browser: device.browser,
            operating_system: device.operatingSystem,
            visitors: device.visitors,
            page_views: device.pageViews,
            created_at: new Date().toISOString(),
          })),
        )

        if (deviceError) {
          console.error("PROCESS_DATA: Error inserting device data:", deviceError)
        }
      }
    } else {
      // Insert new record
      console.log(`PROCESS_DATA: Inserting new record for date ${formattedDate}`)
      const { data: dailyAnalytics, error: dailyError } = await supabase
        .from("daily_analytics")
        .upsert({
          user_id: userId,
          property_id: gaAccount.ga_property_id,
          date: formattedDate,
          visitors,
          page_views: pageViews,
          avg_session_duration: avgSessionDuration,
          bounce_rate: bounceRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (dailyError || !dailyAnalytics) {
        console.error("PROCESS_DATA: Error storing daily analytics:", dailyError)
        continue
      }

      // Insert referrers for this day
      const referrersForDay = referrersByDate[formattedDate] || []
      if (referrersForDay.length > 0) {
        console.log(`PROCESS_DATA: Inserting ${referrersForDay.length} referrers for date ${formattedDate}`)
        const { error: referrersError } = await supabase.from("referrers").insert(
          referrersForDay.map((referrer) => ({
            daily_analytics_id: dailyAnalytics.id,
            user_id: userId, // Add user_id
            source: referrer.source,
            visitors: referrer.visitors,
            date: formattedDate,
            created_at: new Date().toISOString(),
          })),
        )

        if (referrersError) {
          console.error("PROCESS_DATA: Error inserting referrers:", referrersError)
        }
      }

      // Insert top pages for this day
      const pagesForDay = pagesByDate[formattedDate] || []
      if (pagesForDay.length > 0) {
        console.log(`PROCESS_DATA: Inserting ${pagesForDay.length} top pages for date ${formattedDate}`)
        const { error: pagesError } = await supabase.from("top_pages").insert(
          pagesForDay.map((page) => ({
            daily_analytics_id: dailyAnalytics.id,
            user_id: userId,
            page_path: page.pagePath,
            page_views: page.pageViews,
            avg_engagement_time: page.avgEngagementTime,
            date: formattedDate,
            created_at: new Date().toISOString(),
          })),
        )

        if (pagesError) {
          console.error("PROCESS_DATA: Error inserting top pages:", pagesError)
        }
      }

      // NEW: Insert geographic data for this day
      const geographicForDay = geographicByDate[formattedDate] || []
      if (geographicForDay.length > 0) {
        console.log(`PROCESS_DATA: Inserting ${geographicForDay.length} geographic records for date ${formattedDate}`)
        const { error: geographicError } = await supabase.from("geographic_analytics").insert(
          geographicForDay.map((geo) => ({
            daily_analytics_id: dailyAnalytics.id,
            user_id: userId,
            date: formattedDate,
            country: geo.country,
            country_code: geo.countryCode,
            city: geo.city,
            visitors: geo.visitors,
            page_views: geo.pageViews,
            created_at: new Date().toISOString(),
          })),
        )

        if (geographicError) {
          console.error("PROCESS_DATA: Error inserting geographic data:", geographicError)
        }
      }

      // NEW: Insert device data for this day
      const deviceForDay = deviceByDate[formattedDate] || []
      if (deviceForDay.length > 0) {
        console.log(`PROCESS_DATA: Inserting ${deviceForDay.length} device records for date ${formattedDate}`)
        const { error: deviceError } = await supabase.from("device_analytics").insert(
          deviceForDay.map((device) => ({
            daily_analytics_id: dailyAnalytics.id,
            user_id: userId,
            date: formattedDate,
            device_category: device.deviceCategory,
            browser: device.browser,
            operating_system: device.operatingSystem,
            visitors: device.visitors,
            page_views: device.pageViews,
            created_at: new Date().toISOString(),
          })),
        )

        if (deviceError) {
          console.error("PROCESS_DATA: Error inserting device data:", deviceError)
        }
      }
    }
  }

  // Verify data was stored
  const { data: verifyData, error: verifyError } = await supabase
    .from("daily_analytics")
    .select("count")
    .eq("user_id", userId)

  if (verifyError) {
    console.error("PROCESS_DATA: Error verifying data:", verifyError)
  } else {
    console.log(`PROCESS_DATA: Verified ${verifyData?.[0]?.count || 0} records stored in daily_analytics`)
  }

  // Verify top pages were stored
  const { data: verifyPages, error: verifyPagesError } = await supabase
    .from("top_pages")
    .select("count")
    .eq("user_id", userId)

  if (verifyPagesError) {
    console.error("PROCESS_DATA: Error verifying top pages:", verifyPagesError)
  } else {
    console.log(`PROCESS_DATA: Verified ${verifyPages?.[0]?.count || 0} records stored in top_pages`)
  }

  // Verify referrers were stored
  const { data: verifyReferrers, error: verifyReferrersError } = await supabase
    .from("referrers")
    .select("count")
    .eq("user_id", userId)

  if (verifyReferrersError) {
    console.error("PROCESS_DATA: Error verifying referrers:", verifyReferrersError)
  } else {
    console.log(`PROCESS_DATA: Verified ${verifyReferrers?.[0]?.count || 0} records stored in referrers`)
  }

  // NEW: Verify geographic data was stored
  const { data: verifyGeographic, error: verifyGeographicError } = await supabase
    .from("geographic_analytics")
    .select("count")
    .eq("user_id", userId)

  if (verifyGeographicError) {
    console.error("PROCESS_DATA: Error verifying geographic data:", verifyGeographicError)
  } else {
    console.log(`PROCESS_DATA: Verified ${verifyGeographic?.[0]?.count || 0} records stored in geographic_analytics`)
  }

  // NEW: Verify device data was stored
  const { data: verifyDevice, error: verifyDeviceError } = await supabase
    .from("device_analytics")
    .select("count")
    .eq("user_id", userId)

  if (verifyDeviceError) {
    console.error("PROCESS_DATA: Error verifying device data:", verifyDeviceError)
  } else {
    console.log(`PROCESS_DATA: Verified ${verifyDevice?.[0]?.count || 0} records stored in device_analytics`)
  }

  await detectAndStoreEvents(userId)

  return true
}

// Add this helper function to properly format Google Analytics dates
function formatGoogleAnalyticsDate(gaDate: string): string {
  // Google Analytics returns dates in format YYYYMMDD (e.g., 20250417)
  // We need to convert it to YYYY-MM-DD
  console.log(`Formatting GA date: ${gaDate}`)

  if (gaDate.length === 8) {
    // Format is YYYYMMDD
    const year = gaDate.substring(0, 4)
    const month = gaDate.substring(4, 6)
    const day = gaDate.substring(6, 8)
    return `${year}-${month}-${day}`
  } else if (gaDate.includes("-")) {
    // If it's already in YYYY-MM format, add the day
    if (gaDate.length === 7) {
      return `${gaDate}-01`
    }
    // If it's already in YYYY-MM-DD format, return as is
    return gaDate
  } else {
    // For any other format, log an error and return a fallback date
    console.error(`PROCESS_DATA: Invalid date format from Google Analytics: ${gaDate}`)
    return new Date().toISOString().split("T")[0] // Today's date as fallback
  }
}

// Detect and store events
async function detectAndStoreEvents(userId: string) {
  const supabase = await createClient()

  const endDate = new Date()
  const startDate = subDays(endDate, 30)

  const { data: analytics, error } = await supabase
    .from("daily_analytics")
    .select("*")
    .eq("user_id", userId)
    .gte("date", format(startDate, "yyyy-MM-dd"))
    .lte("date", format(endDate, "yyyy-MM-dd"))
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching analytics for event detection:", error)
    return
  }

  // Return early if no data found
  if (!analytics || analytics.length === 0) {
    console.log("No analytics data found for event detection, skipping")
    return
  }

  for (let i = 1; i < analytics.length; i++) {
    const yesterday = analytics[i - 1]
    const today = analytics[i]

    if (yesterday.visitors > 0 && today.visitors > yesterday.visitors * 1.5) {
      await supabase.from("events").upsert({
        user_id: userId,
        date: today.date,
        event_type: "spike",
        title: "Traffic Spike",
        description: `Your traffic increased by ${Math.round(((today.visitors - yesterday.visitors) / yesterday.visitors) * 100)}% from yesterday`,
        value: today.visitors,
        created_at: new Date().toISOString(),
      })
    }
  }

  const milestones = [100, 500, 1000, 5000, 10000]
  for (const milestone of milestones) {
    for (let i = 1; i < analytics.length; i++) {
      const yesterday = analytics[i - 1]
      const today = analytics[i]

      if (yesterday.visitors < milestone && today.visitors >= milestone) {
        await supabase.from("events").upsert({
          user_id: userId,
          date: today.date,
          event_type: "milestone",
          title: `${milestone} Visitors Milestone`,
          description: `Congratulations! Your site reached ${milestone} visitors in a day`,
          value: today.visitors,
          created_at: new Date().toISOString(),
        })
      }
    }
  }

  for (let i = 1; i < analytics.length; i++) {
    const yesterday = analytics[i - 1]
    const today = analytics[i]

    if (yesterday.visitors > 10 && today.visitors < yesterday.visitors * 0.7) {
      await supabase.from("events").upsert({
        user_id: userId,
        date: today.date,
        event_type: "drop",
        title: "Traffic Drop",
        description: `Your traffic decreased by ${Math.round(((yesterday.visitors - today.visitors) / yesterday.visitors) * 100)}% from yesterday`,
        value: today.visitors,
        created_at: new Date().toISOString(),
      })
    }
  }

  let streakDays = 1
  let streakStart = 0

  for (let i = 1; i < analytics.length; i++) {
    if (analytics[i].visitors > analytics[i - 1].visitors) {
      streakDays++
      if (streakDays === 2) streakStart = i - 1
    } else {
      if (streakDays >= 5) {
        await supabase.from("events").upsert({
          user_id: userId,
          date: analytics[i - 1].date,
          event_type: "streak",
          title: `${streakDays} Day Growth Streak`,
          description: `Your site had ${streakDays} consecutive days of traffic growth`,
          value: streakDays,
          created_at: new Date().toISOString(),
        })
      }
      streakDays = 1
    }
  }

  if (streakDays >= 5) {
    await supabase.from("events").upsert({
      user_id: userId,
      date: analytics[analytics.length - 1].date,
      event_type: "streak",
      title: `${streakDays} Day Growth Streak`,
      description: `Your site had ${streakDays} consecutive days of traffic growth`,
      value: streakDays,
      created_at: new Date().toISOString(),
    })
  }

  return true
}

// Cache the analytics data fetching
export const fetchAnalyticsForDateRange = cache(async (userId: string, startDate: string, endDate: string) => {
  console.log(`FETCH_DATA: Fetching analytics from Supabase for date range ${startDate} to ${endDate}`)
  const supabase = await createClient()

  const { data: analytics, error } = await supabase
    .from("daily_analytics")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) {
    console.error("FETCH_DATA: Error fetching analytics from Supabase:", error)
    return []
  }

  console.log(`FETCH_DATA: Successfully fetched ${analytics?.length || 0} records from Supabase`)
  return analytics || []
})

// Cache the events data fetching
export const fetchEventsForDateRange = cache(async (userId: string, startDate: string, endDate: string) => {
  console.log(`FETCH_DATA: Fetching events from Supabase for date range ${startDate} to ${endDate}`)
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) {
    console.error("FETCH_DATA: Error fetching events from Supabase:", error)
    return []
  }

  console.log(`FETCH_DATA: Successfully fetched ${events?.length || 0} events from Supabase`)
  return events || []
})

// Cache the referrers data fetching
export const fetchReferrersForDateRange = cache(async (userId: string, startDate: string, endDate: string) => {
  console.log(`FETCH_DATA: Fetching referrers from Supabase for date range ${startDate} to ${endDate}`)
  const supabase = await createClient()

  try {
    // First, get the daily_analytics IDs for the date range
    const { data: analytics, error: analyticsError } = await supabase
      .from("daily_analytics")
      .select("id")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)

    if (analyticsError) {
      console.error("FETCH_DATA: Error fetching daily_analytics IDs:", analyticsError)
      return []
    }

    if (!analytics || analytics.length === 0) {
      console.log("FETCH_DATA: No daily_analytics records found for date range")
      return []
    }

    const analyticsIds = analytics.map((item) => item.id)

    // Then, get the referrers for those IDs
    const { data: referrers, error: referrersError } = await supabase
      .from("referrers")
      .select("source, visitors")
      .in("daily_analytics_id", analyticsIds)

    if (referrersError) {
      console.error("FETCH_DATA: Error fetching referrers:", referrersError)
      return []
    }

    // Properly aggregate referrers by source
    const aggregatedReferrers: Record<string, number> = {}
    for (const referrer of referrers || []) {
      if (referrer.source && referrer.visitors) {
        if (aggregatedReferrers[referrer.source]) {
          aggregatedReferrers[referrer.source] += referrer.visitors
        } else {
          aggregatedReferrers[referrer.source] = referrer.visitors
        }
      }
    }

    const result = Object.entries(aggregatedReferrers)
      .map(([source, visitors]) => ({ source, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10)

    console.log(`FETCH_DATA: Successfully aggregated ${result.length} referrers from Supabase`)
    return result
  } catch (error) {
    console.error("FETCH_DATA: Error in fetchReferrersForDateRange:", error)
    return []
  }
})

// Update the fetchTopPagesForDateRange function to include avg_engagement_time

export const fetchTopPagesForDateRange = cache(async (userId: string, startDate: string, endDate: string) => {
  console.log(`FETCH_DATA: Fetching top pages from Supabase for date range ${startDate} to ${endDate}`)
  const supabase = await createClient()

  try {
    // First, get the daily_analytics IDs for the date range
    const { data: analytics, error: analyticsError } = await supabase
      .from("daily_analytics")
      .select("id")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)

    if (analyticsError) {
      console.error("FETCH_DATA: Error fetching daily_analytics IDs:", analyticsError)
      return []
    }

    if (!analytics || analytics.length === 0) {
      console.log("FETCH_DATA: No daily_analytics records found for date range")
      return []
    }

    const analyticsIds = analytics.map((item) => item.id)

    // Then, get the top pages for those IDs
    const { data: pages, error: pagesError } = await supabase
      .from("top_pages")
      .select("page_path, page_views, avg_engagement_time")
      .in("daily_analytics_id", analyticsIds)

    if (pagesError) {
      console.error("FETCH_DATA: Error fetching top pages:", pagesError)
      return []
    }

    // Properly aggregate pages by path
    const aggregatedPages: Record<string, { views: number; engagementTimes: number[]; totalEngagementTime: number }> =
      {}

    for (const page of pages || []) {
      if (page.page_path && page.page_views) {
        if (!aggregatedPages[page.page_path]) {
          aggregatedPages[page.page_path] = {
            views: 0,
            engagementTimes: [],
            totalEngagementTime: 0,
          }
        }

        aggregatedPages[page.page_path].views += page.page_views

        // If we have engagement time data, add it
        if (page.avg_engagement_time) {
          aggregatedPages[page.page_path].engagementTimes.push(page.avg_engagement_time)
          aggregatedPages[page.page_path].totalEngagementTime += page.avg_engagement_time
        }
      }
    }

    // Calculate average engagement time and format the result
    const result = Object.entries(aggregatedPages)
      .map(([page_path, data]) => {
        const avg_engagement_time =
          data.engagementTimes.length > 0 ? data.totalEngagementTime / data.engagementTimes.length : 0

        return {
          page_path,
          page_views: data.views,
          avg_engagement_time,
        }
      })
      .sort((a, b) => b.page_views - a.page_views)
      .slice(0, 50) // Get more to allow for expansion

    console.log(`FETCH_DATA: Successfully aggregated ${result.length} top pages from Supabase`)
    return result
  } catch (error) {
    console.error("FETCH_DATA: Error in fetchTopPagesForDateRange:", error)
    return []
  }
})

// Add this new function to the file - keep all existing code
export const fetchTopPagesWithEngagementForDateRange = cache(
  async (userId: string, startDate: string, endDate: string) => {
    console.log(
      `FETCH_DATA: Fetching top pages with engagement from Supabase for date range ${startDate} to ${endDate}`,
    )
    const supabase = await createClient()

    try {
      // First, get the daily_analytics IDs for the date range
      const { data: analytics, error: analyticsError } = await supabase
        .from("daily_analytics")
        .select("id")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)

      if (analyticsError) {
        console.error("FETCH_DATA: Error fetching daily_analytics IDs:", analyticsError)
        return []
      }

      if (!analytics || analytics.length === 0) {
        console.log("FETCH_DATA: No daily_analytics records found for date range")
        return []
      }

      const analyticsIds = analytics.map((item) => item.id)

      // Then, get the top pages for those IDs
      const { data: pages, error: pagesError } = await supabase
        .from("top_pages")
        .select("page_path, page_views, avg_engagement_time")
        .in("daily_analytics_id", analyticsIds)

      if (pagesError) {
        console.error("FETCH_DATA: Error fetching top pages:", pagesError)
        return []
      }

      // Properly aggregate pages by path
      const aggregatedPages: Record<string, { views: number; engagementTimes: number[]; totalEngagementTime: number }> =
        {}

      for (const page of pages || []) {
        if (page.page_path && page.page_views) {
          if (!aggregatedPages[page.page_path]) {
            aggregatedPages[page.page_path] = {
              views: 0,
              engagementTimes: [],
              totalEngagementTime: 0,
            }
          }

          aggregatedPages[page.page_path].views += page.page_views

          // If we have engagement time data, add it
          if (page.avg_engagement_time) {
            aggregatedPages[page.page_path].engagementTimes.push(page.avg_engagement_time)
            aggregatedPages[page.page_path].totalEngagementTime += page.avg_engagement_time
          }
        }
      }

      // Calculate average engagement time and format the result
      const result = Object.entries(aggregatedPages)
        .map(([page_path, data]) => {
          const avg_engagement_time =
            data.engagementTimes.length > 0 ? data.totalEngagementTime / data.engagementTimes.length : 0

          return {
            page_path,
            page_views: data.views,
            avg_engagement_time,
          }
        })
        .sort((a, b) => b.page_views - a.page_views)
        .slice(0, 50) // Get top 50 to allow for expansion

      console.log(`FETCH_DATA: Successfully aggregated ${result.length} top pages with engagement from Supabase`)
      return result
    } catch (error) {
      console.error("FETCH_DATA: Error in fetchTopPagesWithEngagementForDateRange:", error)
      return []
    }
  },
)

// NEW: Fetch geographic data for date range
export const fetchGeographicDataForDateRange = cache(async (userId: string, startDate: string, endDate: string) => {
  console.log(`FETCH_DATA: Fetching geographic data from Supabase for date range ${startDate} to ${endDate}`)
  const supabase = await createClient()

  try {
    const { data: geographic, error } = await supabase
      .from("geographic_analytics")
      .select("country, country_code, city, visitors, page_views")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)

    if (error) {
      console.error("FETCH_DATA: Error fetching geographic data:", error)
      return []
    }

    // Aggregate by country
    const countryStats: Record<string, { visitors: number; pageViews: number; cities: Set<string> }> = {}

    for (const geo of geographic || []) {
      if (!countryStats[geo.country]) {
        countryStats[geo.country] = {
          visitors: 0,
          pageViews: 0,
          cities: new Set(),
        }
      }

      countryStats[geo.country].visitors += geo.visitors
      countryStats[geo.country].pageViews += geo.page_views
      if (geo.city) {
        countryStats[geo.country].cities.add(geo.city)
      }
    }

    const result = Object.entries(countryStats)
      .map(([country, stats]) => ({
        country,
        visitors: stats.visitors,
        pageViews: stats.pageViews,
        cities: Array.from(stats.cities),
        cityCount: stats.cities.size,
      }))
      .sort((a, b) => b.visitors - a.visitors)

    console.log(`FETCH_DATA: Successfully aggregated ${result.length} countries from Supabase`)
    return result
  } catch (error) {
    console.error("FETCH_DATA: Error in fetchGeographicDataForDateRange:", error)
    return []
  }
})

// NEW: Fetch device data for date range
export const fetchDeviceDataForDateRange = cache(async (userId: string, startDate: string, endDate: string) => {
  console.log(`FETCH_DATA: Fetching device data from Supabase for date range ${startDate} to ${endDate}`)
  const supabase = await createClient()

  try {
    const { data: devices, error } = await supabase
      .from("device_analytics")
      .select("device_category, browser, operating_system, visitors, page_views")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)

    if (error) {
      console.error("FETCH_DATA: Error fetching device data:", error)
      return []
    }

    // Aggregate by device category
    const deviceStats: Record<string, number> = {}
    const browserStats: Record<string, number> = {}
    const osStats: Record<string, number> = {}

    for (const device of devices || []) {
      // Device category aggregation
      if (device.device_category) {
        deviceStats[device.device_category] = (deviceStats[device.device_category] || 0) + device.visitors
      }

      // Browser aggregation
      if (device.browser) {
        browserStats[device.browser] = (browserStats[device.browser] || 0) + device.visitors
      }

      // OS aggregation
      if (device.operating_system) {
        osStats[device.operating_system] = (osStats[device.operating_system] || 0) + device.visitors
      }
    }

    const result = {
      devices: Object.entries(deviceStats)
        .map(([category, visitors]) => ({ category, visitors }))
        .sort((a, b) => b.visitors - a.visitors),
      browsers: Object.entries(browserStats)
        .map(([browser, visitors]) => ({ browser, visitors }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 10),
      operatingSystems: Object.entries(osStats)
        .map(([os, visitors]) => ({ os, visitors }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 10),
    }

    console.log(`FETCH_DATA: Successfully aggregated device data from Supabase`)
    return result
  } catch (error) {
    console.error("FETCH_DATA: Error in fetchDeviceDataForDateRange:", error)
    return { devices: [], browsers: [], operatingSystems: [] }
  }
})
