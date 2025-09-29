import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createSubscription } from "@/lib/payments/dodo-api"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function POST(request: Request) {
  try {
    const { currentSubscriptionId, newPlanId } = await request.json()

    if (!currentSubscriptionId || !newPlanId) {
      return NextResponse.json({ error: "Current subscription ID and new plan ID are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the current subscription from database
    const { data: currentSubscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("dodo_subscription_id", currentSubscriptionId)
      .single()

    if (subscriptionError || !currentSubscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Get the new plan
    const { data: newPlan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", newPlanId)
      .single()

    if (planError || !newPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Get the current plan
    const { data: currentPlan, error: currentPlanError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", currentSubscription.plan_id)
      .single()

    if (currentPlanError) {
      console.error("Error fetching current plan:", currentPlanError)
    }

    // Verify the new plan is an upgrade (higher price)
    if (currentPlan && newPlan.price <= currentPlan.price) {
      return NextResponse.json({ error: "New plan must have a higher price than the current plan" }, { status: 400 })
    }

    try {
      // Mark the current subscription as pending upgrade
      await supabase
        .from("subscriptions")
        .update({
          pending_upgrade_plan_id: newPlanId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSubscription.id)

      // Create a new subscription with the new plan
      const subscriptionData = await createSubscription({
        plan_id: newPlan.dodo_product_id,
        customer: {
          email: user.email || "",
          name: user.user_metadata?.full_name || user.email || "Customer",
        },
        return_url: `${APP_URL}/dashboard/profile?subscription_success=true&upgrade=true`,
        cancel_url: `${APP_URL}/dashboard/profile?subscription_error=upgrade_failed`,
        metadata: {
          user_id: user.id,
          plan_id: newPlanId,
          previous_subscription_id: currentSubscription.id,
        },
      })

      // Create a pending subscription record
      await supabase.from("pending_subscriptions").insert({
        user_id: user.id,
        plan_id: newPlanId,
        dodo_checkout_id: subscriptionData.checkout_id,
        previous_subscription_id: currentSubscription.id,
      })

      return NextResponse.json({
        success: true,
        checkoutUrl: subscriptionData.payment_link,
      })
    } catch (error) {
      console.error("Error upgrading subscription:", error)
      return NextResponse.json({ error: "Failed to upgrade subscription", details: error.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing upgrade request:", error)
    return NextResponse.json({ error: "Failed to process upgrade request", details: error.message }, { status: 500 })
  }
}
