// api/google/save-property/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  console.log("SAVE_PROPERTY: Starting property save...")
  const supabase = await createClient()

  // Debug authentication
  const headers = Object.fromEntries(request.headers)
  console.log("SAVE_PROPERTY: Request headers:", headers)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  console.log("SAVE_PROPERTY: Auth result - User:", user?.id, "Error:", userError?.message)

  if (userError || !user) {
    console.log("SAVE_PROPERTY: User not authenticated - Details:", userError?.message)
    return NextResponse.json({ error: "Not authenticated", details: userError?.message }, { status: 401 })
  }

  console.log("SAVE_PROPERTY: User authenticated - ID:", user.id)

  try {
    const body = await request.json()
    const { propertyId, accountId, propertyName, websiteUrl } = body

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    }

    console.log(
      `SAVE_PROPERTY: Saving property for user ${user.id}: ${propertyId} (${propertyName}), Account ID: ${accountId}`,
    )

    // Initialize fetch status
    await supabase
      .from("data_fetch_status")
      .upsert({
        user_id: user.id,
        status: "pending",
        message: "Preparing to fetch data",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    // Check if the user already has a GA account entry
    const { data: existingAccount, error: checkError } = await supabase
      .from("ga_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("SAVE_PROPERTY: Error checking existing GA account:", checkError.message)
      return NextResponse.json({ error: "Failed to check existing GA account" }, { status: 500 })
    }

    let gaAccountId
    if (existingAccount) {
      // Update existing account
      console.log(`SAVE_PROPERTY: Updating existing GA account with ID ${existingAccount.id}`)
      const { error: updateError } = await supabase
        .from("ga_accounts")
        .update({
          ga_property_id: propertyId,
          ga_account_id: accountId, // Save the account ID
          property_name: propertyName || existingAccount.property_name,
          website_url: websiteUrl || existingAccount.website_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAccount.id)

      if (updateError) {
        console.error("SAVE_PROPERTY: Error updating GA account:", updateError.message)
        return NextResponse.json({ error: "Failed to update GA account" }, { status: 500 })
      }
      gaAccountId = existingAccount.id
    } else {
      // Create new account (should happen if no account exists)
      console.log("SAVE_PROPERTY: Creating new GA account for user")
      const { data: newAccount, error: insertError } = await supabase
        .from("ga_accounts")
        .insert({
          user_id: user.id,
          ga_property_id: propertyId,
          ga_account_id: accountId, // Save the account ID
          property_name: propertyName || null,
          website_url: websiteUrl || "https://example.com",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (insertError) {
        console.error("SAVE_PROPERTY: Error creating GA account:", insertError.message)
        return NextResponse.json({ error: "Failed to create GA account" }, { status: 500 })
      }
      gaAccountId = newAccount.id
    }

    // Trigger initial data fetch
    try {
      console.log("SAVE_PROPERTY: Triggering initial data fetch directly...")

      // Instead of making a fetch request, we'll call the initial fetch function directly
      // This ensures the authentication session is maintained
      const { NextResponse } = await import("next/server")
      const { processRequest } = await import("@/app/api/analytics/initial-fetch/route")

      const result = await processRequest({
        days: 30,
        propertyId,
        userId: user.id,
      })

      if (!result.success) {
        console.warn("SAVE_PROPERTY: Initial fetch triggered but failed:", result.error)

        // Update fetch status to error
        await supabase
          .from("data_fetch_status")
          .upsert({
            user_id: user.id,
            status: "error",
            message: `Failed to start data fetch: ${result.error}`,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
      } else {
        console.log("SAVE_PROPERTY: Initial fetch triggered successfully")
      }
    } catch (fetchError) {
      console.error("SAVE_PROPERTY: Error triggering initial data fetch:", fetchError)

      // Update fetch status to error
      await supabase
        .from("data_fetch_status")
        .upsert({
          user_id: user.id,
          status: "error",
          message: `Error triggering data fetch: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
    }

    console.log("SAVE_PROPERTY: Property saved successfully")
    return NextResponse.json({
      success: true,
      userId: user.id,
      propertyId,
      accountId: gaAccountId,
      fetchStatus: "pending",
    })
  } catch (error: unknown) {
    console.error("SAVE_PROPERTY: Error saving property:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: "Failed to save property", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
