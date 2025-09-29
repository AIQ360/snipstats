import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("FETCH_STATUS: User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log(`FETCH_STATUS: Checking status for user ${user.id}`)

    // Get the current status
    const { data: statusData, error: statusError } = await supabase
      .from("data_fetch_status")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (statusError && statusError.code !== "PGRST116") {
      console.log("FETCH_STATUS: Error fetching status:", statusError)
      return NextResponse.json({
        status: "pending",
        message: "Preparing to fetch data",
        progress: 0,
      })
    }

    if (!statusData) {
      console.log(`FETCH_STATUS: No status found for user ${user.id}, returning pending`)
      return NextResponse.json({
        status: "pending",
        message: "Preparing to fetch data",
        progress: 0,
      })
    }

    // Calculate progress based on status
    let progress = 0
    if (statusData.status === "complete") {
      progress = 100
    } else if (statusData.status === "fetching" && statusData.started_at) {
      const startTime = new Date(statusData.started_at).getTime()
      const currentTime = new Date().getTime()
      const elapsedSeconds = (currentTime - startTime) / 1000

      // Estimate progress based on elapsed time (assuming 45 seconds for completion)
      progress = Math.min(Math.round((elapsedSeconds / 45) * 100), 95)
    }

    console.log(`FETCH_STATUS: Status for user ${user.id}: ${statusData.status}, progress: ${progress}%`)

    return NextResponse.json({
      status: statusData.status,
      message: statusData.message || "Processing data...",
      progress: progress,
      startedAt: statusData.started_at,
      updatedAt: statusData.updated_at,
      completedAt: statusData.completed_at,
    })
  } catch (error) {
    console.error("FETCH_STATUS: Unexpected error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred",
        progress: 0,
      },
      { status: 500 },
    )
  }
}
