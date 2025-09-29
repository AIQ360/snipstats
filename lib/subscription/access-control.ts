import { createClient } from "@/utils/supabase/server"
import { getUserTrialStatus } from "./trial"

export async function checkSubscriptionAccess(userId: string): Promise<{
  hasAccess: boolean
  reason?: string
}> {
  const supabase = await createClient()

  // Check if user has active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  if (subscription) {
    return { hasAccess: true }
  }

  // Check if user is in trial period
  const trialStatus = await getUserTrialStatus(userId)

  if (trialStatus.isInTrial) {
    return {
      hasAccess: true,
      reason: `Trial (${trialStatus.daysRemaining} days remaining)`,
    }
  }

  return {
    hasAccess: false,
    reason: "Trial expired or no active subscription",
  }
}
