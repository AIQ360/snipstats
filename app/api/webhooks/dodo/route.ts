import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import crypto from "crypto"

const WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET

export async function POST(request: Request) {
  try {
    // Verify webhook signature
    const payload = await request.text()
    const signature = request.headers.get("dodo-signature")

    if (!signature || !WEBHOOK_SECRET) {
      console.error("Missing signature or webhook secret")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET)
    const expectedSignature = hmac.update(payload).digest("hex")

    if (signature !== expectedSignature) {
      console.error("Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(payload)
    console.log("Received Dodo webhook event:", event.type)

    const supabase = await createClient()

    // Handle different event types
    switch (event.type) {
      case "subscription.created":
        await handleSubscriptionCreated(event.data, supabase)
        break
      case "subscription.updated":
        await handleSubscriptionUpdated(event.data, supabase)
        break
      case "subscription.cancelled":
        await handleSubscriptionCancelled(event.data, supabase)
        break
      case "subscription.payment_succeeded":
        await handlePaymentSucceeded(event.data, supabase)
        break
      case "subscription.payment_failed":
        await handlePaymentFailed(event.data, supabase)
        break
      default:
        console.log("Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleSubscriptionCreated(data, supabase) {
  const { id, customer, plan, status, current_period_end, metadata } = data

  if (!metadata || !metadata.user_id || !metadata.plan_id) {
    console.error("Missing metadata in subscription created event")
    return
  }

  const userId = metadata.user_id
  const planId = metadata.plan_id

  // Check if this is an upgrade
  if (metadata.previous_subscription_id) {
    // Get the pending subscription
    const { data: pendingSubscription } = await supabase
      .from("pending_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .single()

    if (pendingSubscription) {
      // Mark the previous subscription as cancelled
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", metadata.previous_subscription_id)

      // Delete the pending subscription
      await supabase.from("pending_subscriptions").delete().eq("id", pendingSubscription.id)
    }
  }

  // Create a new subscription record
  await supabase.from("subscriptions").insert({
    user_id: userId,
    plan_id: planId,
    dodo_subscription_id: id,
    dodo_customer_id: customer.id,
    status: status,
    current_period_end: new Date(current_period_end * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}

async function handleSubscriptionUpdated(data, supabase) {
  const { id, status, current_period_end, cancel_at_period_end } = data

  // Find the subscription in our database
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("dodo_subscription_id", id)
    .single()

  if (!subscription) {
    console.error("Subscription not found for update:", id)
    return
  }

  // Update the subscription
  await supabase
    .from("subscriptions")
    .update({
      status: status,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      cancel_at_period_end: cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscription.id)
}

async function handleSubscriptionCancelled(data, supabase) {
  const { id } = data

  // Find the subscription in our database
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("dodo_subscription_id", id)
    .single()

  if (!subscription) {
    console.error("Subscription not found for cancellation:", id)
    return
  }

  // Update the subscription
  await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscription.id)
}

async function handlePaymentSucceeded(data, supabase) {
  const { subscription } = data

  // Find the subscription in our database
  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("dodo_subscription_id", subscription)
    .single()

  if (!subscriptionData) {
    console.error("Subscription not found for payment success:", subscription)
    return
  }

  // Update the subscription
  await supabase
    .from("subscriptions")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionData.id)
}

async function handlePaymentFailed(data, supabase) {
  const { subscription } = data

  // Find the subscription in our database
  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("dodo_subscription_id", subscription)
    .single()

  if (!subscriptionData) {
    console.error("Subscription not found for payment failure:", subscription)
    return
  }

  // Update the subscription
  await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionData.id)
}
