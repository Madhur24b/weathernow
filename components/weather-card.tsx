"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Wind, Droplet } from "lucide-react"
import { getForecastUrl, mapWeatherToIcon, formatTemp } from "@/lib/weather"

type SavedPlace = {
  id: string
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
}

export function WeatherCard({
  place,
  unit,
  onUnpin,
  highlight = false,
}: {
  place: SavedPlace
  unit: "c" | "f"
  onUnpin?: () => void
  highlight?: boolean
}) {
  const url = getForecastUrl(place.latitude, place.longitude)
  const { data, isLoading, error, mutate } = useSWR(
    url,
    async (u) => {
      const res = await fetch(u)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch weather data')
      }
      return res.json()
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      retry: 2
    }
  )

  if (isLoading) {
    return (
      <Card className={`card ${highlight ? "ring-1 ring-cyan-600" : ""}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{place.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-3 h-7 w-20" />
          <Skeleton className="mb-1 h-4 w-28" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{place.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-muted-foreground">Failed to load weather.</p>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const current = data.current
  const daily = data.daily
  const temp = formatTemp(current.temperature_2m, unit)
  const feels = formatTemp(current.apparent_temperature, unit)
  const wind = current.wind_speed_10m
  const humidity = current.relative_humidity_2m
  const Icon = mapWeatherToIcon(current.weather_code, current.is_day === 1)

  return (
    <Card className={`card ${highlight ? "ring-1 ring-cyan-600" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">
            {place.name}
            {place.admin1 ? `, ${place.admin1}` : ""}
            {place.country ? `, ${place.country}` : ""}
          </CardTitle>
          {onUnpin && (
            <Button variant="ghost" size="sm" onClick={onUnpin} aria-label="Unpin city">
              Remove
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Icon className="h-7 w-7 text-cyan-600" />
              <div className="text-2xl font-semibold">{temp}</div>
            </div>
            <div className="text-sm text-muted-foreground">Feels like {feels}</div>
          </div>
          <div className="grid gap-1 text-right text-xs text-muted-foreground">
            <div className="flex items-center justify-end gap-1">
              <Wind className="h-3.5 w-3.5" /> {wind} m/s
            </div>
            <div className="flex items-center justify-end gap-1">
              <Droplet className="h-3.5 w-3.5" /> {humidity}%
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {daily.time.slice(0, 5).map((iso: string, idx: number) => {
            const tmin = daily.temperature_2m_min[idx]
            const tmax = daily.temperature_2m_max[idx]
            const wcode = daily.weather_code[idx]
            const DayIcon = mapWeatherToIcon(wcode, true)
            const date = new Date(iso)
            const label = date.toLocaleDateString(undefined, { weekday: "short" })
            return (
              <div key={iso} className="rounded-md border p-2 text-center">
                <div className="text-xs">{label}</div>
                <div className="my-1 flex items-center justify-center">
                  <DayIcon className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="text-xs">
                  <span className="font-medium">{formatTemp(tmax, unit)}</span>{" "}
                  <span className="text-muted-foreground">{formatTemp(tmin, unit)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => mutate()}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
