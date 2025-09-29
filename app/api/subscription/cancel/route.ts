import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cancelSubscription } from "@/lib/payments/dodo-api"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SUBSCRIPTION CANCELLATION DEBUG ===")

    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    console.log("Subscription ID:", subscriptionId)

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("User authentication error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", user.email)

    // Find the subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("dodo_subscription_id", subscriptionId)
      .eq("user_id", user.id)
      .single()

    if (subscriptionError || !subscription) {
      console.log("Subscription not found:", subscriptionError)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    console.log("Subscription found:", subscription.id)

    // Call Dodo API to cancel - let's verify this is working
    console.log("Calling Dodo API to cancel subscription...")
    try {
      const dodoResponse = await cancelSubscription(subscriptionId, true)
      console.log("Dodo cancellation response:", JSON.stringify(dodoResponse, null, 2))

      // Check if Dodo actually marked it as cancelled
      if (dodoResponse.cancel_at_next_billing_date === true) {
        console.log("✅ Dodo confirmed cancellation will happen at next billing date")
      } else {
        console.log("❌ Dodo did not confirm cancellation")
      }

      // Update our database
      const { data: updateResult, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id)
        .select()

      if (updateError) {
        console.error("Database update error:", updateError)
        return NextResponse.json({ error: "Failed to update database" }, { status: 500 })
      }

      console.log("Database update successful:", updateResult)

      return NextResponse.json({
        success: true,
        message: "Subscription will be cancelled at the end of the billing period",
        subscription: updateResult[0],
        dodo_response: dodoResponse,
      })
    } catch (dodoError) {
      console.error("Dodo API error:", dodoError)
      return NextResponse.json(
        {
          error: "Failed to cancel with payment provider",
          details: dodoError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json(
      {
        error: "Failed to cancel subscription",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
