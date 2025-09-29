export interface InsightData {
  date: string
  spike_type: "Traffic Spike" | "Traffic Drop"
  percentage_change: number
  top_sources: Array<{ source: string; visitors: number }>
  top_pages: Array<{ page: string; visitors: number }>
}
