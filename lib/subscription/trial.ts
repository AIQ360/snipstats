import { createClient } from "@/utils/supabase/server"

export async function getUserTrialStatus(userId: string): Promise<{
  isInTrial: boolean
  trialEndsAt: Date | null
  daysRemaining: number | null
}> {
  const supabase = await createClient()

  // Check if user has an active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  if (subscription) {
    // User already has an active subscription
    return { isInTrial: false, trialEndsAt: null, daysRemaining: null }
  }

  // Get user creation date
  const { data: userProfile } = await supabase.from("user_profiles").select("created_at").eq("id", userId).single()

  if (!userProfile) {
    return { isInTrial: false, trialEndsAt: null, daysRemaining: null }
  }

  const createdAt = new Date(userProfile.created_at)
  const trialEndsAt = new Date(createdAt)
  trialEndsAt.setDate(trialEndsAt.getDate() + 14) // 14-day trial

  const now = new Date()
  const isInTrial = now < trialEndsAt

  // Calculate days remaining in trial
  const daysRemaining = isInTrial ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null

  return {
    isInTrial,
    trialEndsAt: isInTrial ? trialEndsAt : null,
    daysRemaining,
  }
}
