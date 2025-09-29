"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Account {
  id: string
  name: string
  properties: Property[]
}

interface Property {
  id: string
  name: string
  websiteUrl?: string
}

interface FetchStatus {
  status: "pending" | "fetching" | "complete" | "error"
  message?: string
  progress?: number
}

export function PropertySelector({ accounts, userId }: { accounts: Account[]; userId: string }) {
  const router = useRouter()
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>({ status: "pending" })
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [pollInterval])

  const handleAccountChange = (value: string) => {
    setSelectedAccount(value)
    setSelectedProperty(null)
  }

  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value)
  }

  const checkFetchStatus = async () => {
    try {
      const response = await fetch("/api/analytics/fetch-status", {
        credentials: "include", // Ensure cookies are sent
      })
      if (!response.ok) {
        throw new Error("Failed to check fetch status")
      }
      const data = await response.json()
      setFetchStatus(data)

      // If complete or error, stop polling and redirect or show error
      if (data.status === "complete") {
        if (pollInterval) {
          clearInterval(pollInterval)
          setPollInterval(null)
        }

        // Wait a moment to show the success message before redirecting
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else if (data.status === "error") {
        if (pollInterval) {
          clearInterval(pollInterval)
          setPollInterval(null)
        }
        setError(data.message || "An error occurred while fetching data")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error checking fetch status:", err)
    }
  }

  const handleSubmit = async () => {
    if (!selectedProperty) {
      setError("Please select a property")
      return
    }

    if (!selectedAccount) {
      setError("Please select an account")
      return
    }

    setIsLoading(true)
    setError(null)
    setFetchStatus({ status: "pending" })

    try {
      // Find the selected property details
      const account = accounts.find((a) => a.id === selectedAccount)
      const property = account?.properties.find((p) => p.id === selectedProperty)

      if (!property) {
        throw new Error("Selected property not found")
      }

      console.log("Submitting property:", {
        propertyId: selectedProperty,
        accountId: selectedAccount,
        propertyName: property.name,
      })

      // Save the selected property
      const response = await fetch("/api/google/save-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: selectedProperty,
          accountId: selectedAccount, // Add account ID
          propertyName: property.name,
          websiteUrl: property.websiteUrl || "",
          userId,
        }),
        credentials: "include", // Ensure cookies are sent
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save property")
      }

      // Start polling for fetch status
      setFetchStatus({ status: "fetching", progress: 0 })
      const interval = setInterval(checkFetchStatus, 2000)
      setPollInterval(interval)
    } catch (err) {
      console.error("Error saving property:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  // If no accounts are available
  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Google Analytics Accounts</CardTitle>
          <CardDescription>
            We couldn't find any Google Analytics accounts associated with your Google account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please make sure you have access to Google Analytics and try again.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="/connect-ga">Try Again</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Google Analytics Property</CardTitle>
        <CardDescription>Choose which property you want to connect</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fetchStatus.status === "complete" && (
          <Alert variant="success" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Data fetched successfully! Redirecting to dashboard...</AlertDescription>
          </Alert>
        )}

        {fetchStatus.status === "fetching" && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Fetching Data</AlertTitle>
            <AlertDescription>
              We're fetching your Google Analytics data. This may take a minute...
              <Progress value={fetchStatus.progress || 25} className="mt-2" />
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="account" className="text-sm font-medium">
            Google Analytics Account
          </label>
          <Select value={selectedAccount || ""} onValueChange={handleAccountChange} disabled={isLoading}>
            <SelectTrigger id="account">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Accounts</SelectLabel>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {selectedAccount && (
          <div className="space-y-2">
            <label htmlFor="property" className="text-sm font-medium">
              Google Analytics Property
            </label>
            <Select value={selectedProperty || ""} onValueChange={handlePropertyChange} disabled={isLoading}>
              <SelectTrigger id="property">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Properties</SelectLabel>
                  {accounts
                    .find((a) => a.id === selectedAccount)
                    ?.properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!selectedProperty || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {fetchStatus.status === "fetching" ? "Fetching Data..." : "Connecting..."}
            </>
          ) : (
            "Connect Property"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
