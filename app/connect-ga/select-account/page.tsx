import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getGoogleAnalyticsAccounts } from "@/lib/google/auth"
import { PropertySelector } from "./property-selector"

export const dynamic = "force-dynamic"

export default async function SelectAccountPage({
  searchParams,
}: {
  searchParams: { session?: string; error?: string }
}) {
  const supabase = await createClient()

  // Get user (secure server-side authentication)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.log("User not authenticated, redirecting to login")
    redirect("/login")
  }

  // Check if user already has a GA account with a property ID
  const { data: gaAccount, error: gaError } = await supabase
    .from("ga_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  console.log("GA Account check:", {
    exists: !!gaAccount,
    propertyId: gaAccount?.ga_property_id,
    hasAccessToken: !!gaAccount?.access_token,
    hasRefreshToken: !!gaAccount?.refresh_token,
  })

  // If they have a GA account with a valid property ID, redirect to dashboard
  if (
    gaAccount?.ga_property_id &&
    gaAccount.ga_property_id !== "pending_selection" &&
    gaAccount.ga_property_id !== "pending"
  ) {
    console.log("User already has a property selected, redirecting to dashboard")
    redirect("/dashboard")
  }

  // Get session from search params
  const { session: sessionParam, error } = searchParams
  let session

  try {
    if (sessionParam) {
      session = JSON.parse(decodeURIComponent(sessionParam))
      console.log("Parsed session from URL params:", {
        hasAccessToken: !!session?.access_token,
        hasRefreshToken: !!session?.refresh_token,
      })
    }
  } catch (e) {
    console.error("Error parsing session:", e)
    redirect("/connect-ga?error=invalid_session")
  }

  // Use the access token from the session or from the database
  const accessToken = session?.access_token || gaAccount?.access_token
  const refreshToken = session?.refresh_token || gaAccount?.refresh_token

  if (!accessToken) {
    console.log("No access token found, redirecting to connect-ga")
    redirect("/connect-ga?error=no_token")
  }

  try {
    console.log("Fetching Google Analytics accounts...")
    // Fetch Google Analytics accounts
    const properties = await getGoogleAnalyticsAccounts(accessToken, refreshToken)
    console.log(`Fetched ${properties.length} properties`)

    // Group properties by account
    const accountMap = new Map()

    properties.forEach((property) => {
      if (!accountMap.has(property.accountId)) {
        accountMap.set(property.accountId, {
          id: property.accountId,
          name: property.accountName,
          properties: [],
        })
      }

      accountMap.get(property.accountId).properties.push({
        id: property.propertyId,
        name: property.displayName,
        websiteUrl: property.websiteUrl,
      })
    })

    const accounts = Array.from(accountMap.values())
    console.log(`Grouped into ${accounts.length} accounts`)

    // If we have a session with tokens, ensure they're saved in the database
    if (session?.access_token && session?.refresh_token) {
      if (gaAccount) {
        // Update existing account with tokens from session
        console.log("Updating existing GA account with tokens from session")
        const { error: updateError } = await supabase
          .from("ga_accounts")
          .update({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            token_expiry: session.expiry_date ? new Date(session.expiry_date).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", gaAccount.id)

        if (updateError) {
          console.error("Error updating tokens:", updateError)
        }
      } else {
        // Create new account with tokens from session
        console.log("Creating new GA account with tokens from session")
        const { error: insertError } = await supabase.from("ga_accounts").insert({
          user_id: user.id,
          ga_account_id: "pending",
          ga_property_id: "pending_selection",
          property_name: "pending",
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          token_expiry: session.expiry_date ? new Date(session.expiry_date).toISOString() : null,
          data_consent: true,
          website_url: "pending",
        })

        if (insertError) {
          console.error("Error storing tokens:", insertError)
        }
      }
    }

    return (
      <div className="container max-w-5xl flex items-center justify-center py-8">
        <PropertySelector accounts={accounts} userId={user.id} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching Google Analytics accounts:", error)
    return (
      <div className="container max-w-5xl py-8">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
          Error fetching Google Analytics accounts. Please try again.
        </div>
      </div>
    )
  }
}
