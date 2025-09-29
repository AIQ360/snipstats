import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createSubscription } from "@/lib/payments/dodo-api"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.snipstats.com"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SUBSCRIPTION CHECKOUT DEBUG ===")
    console.log("Environment variables check:")
    console.log("DODO_API_KEY exists:", !!process.env.DODO_API_KEY)
    console.log("DODO_API_KEY first 10 chars:", process.env.DODO_API_KEY?.substring(0, 10))
    console.log("APP_URL:", APP_URL)

    const body = await request.json()
    const { planId } = body

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
      console.log("User authentication error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", user.email)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.log("Profile fetch error:", profileError)
    }

    // Get the plan details
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      console.log("Plan fetch error:", planError)
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    console.log("Plan found:", plan.name, "Dodo Product ID:", plan.dodo_product_id)

    if (!plan.dodo_product_id) {
      return NextResponse.json(
        { error: "Plan is not configured for payment. Please contact support." },
        { status: 400 },
      )
    }

    // Try to create a pending subscription record (but don't fail if it errors)
    try {
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
      } else {
        console.log("Pending subscription created:", pendingSubscription.id)
      }
    } catch (pendingErr) {
      console.error("Pending subscription creation failed:", pendingErr)
      // Continue anyway
    }

    try {
      // Create subscription in Dodo Payments
      console.log("Creating Dodo subscription...")
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
        },
      })

      console.log("Subscription created successfully!")
      console.log("Payment link:", subscription.payment_link)

      // Return the checkout URL instead of redirecting
      return NextResponse.json({
        checkoutUrl: subscription.payment_link,
        success: true,
      })
    } catch (error) {
      console.error("Error creating subscription:", error)
      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: error.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in checkout route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Keep the existing GET method for backward compatibility
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const planId = searchParams.get("planId")

  if (!planId) {
    return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()

  // Get the user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get the plan
  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  if (!plan.dodo_product_id) {
    return NextResponse.json({ error: "Plan is not configured for payment. Please contact support." }, { status: 400 })
  }

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

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
      },
    })

    // Redirect to the checkout URL
    return NextResponse.redirect(subscription.payment_link)
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.redirect(new URL(`/dashboard/profile?subscription_error=creation_failed`, APP_URL))
  }
}
