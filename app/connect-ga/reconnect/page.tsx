import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getGoogleAuthUrl } from "@/lib/google/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ReconnectPage() {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get GA account
  const { data: gaAccount, error: gaError } = await supabase
    .from("ga_accounts")
    .select("website_url, property_name")
    .eq("user_id", user.id)
    .single()

  if (gaError) {
    redirect("/connect-ga")
  }

  // Generate Google auth URL
  const googleAuthUrl = getGoogleAuthUrl()

  return (
    <div className="container max-w-md flex items-center justify-center py-10">
      <Card>
        <CardHeader>
          <CardTitle>Reconnect Google Analytics</CardTitle>
          <CardDescription>Your Google Analytics connection needs to be refreshed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              Your Google Analytics authentication has expired or been revoked. Please reconnect to continue accessing
              your analytics data.
            </AlertDescription>
          </Alert>

          {gaAccount && (
            <div className="text-sm">
              <p>
                <strong>Property:</strong> {gaAccount.property_name || "Unknown"}
              </p>
              <p>
                <strong>Website:</strong> {gaAccount.website_url || "Unknown"}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href={googleAuthUrl}>Reconnect Google Analytics</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
