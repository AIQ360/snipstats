import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getGoogleOAuthTokens } from "@/lib/google/auth"

export async function GET(request: NextRequest) {
  console.log("Google callback route triggered")
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")

  // Handle errors from Google
  if (error) {
    console.error("Error from Google:", error)
    return NextResponse.redirect(`${requestUrl.origin}/connect-ga?error=${error}`)
  }

  // If no code, redirect to connect-ga
  if (!code) {
    console.error("No code provided in callback")
    return NextResponse.redirect(`${requestUrl.origin}/connect-ga?error=no_code`)
  }

  try {
    console.log("Getting tokens from Google")
    // Exchange code for tokens
    const tokens = await getGoogleOAuthTokens(code, requestUrl.origin)
    console.log("Tokens received:", {
      accessTokenReceived: !!tokens.access_token,
      refreshTokenReceived: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    })

    // Get the user from Supabase
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User not authenticated:", userError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=not_authenticated`)
    }

    // Check if user already has a GA account
    const { data: existingAccount, error: fetchError } = await supabase
      .from("ga_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log("Existing account check:", { exists: !!existingAccount, error: fetchError?.message })

    // If user has an existing account, update it with new tokens
    if (existingAccount) {
      console.log("Updating existing GA account with new tokens")
      const { error: updateError } = await supabase
        .from("ga_accounts")
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          token_status: "valid", // Set token status to valid
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAccount.id)

      if (updateError) {
        console.error("Error updating GA account:", updateError)
        return NextResponse.redirect(`${requestUrl.origin}/connect-ga?error=db_error`)
      }
    } else {
      // If no existing account, create a new one with pending property selection
      console.log("Creating new GA account with pending property selection")
      const { error: insertError } = await supabase.from("ga_accounts").insert({
        user_id: user.id,
        ga_account_id: "pending",
        ga_property_id: "pending_selection",
        property_name: "pending",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        token_status: "valid", // Set token status to valid
        data_consent: true,
        website_url: "pending",
      })

      if (insertError) {
        console.error("Error creating GA account:", insertError)
        return NextResponse.redirect(`${requestUrl.origin}/connect-ga?error=db_error`)
      }
    }

    // Encode the session for URL
    const sessionParam = encodeURIComponent(
      JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      }),
    )

    // Redirect to select-account page with session
    return NextResponse.redirect(`${requestUrl.origin}/connect-ga/select-account?session=${sessionParam}`)
  } catch (error) {
    console.error("Error in Google callback:", error)
    return NextResponse.redirect(
      `${requestUrl.origin}/connect-ga?error=${encodeURIComponent(
        error instanceof Error ? error.message : "unknown_error",
      )}`,
    )
  }
}
