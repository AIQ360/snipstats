import { NextResponse } from "next/server"
import axios from "axios"

// Test endpoint to verify Dodo API connection
export async function GET() {
  try {
    console.log("TEST: Testing Dodo API connection")

    // Try different URL variations to find the correct one
    const urlVariations = [
      "https://test.dodopayments.com/subscriptions",
      "https://test.dodopayments.com/v1/subscriptions",
      "https://api.test.dodopayments.com/subscriptions",
      "https://api.test.dodopayments.com/v1/subscriptions",
    ]

    const results = []

    for (const url of urlVariations) {
      try {
        console.log(`TEST: Trying URL: ${url}`)

        // Make a simple GET request to test connection
        const response = await axios({
          method: "get",
          url,
          headers: {
            Authorization: `Bearer ${process.env.DODO_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5 second timeout
        })

        results.push({
          url,
          status: response.status,
          success: true,
          data: "Response too large to display",
        })

        console.log(`TEST: URL ${url} returned status ${response.status}`)
      } catch (error: any) {
        results.push({
          url,
          status: error.response?.status || "No response",
          success: false,
          error: error.message,
          details: error.response?.data || {},
        })

        console.log(`TEST: URL ${url} failed with error: ${error.message}`)
      }
    }

    return NextResponse.json({
      apiKeyPrefix: process.env.DODO_API_KEY?.substring(0, 5) + "...",
      results,
    })
  } catch (error: any) {
    console.error("TEST: Error testing Dodo API:", error)

    return NextResponse.json(
      {
        error: "Failed to test Dodo API",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
