const API_URL_STORAGE_KEY = "workout_generator_api_url"

export function getStoredApiUrl(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(API_URL_STORAGE_KEY)
}

export function setStoredApiUrl(url: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(API_URL_STORAGE_KEY, url)
}

export function clearStoredApiUrl(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(API_URL_STORAGE_KEY)
}
