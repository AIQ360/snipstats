import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { resend } from "@/lib/email/resend"

export async function GET(request: Request) {
  try {
    // Verify admin access
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (you can adjust this based on your admin check logic)
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Test Resend API key by sending a test email
    const { data, error } = await resend.emails.send({
      from: "SnapStats <notifications@snapstats.app>",
      to: user.email!, // Send to the admin's email
      subject: "Resend API Key Test",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Resend API Key Test</h1>
          <p>Hello Admin,</p>
          <p>This is a test email to verify that your Resend API key is working correctly.</p>
          <p>If you're seeing this, your Resend integration is set up properly!</p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend test failed:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: "Resend API key test failed. Check server logs for details.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Resend API key is working correctly! Test email sent.",
      emailId: data?.id,
    })
  } catch (error) {
    console.error("Error testing Resend API key:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        message: "Failed to test Resend API key. Check server logs for details.",
      },
      { status: 500 },
    )
  }
}
