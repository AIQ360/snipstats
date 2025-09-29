export const dynamic = "force-dynamic"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import IndieSignalsClient from "@/components/dashboard/indie-signals-client"

export default async function IndieSignalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Check if user has GA connected
  const { data: gaData } = await supabase.from("ga_accounts").select("ga_property_id").eq("user_id", user.id).single()

  if (!gaData) {
    redirect("/connect-ga")
  }

  return <IndieSignalsClient />
}
