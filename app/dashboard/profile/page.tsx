import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { ProfileForm } from "@/app/profile/profile-form"
import { AccountManagement } from "@/components/profile/account-management"
import { NotificationPreferences } from "@/components/profile/notification-preferences"
import { SubscriptionManagement } from "@/components/profile/subscription-management"

export default async function ProfilePage({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  // Get GA account
  const { data: gaAccount } = await supabase
    .from("ga_accounts")
    .select("id, ga_account_id, ga_property_id, property_name, website_url")
    .eq("user_id", user.id)
    .single()

  // Get subscription plans
  const { data: plans } = await supabase.from("subscription_plans").select("*")

  // Check if user has an active subscription
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  const activeSubscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null

  // Get the active plan details if user has a subscription
  let activePlan = null
  if (activeSubscription) {
    const { data: planData } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", activeSubscription.plan_id)
      .single()

    activePlan = planData
  }

  // Check for subscription success message
  const subscriptionSuccess = searchParams.subscription_success === "true"
  const subscriptionError = searchParams.subscription_error
  const isUpgrade = searchParams.upgrade === "true"

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and profile information</p>
      </div>

      {subscriptionSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">
            {isUpgrade
              ? "Your subscription has been upgraded successfully."
              : "Your subscription has been activated successfully."}
          </span>
        </div>
      )}

      {subscriptionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> There was an issue with your subscription: {subscriptionError}</span>
        </div>
      )}

      <div className="space-y-6">
        <ProfileForm
          initialData={{
            id: user.id,
            email: user.email || "",
            fullName: profile?.full_name || "",
            avatarUrl: profile?.avatar_url || "",
          }}
        />

        <AccountManagement gaAccount={gaAccount} />

        <NotificationPreferences
          userId={user.id}
          userEmail={user.email || ""}
          initialPreferences={{
            emailNotifications: profile?.email_notifications !== false,
            notificationEmail: profile?.notification_email,
          }}
        />

        <div className="mt-8">
          <SubscriptionManagement plans={plans || []} subscription={activeSubscription} planDetails={activePlan} />
        </div>
      </div>
    </div>
  )
}
