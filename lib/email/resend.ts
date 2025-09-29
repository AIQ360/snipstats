import { Resend } from "resend"

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email template for traffic spikes
export async function sendTrafficSpikeAlert(
  userEmail: string,
  userName: string,
  spikeData: {
    date: string
    percentage: number
    metric: string
  },
) {
  try {
    // Using the verified custom domain
    const { data, error } = await resend.emails.send({
      from: "SnipStats <support@noreply.snipstats.com>", // Updated to use the verified domain
      to: userEmail,
      subject: `🚀 Traffic Spike Alert: ${spikeData.percentage}% increase detected!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Traffic Spike Detected!</h1>
          <p>Hello ${userName || "there"},</p>
          <p>Great news! We detected a significant ${spikeData.metric} increase of <strong>${spikeData.percentage}%</strong> on ${new Date(spikeData.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.</p>
          <p><strong>Time to share your win!</strong> Visit your dashboard to generate a screenshot and celebrate this moment.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Dashboard</a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">You're receiving this because you enabled traffic alerts in your SnipStats account.</p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error }
  }
}
