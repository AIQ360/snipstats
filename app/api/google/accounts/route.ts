import { type NextRequest, NextResponse } from "next/server"
import { getGoogleAnalyticsAccounts } from "@/lib/google/auth"
import { createClient } from "@/utils/supabase/server"

interface RequestBody {
  accessToken: string
  refreshToken?: string
  userId?: string // Made optional to handle missing userId
}

export async function POST(request: NextRequest) {
  let body: RequestBody = { accessToken: "" }
  try {
    body = await request.json()
    console.log("Received request body:", body) // Debug log

    const { accessToken, refreshToken, userId: initialUserId } = body
    let userId = initialUserId

    // If userId is missing, fetch from authenticated session
    if (!userId) {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.id) {
        return NextResponse.json({ error: "User ID not provided and no authenticated user found" }, { status: 401 })
      }
      userId = user.id
      console.log("Fetched userId from session:", userId)
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 })
    }

    const accounts = await getGoogleAnalyticsAccounts(accessToken, refreshToken)

    // Store account and property info in Supabase
    const supabase = await createClient()
    const properties = accounts.flatMap((account: GoogleAnalyticsAccount) =>
      (account.propertySummaries || []).map((property: GoogleAnalyticsProperty) => ({
        accountId: account.account,
        propertyId: property.property,
        displayName: property.displayName,
        websiteUrl: property.websiteUrl || "pending",
      })),
    )

    if (properties.length > 0) {
      await supabase.from("ga_accounts").upsert(
        properties.map((prop: PropertyInfo) => ({
          user_id: userId,
          ga_account_id: prop.accountId.replace(/^accounts\//, ""),
          ga_property_id: prop.propertyId.replace(/^properties\//, ""),
          website_url: prop.websiteUrl,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          token_expiry: null,
          data_consent: true,
          updated_at: new Date().toISOString(),
        })),
      )
    }

    return NextResponse.json({
      accounts: accounts.map((account: GoogleAnalyticsAccount) => ({
        id: account.account,
        name: account.displayName,
        properties: (account.propertySummaries || []).map((property: GoogleAnalyticsProperty) => ({
          id: property.property,
          name: property.displayName,
          websiteUrl: property.websiteUrl,
          createTime: property.createTime,
          updateTime: property.updateTime,
        })),
      })),
    })
  } catch (error: unknown) {
    console.error("Error fetching Google Analytics accounts:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: body,
    })
    if (error instanceof Error) {
      if (error.message.includes("has not been used in project") || error.message.includes("is disabled")) {
        return NextResponse.json(
          {
            error:
              "Google Analytics Admin API is not enabled. Please enable it in the Google Cloud Console and try again.",
            enableApiUrl: `https://console.developers.google.com/apis/api/analyticsadmin.googleapis.com/overview?project=${
              error.message.match(/project ([0-9]+)/)?.[1] || ""
            }`,
          },
          { status: 403 },
        )
      }
      if (error.message.includes("does not have any Google Analytics account")) {
        return NextResponse.json(
          { error: "User does not have access to any Google Analytics accounts." },
          { status: 403 },
        )
      }
      if (error.message.includes("permission denied")) {
        return NextResponse.json(
          {
            error: "Insufficient permissions. Ensure the user has access to Google Analytics accounts.",
          },
          { status: 403 },
        )
      }
    }
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

interface GoogleAnalyticsAccount {
  account: string
  displayName: string
  propertySummaries?: GoogleAnalyticsProperty[]
}

interface GoogleAnalyticsProperty {
  property: string
  displayName: string
  websiteUrl?: string
  createTime?: string
  updateTime?: string
}

interface PropertyInfo {
  accountId: string
  propertyId: string
  displayName: string
  websiteUrl: string
}
