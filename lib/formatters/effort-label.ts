export function formatEffortLabel(effort?: string): string {
  if (!effort) return "Moderate"

  const normalized = effort.toUpperCase()

  if (normalized.includes("RPE 8")) return "Hard"
  if (normalized.includes("RPE 7")) return "Moderate-Hard"
  if (normalized.includes("RIR 1-2")) return "Near Failure"
  if (normalized.includes("RIR 1")) return "Near Failure"
  if (normalized.includes("RIR 2")) return "Hard"

  return effort
}
