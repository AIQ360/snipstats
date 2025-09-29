import { NextResponse } from "next/server"
import { processAndSendSpikeNotifications } from "@/lib/notifications/spike-notifications"
import { createClient } from "@/utils/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Get current user for testing
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("TEST: Starting notification test...")

    // Check user's email preferences first
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("email_notifications, notification_email, full_name")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("TEST: Error fetching user profile:", profileError)
    }

    console.log("TEST: User email preferences:", {
      emailNotifications: profile?.email_notifications,
      notificationEmail: profile?.notification_email,
      fullName: profile?.full_name,
    })

    // Check for unprocessed spike events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .eq("event_type", "spike")
      .eq("email_sent", false)
      .order("date", { ascending: false })

    if (eventsError) {
      console.error("TEST: Error fetching events:", eventsError)
    }

    console.log(`TEST: Found ${events?.length || 0} unprocessed spike events`)

    // Process notifications
    const result = await processAndSendSpikeNotifications()

    return NextResponse.json({
      success: true,
      userProfile: profile,
      unprocessedEvents: events?.length || 0,
      processed: result.processed,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("TEST: Error in notification test:", error)
    return NextResponse.json(
      {
        error: "Failed to test notifications",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
