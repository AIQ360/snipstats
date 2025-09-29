"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const router = useRouter()

  const handleStartTrial = () => {
    router.push("/sign-up?trial=true")
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required.
        </p>

        <div className="flex items-center justify-center mt-8">
          <Label htmlFor="billing-toggle" className={!annual ? "font-medium" : "text-muted-foreground"}>
            Monthly
          </Label>
          <Switch id="billing-toggle" className="mx-4" checked={annual} onCheckedChange={setAnnual} />
          <Label htmlFor="billing-toggle" className={annual ? "font-medium" : "text-muted-foreground"}>
            Annual <span className="text-green-600 font-medium">(Save 18%)</span>
          </Label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="border-2 border-muted">
          <CardHeader>
            <CardTitle>Free Trial</CardTitle>
            <CardDescription>Try all features for 14 days</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground"> / 14 days</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Full dashboard access</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Unlimited screenshots</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Email notifications</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>No credit card required</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleStartTrial}>
              Start Free Trial
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For individuals and small teams</CardDescription>
            <div className="mt-4">
              {annual ? (
                <>
                  <span className="text-3xl font-bold">$49</span>
                  <span className="text-muted-foreground"> / year</span>
                  <div className="text-sm text-green-600 mt-1">Save $11 compared to monthly</div>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold">$5</span>
                  <span className="text-muted-foreground"> / month</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Full dashboard access</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Unlimited screenshots</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Email notifications</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Cancel anytime</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleStartTrial}>
              Start Free Trial
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
