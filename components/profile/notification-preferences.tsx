"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"

interface NotificationPreferencesProps {
  initialPreferences?: {
    emailNotifications: boolean
    notificationEmail?: string
  }
  userId: string
  userEmail: string
}

export function NotificationPreferences({
  initialPreferences = { emailNotifications: true },
  userId,
  userEmail,
}: NotificationPreferencesProps) {
  const [emailNotifications, setEmailNotifications] = useState(initialPreferences.emailNotifications)
  const [notificationEmail, setNotificationEmail] = useState(initialPreferences.notificationEmail || userEmail)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleEmailNotifications = async (checked: boolean) => {
    setIsUpdating(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("user_profiles").update({ email_notifications: checked }).eq("id", userId)

      if (error) {
        console.error("Toggle error:", error)
        throw error
      }

      setEmailNotifications(checked)
      toast.success("Email notification preferences updated")

      // Log the update for debugging
      console.log("Updated email_notifications to:", checked)

      // Verify the update was successful
      const { data, error: verifyError } = await supabase
        .from("user_profiles")
        .select("email_notifications")
        .eq("id", userId)
        .single()

      if (verifyError) {
        console.error("Verification error:", verifyError)
      } else {
        console.log("Verified value in database:", data.email_notifications)
      }
    } catch (error) {
      console.error("Failed to update notification preferences:", error)
      toast.error("Failed to update notification preferences")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveNotificationEmail = async () => {
    setIsUpdating(true)

    try {
      // Basic email validation
      if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
        toast.error("Please enter a valid email address")
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from("user_profiles")
        .update({ notification_email: notificationEmail })
        .eq("id", userId)

      if (error) throw error

      toast.success("Notification email updated")
    } catch (error) {
      console.error("Failed to update notification email:", error)
      toast.error("Failed to update notification email")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Control how and when you receive notifications from SnapStats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email alerts for traffic spikes and important events
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={handleToggleEmailNotifications}
            disabled={isUpdating}
          />
        </div>

        {emailNotifications && (
          <div className="space-y-4 pt-2 border-t">
            <div>
              <Label htmlFor="notification-email">Notification Email</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Where should we send your notifications? Leave blank to use your account email.
              </p>
              <div className="flex gap-2">
                <Input
                  id="notification-email"
                  type="email"
                  placeholder={userEmail}
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveNotificationEmail} disabled={isUpdating} size="sm">
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
