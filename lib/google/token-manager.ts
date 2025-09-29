import { createClientServerSupabaseClient } from "@/utils/supabase/client-server"
import { getOAuth2Client } from "./auth"

// Token status enum
export enum TokenStatus {
  VALID = "valid",
  EXPIRED = "expired",
  INVALID = "invalid",
  UNKNOWN = "unknown",
}

// Check if a token is valid
export async function checkTokenValidity(userId: string): Promise<{
  isValid: boolean
  status: TokenStatus
  message: string
}> {
  console.log(`TOKEN_CHECK: Checking token validity for user ${userId}`)
  const supabase = createClientServerSupabaseClient()

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
      console.log("TOKEN_CHECK: No GA account found")
      return {
        isValid: false,
        status: TokenStatus.UNKNOWN,
        message: "No Google Analytics account connected",
      }
    }

    // Check if token is marked as invalid in our database
    if (gaAccount.token_status === "invalid") {
      console.log("TOKEN_CHECK: Token is marked as invalid in database")
      return {
        isValid: false,
        status: TokenStatus.INVALID,
        message: "Authentication token is invalid, please reconnect your Google account",
      }
    }

    // Check if access token is expired
    if (gaAccount.token_expiry) {
      const expiryDate = new Date(gaAccount.token_expiry)
      if (expiryDate < new Date()) {
        console.log("TOKEN_CHECK: Access token is expired, attempting refresh")

        // Try to refresh the token
        try {
          await refreshAccessToken(userId, gaAccount.refresh_token)
          return {
            isValid: true,
            status: TokenStatus.VALID,
            message: "Token refreshed successfully",
          }
        } catch (refreshError) {
          console.error("TOKEN_CHECK: Failed to refresh token:", refreshError)

          // Mark token as invalid in database
          await markTokenAsInvalid(userId)

          return {
            isValid: false,
            status: TokenStatus.INVALID,
            message: "Failed to refresh token, please reconnect your Google account",
          }
        }
      }
    }

    // If we got here, token should be valid
    return {
      isValid: true,
      status: TokenStatus.VALID,
      message: "Token is valid",
    }
  } catch (error) {
    console.error("TOKEN_CHECK: Error checking token validity:", error)
    return {
      isValid: false,
      status: TokenStatus.UNKNOWN,
      message: "Error checking token validity",
    }
  }
}

// Refresh access token
export async function refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
  console.log(`TOKEN_REFRESH: Refreshing access token for user ${userId}`)
  const supabase = createClientServerSupabaseClient()

  try {
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    })

    const response = await oauth2Client.refreshAccessToken()
    const tokens = response.credentials

    if (!tokens.access_token) {
      throw new Error("No access token returned from refresh")
    }

    // Update the token in the database
    const { error: updateError } = await supabase
      .from("ga_accounts")
      .update({
        access_token: tokens.access_token,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        token_status: "valid",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("TOKEN_REFRESH: Error updating token in database:", updateError)
      throw updateError
    }

    return tokens.access_token
  } catch (error) {
    console.error("TOKEN_REFRESH: Error refreshing token:", error)

    // If the refresh token is invalid, mark it as such
    if (error.message?.includes("invalid_grant")) {
      await markTokenAsInvalid(userId)
    }

    throw error
  }
}

// Mark token as invalid in database
export async function markTokenAsInvalid(userId: string): Promise<void> {
  console.log(`TOKEN_MARK: Marking token as invalid for user ${userId}`)
  const supabase = createClientServerSupabaseClient()

  const { error } = await supabase
    .from("ga_accounts")
    .update({
      token_status: "invalid",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (error) {
    console.error("TOKEN_MARK: Error marking token as invalid:", error)
    throw error
  }
}

// Handle token validation with redirect if needed
export async function validateTokenWithRedirect(userId: string): Promise<{
  isValid: boolean
  status: TokenStatus
  redirectUrl?: string
}> {
  const { isValid, status } = await checkTokenValidity(userId)

  if (!isValid) {
    // Return redirect info if token is invalid
    if (status === TokenStatus.INVALID) {
      return { isValid, status, redirectUrl: "/connect-ga/reconnect" }
    }
    return { isValid, status }
  }

  return { isValid, status }
}
