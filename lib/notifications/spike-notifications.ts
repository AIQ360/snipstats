import { createClient } from "@/utils/supabase/server"
import { sendTrafficSpikeAlert } from "@/lib/email/resend"

export async function processAndSendSpikeNotifications() {
  const supabase = await createClient()

  // Get recent spike events that haven't been processed for emails
  const { data: spikeEvents, error } = await supabase
    .from("events")
    .select(`
      id, 
      user_id, 
      date, 
      event_type, 
      metric_name, 
      value, 
      previous_value,
      user_profiles:user_id (
        full_name,
        email_notifications,
        notification_email
      )
    `)
    .eq("event_type", "spike")
    .eq("email_sent", false)
    .order("date", { ascending: false })

  if (error || !spikeEvents?.length) {
    console.log("No new spike events to process or error:", error)
    return { processed: 0, errors: 0 }
  }

  console.log(`Processing ${spikeEvents.length} spike events for email notifications`)

  let processed = 0
  let errors = 0

  for (const event of spikeEvents) {
    // Skip if user has disabled email notifications
    if (event.user_profiles?.email_notifications === false) {
      await supabase.from("events").update({ email_sent: true }).eq("id", event.id)
      processed++
      continue
    }

    try {
      // Get user email - first check notification_email, then fall back to auth email
      let userEmail = event.user_profiles?.notification_email

      if (!userEmail) {
        // Fall back to auth email
        const { data: userData } = await supabase.auth.admin.getUserById(event.user_id)
        userEmail = userData?.user?.email
      }

      if (!userEmail) {
        console.log(`No email found for user ${event.user_id}, skipping notification`)
        await supabase.from("events").update({ email_sent: true }).eq("id", event.id)
        processed++
        continue
      }

      const userName = event.user_profiles?.full_name || "there"

      // Calculate percentage increase
      const previousValue = event.previous_value || 0
      const percentageIncrease =
        previousValue > 0 ? Math.round(((event.value - previousValue) / previousValue) * 100) : 100

      // Send email notification
      const emailResult = await sendTrafficSpikeAlert(userEmail, userName, {
        date: event.date,
        percentage: percentageIncrease,
        metric: event.metric_name || "traffic",
      })

      // Mark as processed
      if (emailResult.success) {
        await supabase
          .from("events")
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
          })
          .eq("id", event.id)

        console.log(`Sent spike notification email for event ${event.id} to ${userEmail}`)
        processed++
      } else {
        errors++
      }
    } catch (error) {
      console.error(`Failed to process spike event ${event.id}:`, error)
      errors++
    }
  }

  return { processed, errors }
}
