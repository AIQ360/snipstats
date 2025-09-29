import { NextResponse } from "next/server"
import { sendTrafficSpikeAlert } from "@/lib/email/resend"

export async function GET(request: Request) {
  try {
    // Get the recipient email from the query parameters
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email") || "test@example.com"

    // Send a test email using the Resend test configuration
    const result = await sendTrafficSpikeAlert(email, "Test User", {
      date: new Date().toISOString(),
      percentage: 25,
      metric: "sessions",
    })

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send test email", details: result.error }, { status: 500 })
    }

    return NextResponse.json({
      message: "Test email sent successfully",
      details: result.data,
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Failed to send test email", details: error }, { status: 500 })
  }
}
