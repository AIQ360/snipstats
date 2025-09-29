import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    console.log("=== RLS TEST DEBUG ===")

    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Testing RLS for user:", user.email)

    // Test SELECT permission
    console.log("Testing SELECT permission...")
    const { data: selectData, error: selectError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)

    console.log("SELECT result:", selectData)
    console.log("SELECT error:", selectError)

    // Test UPDATE permission on existing record
    if (selectData && selectData.length > 0) {
      const testSubscription = selectData[0]
      console.log("Testing UPDATE permission on subscription:", testSubscription.id)

      const { data: updateData, error: updateError } = await supabase
        .from("subscriptions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", testSubscription.id)
        .select()

      console.log("UPDATE result:", updateData)
      console.log("UPDATE error:", updateError)

      // Test specific cancellation update
      console.log("Testing cancellation UPDATE...")
      const { data: cancelData, error: cancelError } = await supabase
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", testSubscription.id)
        .eq("user_id", user.id)
        .select()

      console.log("Cancellation UPDATE result:", cancelData)
      console.log("Cancellation UPDATE error:", cancelError)
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      select_count: selectData?.length || 0,
      select_error: selectError?.message || null,
    })
  } catch (error) {
    console.error("RLS test error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
