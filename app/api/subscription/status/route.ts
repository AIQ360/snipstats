import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import axios from "axios"

// Use the correct URL that returned 200 in our test
const DODO_API_URL = "https://test.dodopayments.com"

export async function GET(request: NextRequest) {
  console.log("STATUS: Checking subscription status")

  try {
    // Get the user from Supabase
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("STATUS: User not authenticated:", userError?.message || "No user found")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log(`STATUS: User authenticated: ${user.id}`)

    // Check if user has an active subscription in our database
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)

    const hasSubscription = subscriptions && subscriptions.length > 0
    const subscription = hasSubscription ? subscriptions[0] : null

    // If no subscription found, check for pending subscriptions
    if (!hasSubscription) {
      const { data: pendingSubscriptions } = await supabase
        .from("pending_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("processed", false)
        .order("created_at", { ascending: false })
        .limit(1)

      const hasPendingSubscription = pendingSubscriptions && pendingSubscriptions.length > 0

      if (hasPendingSubscription) {
        const pendingSubscription = pendingSubscriptions[0]

        // Check the status with Dodo
        try {
          const response = await axios({
            method: "get",
            url: `${DODO_API_URL}/subscriptions/${pendingSubscription.dodo_subscription_id}`,
            headers: {
              Authorization: `Bearer ${process.env.DODO_API_KEY}`,
              "Content-Type": "application/json",
            },
          })

          console.log(`STATUS: Pending subscription status:`, response.data.status)

          if (response.data.status === "active") {
            // Create a new subscription record
            const { data: plan } = await supabase
              .from("subscription_plans")
              .select("interval")
              .eq("id", pendingSubscription.plan_id)
              .single()

            // Calculate period end date
            const periodStart = new Date()
            const periodEnd = new Date(periodStart)

            if (plan.interval === "month") {
              periodEnd.setMonth(periodEnd.getMonth() + 1)
            } else {
              periodEnd.setFullYear(periodEnd.getFullYear() + 1)
            }

            // Create subscription record
            const { error: subscriptionError } = await supabase.from("subscriptions").insert({
              user_id: user.id,
              plan_id: pendingSubscription.plan_id,
              status: "active",
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
              dodo_subscription_id: pendingSubscription.dodo_subscription_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            if (subscriptionError) {
              console.error("STATUS: Error creating subscription record:", subscriptionError)
            } else {
              // Mark pending subscription as processed
              await supabase
                .from("pending_subscriptions")
                .update({
                  processed: true,
                  processed_at: new Date().toISOString(),
                })
                .eq("id", pendingSubscription.id)

              return NextResponse.json({
                status: "active",
                message: "Subscription activated from pending status",
                subscription: {
                  plan_id: pendingSubscription.plan_id,
                  status: "active",
                  current_period_end: periodEnd.toISOString(),
                },
              })
            }
          }
        } catch (apiError) {
          console.error("STATUS: Error checking pending subscription:", apiError)
        }
      }

      return NextResponse.json({ status: "inactive" })
    }

    // If subscription is active, return it
    if (subscription.status === "active") {
      return NextResponse.json({
        status: "active",
        subscription: subscription,
      })
    }

    // If subscription exists but is not active, check with Dodo
    try {
      const response = await axios({
        method: "get",
        url: `${DODO_API_URL}/subscriptions/${subscription.dodo_subscription_id}`,
        headers: {
          Authorization: `Bearer ${process.env.DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
      })

      console.log(`STATUS: Dodo subscription status:`, response.data.status)

      // Update our database if status has changed
      if (response.data.status !== subscription.status) {
        await supabase
          .from("subscriptions")
          .update({
            status: response.data.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.id)

        subscription.status = response.data.status
      }

      return NextResponse.json({
        status: subscription.status,
        subscription: subscription,
      })
    } catch (apiError) {
      console.error("STATUS: Error checking subscription with Dodo:", apiError)
      return NextResponse.json({
        status: subscription.status,
        subscription: subscription,
        error: "Failed to verify with payment provider",
      })
    }
  } catch (error) {
    console.error("STATUS: Error checking subscription status:", error)
    return NextResponse.json({ error: "Failed to check subscription status" }, { status: 500 })
  }
}
