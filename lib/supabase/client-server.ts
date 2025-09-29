import { createServerClient } from "@supabase/ssr"

// This version works in both client and server contexts
// It doesn't use cookies() from next/headers
export function createClientServerSupabaseClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    // Don't use cookies at all - this is for data fetching only
    cookies: {
      get(name) {
        return undefined
      },
      set(name, value, options) {
        // Do nothing
      },
      remove(name, options) {
        // Do nothing
      },
    },
  })
}
