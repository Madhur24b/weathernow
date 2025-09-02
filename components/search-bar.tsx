"use client"

import { useState } from "react"
import useSWR from "swr"
import { Heart, MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type GeoResult = {
  id: string
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
}

type SavedPlace = GeoResult

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SearchBar({
  onPin,
  onSetHometown,
  onPreview,
  compact = false,
}: {
  onPin: (place: SavedPlace) => void
  onSetHometown: (place: SavedPlace) => void
  onPreview?: (place: SavedPlace | null) => void
  compact?: boolean
}) {
  const [query, setQuery] = useState("")

  const { data, isValidating } = useSWR(
    query.trim().length >= 2 ? `/api/weather/search?q=${encodeURIComponent(query.trim())}` : null,
    fetcher,
  )

  const results: GeoResult[] = data?.results ?? []

  function toSaved(p: GeoResult): SavedPlace {
    return p
  }

  return (
    <div className={cn("w-full", compact ? "" : "max-w-3xl")}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!e.target.value.trim() && onPreview) onPreview(null)
          }}
          placeholder="Search any city worldwide (e.g., Tokyo, Paris, Lagos)"
          aria-label="Search for a city"
          className="pl-9"
        />
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {query.trim() && (
        <Card className="mt-2">
          <CardContent className="p-0">
            {isValidating && results.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
            ) : (
              <ul className="max-h-80 overflow-auto">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 border-b px-3 py-2 last:border-none"
                  >
                    <button
                      className="min-w-0 text-left flex-grow"
                      onClick={() => onPreview?.(toSaved(r))}
                      title="Preview weather background"
                    >
                      <div className="truncate font-medium">
                        {r.name}
                        {r.admin1 ? `, ${r.admin1}` : ""}
                        {r.country ? `, ${r.country}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.latitude.toFixed(2)}°, {r.longitude.toFixed(2)}°
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Set as hometown"
                        onClick={() => onSetHometown(toSaved(r))}
                        title="Set as hometown"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Pin city"
                        onClick={() => onPin(toSaved(r))}
                        title="Pin city"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
