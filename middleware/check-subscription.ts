import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { checkSubscriptionAccess } from "@/lib/subscription/access-control"

export async function withSubscriptionCheck(request: Request, handler: (request: Request) => Promise<NextResponse>) {
  const supabase = await createClient()

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check subscription access
  const { hasAccess } = await checkSubscriptionAccess(user.id)

  if (!hasAccess) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 403 })
  }

  // User has access, proceed with the handler
  return handler(request)
}
