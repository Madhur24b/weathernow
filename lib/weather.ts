import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from "lucide-react"

export function getForecastUrl(lat: number, lon: number) {
  const url = new URL(
    "/api/weather/forecast",
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  )
  url.searchParams.set("lat", String(lat))
  url.searchParams.set("lon", String(lon))
  url.searchParams.set("days", "7")
  return url.toString()
}

export function cToF(c: number) {
  return (c * 9) / 5 + 32
}

export function formatTemp(celsius: number, unit: "c" | "f") {
  const value = unit === "c" ? celsius : cToF(celsius)
  return `${Math.round(value)}°${unit.toUpperCase()}`
}

// Normalized WMO-like weather codes mapping to icons
export function mapWeatherToIcon(code: number, isDay: boolean) {
  if (code === 0) return Sun
  if ([1, 2, 3].includes(code)) return Cloud
  if ([45, 48].includes(code)) return CloudFog
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return CloudRain
  if ([56, 57, 66, 67].includes(code)) return CloudDrizzle
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow
  if ([95, 96, 99].includes(code)) return CloudLightning
  return Cloud
}

// Background class by normalized code (limit to neutrals + cyan)
export function bgClassForWeather(code: number, isDay: boolean) {
  // Base neutral with cyan tint variations
  if (code === 0) return isDay ? "bg-neutral-900/80" : "bg-neutral-950/80"
  if ([1, 2, 3].includes(code)) return "bg-neutral-900/90"
  if ([45, 48].includes(code)) return "bg-neutral-950/90"
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 56, 57, 66, 67].includes(code)) return "bg-neutral-950/95"
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "bg-neutral-900/95"
  if ([95, 96, 99].includes(code)) return "bg-neutral-950"
  return "bg-neutral-950/90"
}
