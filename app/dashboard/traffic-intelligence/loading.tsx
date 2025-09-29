import { Skeleton } from "@/components/ui/skeleton"

export default function TrafficIntelligenceLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-80 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="space-y-8">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>

        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 md:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        <Skeleton className="h-8 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    </div>
  )
}
