import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { format, subDays } from "date-fns"

interface DashboardContentProps {
  userId: string
  websiteUrl: string
}

export function DashboardContent({ userId, websiteUrl }: DashboardContentProps) {
  // Set default date range (last 7 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = subDays(today, 1)
  const defaultStart = subDays(yesterday, 6)
  const defaultEnd = yesterday

  const startDate = format(defaultStart, "yyyy-MM-dd")
  const endDate = format(defaultEnd, "yyyy-MM-dd")

  return (
    <DashboardClient userId={userId} websiteUrl={websiteUrl} initialStartDate={startDate} initialEndDate={endDate} />
  )
}
