import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createSubscription } from "@/lib/payments/dodo-api"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.snipstats.com"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const planId = url.searchParams.get("planId")

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(new URL("/sign-in", APP_URL))
    }

    // Get user profile
    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    // Get the plan details
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Create a pending subscription record
    const { data: pendingSubscription, error: pendingError } = await supabase
      .from("pending_subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        created_at: new Date().toISOString(),
        processed: false,
      })
      .select()
      .single()

    if (pendingError) {
      console.error("Error creating pending subscription:", pendingError)
      // Continue anyway, this is just for tracking
    }

    try {
      // Create subscription in Dodo Payments
      const subscription = await createSubscription({
        plan_id: plan.dodo_product_id,
        customer: {
          email: user.email || "",
          name: profile?.full_name || user.email?.split("@")[0] || "Customer",
          metadata: {
            user_id: user.id,
          },
        },
        return_url: `${APP_URL}/api/subscription/success?success=true`,
        cancel_url: `${APP_URL}/dashboard/profile?subscription_error=cancelled`,
        metadata: {
          user_id: user.id,
          plan_id: planId,
          pending_subscription_id: pendingSubscription?.id,
        },
      })

      // Update the pending subscription with the Dodo subscription ID
      if (pendingSubscription) {
        await supabase
          .from("pending_subscriptions")
          .update({
            dodo_subscription_id: subscription.subscription_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pendingSubscription.id)
      }

      // Redirect to the checkout URL
      return NextResponse.redirect(subscription.payment_link)
    } catch (error) {
      console.error("Error creating subscription:", error)
      return NextResponse.redirect(new URL("/dashboard/profile?subscription_error=creation_failed", APP_URL))
    }
  } catch (error) {
    console.error("Error in checkout-client route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
