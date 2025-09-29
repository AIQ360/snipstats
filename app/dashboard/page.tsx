import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, MousePointer } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Check if user has connected Google Analytics
  const { data: gaAccount, error: gaError } = await supabase
    .from("ga_accounts")
    .select("ga_property_id, website_url")
    .eq("user_id", user.id)
    .single()

  if (gaError || !gaAccount || !gaAccount.ga_property_id || gaAccount.ga_property_id === "pending") {
    redirect("/connect-ga")
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardClient userId={user.id} />
      </Suspense>
    </div>
  )
}

function NoDataWelcomeScreen({ websiteUrl }: { websiteUrl: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to SnapStats! 🎉</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Your Google Analytics is connected for:</p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{websiteUrl}</p>
          </div>

          {/* Status Card */}
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">🔄 We're Fetching Your Data</CardTitle>
              <CardDescription className="text-lg">
                Your analytics data is being imported from Google Analytics. This usually takes 2-5 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Importing your website analytics...</span>
              </div>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Refresh Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* What to Expect */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Visitor Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See who's visiting your site and where they're coming from
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MousePointer className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Top Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">Discover your most popular pages and content</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your website's growth over time</p>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Taking longer than expected?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If your data hasn't appeared after 10 minutes, try refreshing or check your Google Analytics
                  connection.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/connect-ga/reconnect">Reconnect Google Analytics</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/profile">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
