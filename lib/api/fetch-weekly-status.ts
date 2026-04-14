import type { WeeklyStatus } from "@/lib/types/weekly-status"
import fallbackWeeklyStatus from "@/data/examples/sample-weekly-status.json"

export async function fetchWeeklyStatus(): Promise<WeeklyStatus> {
  try {
    const response = await fetch("/api/weekly-latest", {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch weekly status: ${response.status}`)
    }

    return (await response.json()) as WeeklyStatus
  } catch {
    return fallbackWeeklyStatus as WeeklyStatus
  }
}
