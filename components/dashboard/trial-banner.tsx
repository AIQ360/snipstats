"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface TrialBannerProps {
  daysRemaining: number | null
  isExpired: boolean
}

export function TrialBanner({ daysRemaining, isExpired }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  if (dismissed) return null

  if (isExpired) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between md:items-center">
            <p className="text-sm text-red-700">
              Your free trial has expired. Subscribe now to continue using all features.
            </p>
            <div className="mt-3 flex md:mt-0 md:ml-6">
              <Button size="sm" onClick={() => router.push("/dashboard/profile")}>
                Subscribe Now
              </Button>
              <Button variant="ghost" size="sm" className="ml-3" onClick={() => setDismissed(true)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (daysRemaining && daysRemaining <= 3) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between md:items-center">
            <p className="text-sm text-amber-700">
              Your free trial ends in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}. Subscribe now to avoid
              interruption.
            </p>
            <div className="mt-3 flex md:mt-0 md:ml-6">
              <Button size="sm" onClick={() => router.push("/dashboard/profile")}>
                Subscribe Now
              </Button>
              <Button variant="ghost" size="sm" className="ml-3" onClick={() => setDismissed(true)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
