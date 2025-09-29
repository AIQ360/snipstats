import { NextResponse } from "next/server"
import { processAndSendSpikeNotifications } from "@/lib/notifications/spike-notifications"

export async function POST(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("CRON: Starting notification processing...")

    const result = await processAndSendSpikeNotifications()

    console.log(`CRON: Processed ${result.processed} notifications, ${result.errors} errors`)

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("CRON: Error processing notifications:", error)
    return NextResponse.json(
      {
        error: "Failed to process notifications",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Also allow GET for manual testing
export async function GET() {
  return NextResponse.json({
    message: "Notification processor endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
