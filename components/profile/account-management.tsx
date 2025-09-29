"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Unlink, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface AccountManagementProps {
  gaAccount: {
    id: string
    ga_account_id: string
    ga_property_id: string
    property_name?: string
    website_url: string
  } | null
}

export function AccountManagement({ gaAccount }: AccountManagementProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDisconnectingProperty, setIsDisconnectingProperty] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/analytics/initial-fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          days: 30,
          propertyId: gaAccount?.ga_property_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to refresh data")
      }

      toast.success("Analytics data refreshed successfully")
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast.error("Failed to refresh analytics data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch("/api/analytics/disconnect", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to disconnect account")
      }

      toast.success("Google Analytics account disconnected successfully")
      router.push("/connect-ga")
    } catch (error) {
      console.error("Error disconnecting account:", error)
      toast.error("Failed to disconnect Google Analytics account")
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleDisconnectProperty = async () => {
    setIsDisconnectingProperty(true)
    try {
      const response = await fetch("/api/analytics/disconnect-property", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to disconnect property")
      }

      toast.success("Google Analytics property disconnected successfully")
      router.push("/connect-ga")
    } catch (error) {
      console.error("Error disconnecting property:", error)
      toast.error("Failed to disconnect Google Analytics property")
    } finally {
      setIsDisconnectingProperty(false)
    }
  }

  if (!gaAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Analytics Account</CardTitle>
          <CardDescription>Connect your Google Analytics account to view insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">No Google Analytics account connected</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/connect-ga")} className="w-full">
            Connect Google Analytics
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Analytics Account</CardTitle>
        <CardDescription>Manage your connected Google Analytics account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Account ID:</span>
            <span className="text-sm">{gaAccount.ga_account_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Property ID:</span>
            <span className="text-sm">{gaAccount.ga_property_id}</span>
          </div>
          {gaAccount.property_name && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Property Name:</span>
              <span className="text-sm">{gaAccount.property_name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm font-medium">Website URL:</span>
            <span className="text-sm">{gaAccount.website_url}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing Data..." : "Refresh Analytics Data"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
            >
              <Unlink className="h-4 w-4" />
              Disconnect Property
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Google Analytics Property</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the property connection and delete all analytics data for this property. Your Google
                Analytics account will remain connected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisconnectProperty}
                disabled={isDisconnectingProperty}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isDisconnectingProperty ? "Disconnecting..." : "Disconnect Property"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Unlink className="h-4 w-4" />
              Disconnect Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Google Analytics Account</AlertDialogTitle>
              <AlertDialogDescription>
                This will completely disconnect your Google Analytics account and delete all analytics data. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
