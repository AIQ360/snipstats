"use server"

import { logger } from "@/lib/logger"
import { createClient } from "@/utils/supabase/server"

export async function markReferralConverted(userId: string) {
  logger.info(`[Server Action] Marking referral as converted for user ${userId}`)
  const supabase = await createClient()

  try {
    // Check if there's a referral for this user
    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .select("id, converted")
      .eq("referred_user_id", userId)
      .single()

    if (referralError) {
      if (referralError.code === "PGRST116") {
        // No referral found - this is normal for users who weren't referred
        logger.info(`[Server Action] No referral found for user ${userId}`)
        return { success: true, message: "No referral to convert" }
      }

      logger.error(`[Server Action] Error checking for referral:`, referralError)
      return { success: false, error: "Failed to check for referral" }
    }

    // If already converted, just return success
    if (referral.converted) {
      logger.info(`[Server Action] Referral for user ${userId} already converted`)
      return { success: true, message: "Referral already converted" }
    }

    // Update the referral to mark as converted
    const { error: updateError } = await supabase
      .from("referrals")
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
      })
      .eq("id", referral.id)

    if (updateError) {
      logger.error(`[Server Action] Error updating referral:`, updateError)
      return { success: false, error: "Failed to update referral" }
    }

    logger.info(`[Server Action] Successfully marked referral ${referral.id} as converted for user ${userId}`)
    return { success: true }
  } catch (error) {
    logger.error(`[Server Action] Error marking referral as converted:`, error)
    return { success: false, error: "Server error" }
  }
}
