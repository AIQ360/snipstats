"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Plan {
  id: string
  name: string
  description: string
  price: number
  interval: string
  dodo_product_id: string
}

interface Subscription {
  id: string
  status: string
  current_period_end: string
  plan_id: string
  cancel_at_period_end?: boolean
  dodo_subscription_id: string
  dodo_customer_id?: string
  pending_upgrade_plan_id?: string
}

interface SubscriptionManagementProps {
  plans: Plan[]
  subscription?: Subscription
  planDetails?: Plan
}

export function SubscriptionManagement({ plans, subscription, planDetails }: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<Plan | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubscribe = async (planId: string) => {
    try {
      setIsLoading(planId)

      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to checkout
      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      setIsLoading("cancel")

      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId: subscription.dodo_subscription_id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription")
      }

      toast({
        title: "Subscription Canceled",
        description: data.message || "Your subscription has been canceled.",
      })

      setShowCancelDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleUpgradeSubscription = async () => {
    if (!subscription || !selectedUpgradePlan) return

    try {
      setIsLoading("upgrade")

      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentSubscriptionId: subscription.dodo_subscription_id,
          newPlanId: selectedUpgradePlan.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upgrade subscription")
      }

      if (data.checkoutUrl) {
        // Redirect to checkout for the new plan
        window.location.href = data.checkoutUrl
      } else {
        toast({
          title: "Subscription Upgraded",
          description: data.message || "Your subscription has been upgraded.",
        })
        setShowUpgradeDialog(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get available upgrade plans (higher tier plans than current)
  const getUpgradePlans = () => {
    if (!planDetails) return []

    // Filter plans that are higher tier (higher price) than current plan
    return plans.filter((plan) => plan.price > planDetails.price && plan.id !== planDetails.id)
  }

  const upgradePlans = getUpgradePlans()

  // Check if subscription is in pending upgrade state
  const isPendingUpgrade = subscription?.pending_upgrade_plan_id != null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subscription</h2>

      {subscription ? (
        <Card className={subscription.status === "active" ? "border-green-200 bg-green-50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {subscription.status === "active" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {planDetails?.name || subscription.plan_id} Subscription
            </CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Plan:</span>
                <span>{planDetails?.name || subscription.plan_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span
                  className={
                    subscription.status === "active"
                      ? "text-green-600"
                      : subscription.status === "cancelled"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }
                >
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  {subscription.cancel_at_period_end && " (Cancels at period end)"}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="font-medium">
                    {subscription.cancel_at_period_end ? "Expires on:" : "Renews on:"}
                  </span>
                  <span>{formatDate(subscription.current_period_end)}</span>
                </div>
              )}
              {planDetails && (
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span>
                    {formatPrice(planDetails.price)}
                    <span className="text-sm text-muted-foreground">/{planDetails.interval}</span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="flex w-full gap-2">
              {subscription.status === "active" && !subscription.cancel_at_period_end && !isPendingUpgrade && (
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isLoading === "cancel"}
                  className="flex-1"
                >
                  {isLoading === "cancel" ? "Canceling..." : "Cancel Subscription"}
                </Button>
              )}

              {subscription.status === "active" && upgradePlans.length > 0 && !isPendingUpgrade && (
                <Button variant="outline" onClick={() => setShowUpgradeDialog(true)} className="flex-1">
                  Upgrade Plan
                </Button>
              )}
            </div>

            {subscription.cancel_at_period_end && (
              <Alert variant="warning" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Subscription Ending</AlertTitle>
                <AlertDescription>
                  Your subscription will end on {formatDate(subscription.current_period_end)}. You can resubscribe at
                  any time.
                </AlertDescription>
              </Alert>
            )}

            {isPendingUpgrade && (
              <Alert variant="info" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upgrade in Progress</AlertTitle>
                <AlertDescription>
                  Your subscription upgrade is being processed. This may take a few moments.
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatPrice(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan.interval === "month" ? "/month" : "/year"}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id || !plan.dodo_product_id}
                  className="w-full"
                >
                  {isLoading === plan.id ? "Processing..." : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to premium features at the end of
              your billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading === "cancel"}>
              {isLoading === "cancel" ? "Canceling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Subscription Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Choose a plan to upgrade to. Your new plan will be effective immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {upgradePlans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedUpgradePlan?.id === plan.id ? "border-primary ring-2 ring-primary ring-opacity-50" : ""
                }`}
                onClick={() => setSelectedUpgradePlan(plan)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatPrice(plan.price)}</div>
                      <div className="text-xs text-muted-foreground">/{plan.interval}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgradeSubscription} disabled={isLoading === "upgrade" || !selectedUpgradePlan}>
              {isLoading === "upgrade" ? "Processing..." : "Upgrade Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
