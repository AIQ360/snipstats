import { type NextRequest, NextResponse } from "next/server"
import { getGoogleAnalyticsAccounts } from "@/lib/google/auth"
import { createClient } from "@/utils/supabase/server"

interface RequestBody {
  accessToken: string
  refreshToken?: string
  accountId: string
  userId?: string
}

interface Property {
  propertyId: string
  displayName: string
  websiteUrl: string
  accountId: string
  accountName: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("API: User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { accessToken, accountId } = (await request.json()) as RequestBody

    if (!accessToken) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 })
    }

    // Fetch properties directly from the accountSummaries endpoint
    const properties = await getGoogleAnalyticsAccounts(accessToken)

    // Filter properties by accountId if provided
    const filteredProperties = accountId
      ? properties.filter((prop: Property) => prop.accountId === accountId)
      : properties

    return NextResponse.json({
      properties: filteredProperties.map((property: Property) => ({
        id: `properties/${property.propertyId}`,
        displayName: property.displayName,
        websiteUrl: property.websiteUrl,
        parent: `accounts/${property.accountId}`,
        accountName: property.accountName,
      })),
    })
  } catch (error: unknown) {
    console.error("Error fetching Google Analytics properties:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: "Failed to fetch properties",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
