import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSubscription } from "@/lib/payments/dodo-api"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.snipstats.com"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const success = searchParams.get("success")
    const subscriptionId = searchParams.get("subscription_id")

    console.log("=== SUBSCRIPTION SUCCESS HANDLER ===")
    console.log("Success:", success)
    console.log("Subscription ID:", subscriptionId)

    if (success !== "true") {
      return NextResponse.redirect(new URL("/dashboard/profile?subscription_error=payment_failed", APP_URL))
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("User authentication error:", userError)
      return NextResponse.redirect(new URL("/sign-in", APP_URL))
    }

    console.log("User authenticated:", user.email)

    if (subscriptionId) {
      try {
        const dodoSubscription = await getSubscription(subscriptionId)
        console.log("Dodo subscription details:", JSON.stringify(dodoSubscription, null, 2))

        // Get the plan from metadata
        const planId = dodoSubscription.metadata?.plan_id || "monthly"
        console.log("Plan ID from metadata:", planId)

        // Calculate correct billing dates based on OUR plan, not Dodo's weird structure
        const startDate = new Date(dodoSubscription.created_at)
        let nextBillingDate: Date

        if (planId === "monthly") {
          nextBillingDate = new Date(startDate)
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
        } else if (planId === "annual") {
          nextBillingDate = new Date(startDate)
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
        } else {
          // Default to monthly
          nextBillingDate = new Date(startDate)
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
        }

        console.log("Calculated billing dates:")
        console.log("Start:", startDate.toISOString())
        console.log("Next billing (our calculation):", nextBillingDate.toISOString())
        console.log("Dodo next_billing_date:", dodoSubscription.next_billing_date)

        // Check if subscription already exists
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("dodo_subscription_id", subscriptionId)
          .eq("user_id", user.id)
          .single()

        const subscriptionData = {
          user_id: user.id,
          plan_id: planId,
          status: dodoSubscription.status,
          current_period_start: startDate.toISOString(),
          current_period_end: nextBillingDate.toISOString(),
          dodo_subscription_id: subscriptionId,
          dodo_customer_id: dodoSubscription.customer.customer_id,
          // Store Dodo's structure for reference
          subscription_period_interval: dodoSubscription.subscription_period_interval,
          subscription_period_count: dodoSubscription.subscription_period_count,
          payment_frequency_interval: dodoSubscription.payment_frequency_interval,
          payment_frequency_count: dodoSubscription.payment_frequency_count,
          next_billing_date: nextBillingDate.toISOString(), // Use our calculated date
          previous_billing_date: dodoSubscription.previous_billing_date,
          updated_at: new Date().toISOString(),
        }

        if (existingSubscription) {
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update(subscriptionData)
            .eq("id", existingSubscription.id)

          if (updateError) {
            console.error("Error updating subscription:", updateError)
          } else {
            console.log("Subscription updated successfully")
          }
        } else {
          const { error: insertError } = await supabase.from("subscriptions").insert(subscriptionData)

          if (insertError) {
            console.error("Error creating subscription:", insertError)
          } else {
            console.log("Subscription created successfully")
          }
        }
      } catch (dodoError) {
        console.error("Error fetching Dodo subscription:", dodoError)
      }
    }

    return NextResponse.redirect(new URL("/dashboard/profile?subscription_success=true", APP_URL))
  } catch (error) {
    console.error("Error in subscription success handler:", error)
    return NextResponse.redirect(new URL("/dashboard/profile?subscription_error=processing_failed", APP_URL))
  }
}
