"use client"

import { useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { Heart, MapPin, User, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchBar } from "@/components/search-bar"
import { PinnedList } from "@/components/pinned-list"
import { WeatherCard } from "@/components/weather-card"
import { useLocalStorage } from "@/hooks/use-local-storage"
import useSWR from "swr"
import { bgClassForWeather } from "@/lib/weather"

type SavedPlace = {
  id: string
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
}

export default function Page() {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useLocalStorage<string | null>("weathernow:name", null)
  const [unit, setUnit] = useLocalStorage<"c" | "f">("weathernow:unit", "c")
  const [pinned, setPinned] = useLocalStorage<SavedPlace[]>("weathernow:pinned", [])
  const [hometown, setHometown] = useLocalStorage<SavedPlace | null>("weathernow:hometown", null)
  const [preview, setPreview] = useState<SavedPlace | null>(null)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  function pinPlace(place: SavedPlace) {
    setPinned((prev) => {
      if (prev.find((p) => p.id === place.id)) return prev
      return [...prev, place]
    })
  }

  function unpinPlace(id: string) {
    setPinned((prev) => prev.filter((p) => p.id !== id))
  }

  function reorderPinned(next: SavedPlace[]) {
    setPinned(next)
  }

  function setAsHometown(place: SavedPlace) {
    setHometown(place)
  }

  // Determine the city to reflect in background: preview > hometown > first pinned
  const bgPlace = preview || hometown || pinned[0] || null

  return (
    <main className="relative min-h-screen">
      {/* Background */}
      <WeatherBackground theme={resolvedTheme} place={bgPlace} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 md:py-10">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-600 text-white">
              <span className="text-sm font-semibold">WN</span>
            </div>
            <div>
              <h1 className="text-pretty text-xl font-semibold md:text-2xl">WeatherNow</h1>
              <p className="text-sm text-muted-foreground">
                {greeting}
                {name ? `, ${name}` : ""}. Track weather worldwide.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Tabs value={unit} onValueChange={(v) => setUnit(v as "c" | "f")} className="hidden md:block">
              <TabsList>
                <TabsTrigger value="c">°C</TabsTrigger>
                <TabsTrigger value="f">°F</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="md:hidden">
              <Button variant="outline" size="sm" onClick={() => setUnit(unit === "c" ? "f" : "c")}>
                <Settings2 className="mr-2 h-4 w-4" />
                {unit === "c" ? "°C" : "°F"}
              </Button>
            </div>
            <a href="/settings" className="ml-1">
              <Button variant="outline" size="sm" aria-label="Open settings">
                Settings
              </Button>
            </a>
          </div>
        </header>

        {/* Name + Hometown quick setup */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end gap-3">
              <div className="grid w-full gap-2">
                <Label htmlFor="name">Enter your name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Alex"
                  value={name ?? ""}
                  onChange={(e) => {
                    // Only update the input value, don't save to localStorage yet
                    setName(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const trimmedName = (e.currentTarget.value || "").trim();
                      setName(trimmedName || null);
                    }
                  }}
                  aria-label="Enter your name"
                />
              </div>
              <Button 
                variant="secondary" 
                onClick={() => {
                  // Only save if there's actual content
                  const trimmedName = (name || "").trim();
                  setName(trimmedName || null);
                  // Optional: Add some visual feedback
                  if (trimmedName) {
                    alert("Name saved successfully!");
                  }
                }}
              >
                Save
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Set Hometown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchBar onPin={pinPlace} onSetHometown={setAsHometown} onPreview={setPreview} compact />
              {hometown ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Current hometown: {hometown.name}
                  {hometown.admin1 ? `, ${hometown.admin1}` : ""}
                  {hometown.country ? `, ${hometown.country}` : ""}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Choose a place to set as your hometown.</p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Search */}
        <section className="mb-6">
          <SearchBar onPin={pinPlace} onSetHometown={setAsHometown} onPreview={setPreview} />
        </section>

        {/* Content: Pinned and Hometown columns */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-pretty text-lg font-semibold">Pinned Cities</h2>
              {pinned.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setPinned([])}>
                  <Heart className="mr-2 h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>
            <PinnedList
              items={pinned}
              onReorder={reorderPinned}
              renderItem={(place) => (
                <WeatherCard key={place.id} place={place} unit={unit} onUnpin={() => unpinPlace(place.id)} />
              )}
              empty={
                <Card>
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No pinned cities yet. Search above and tap the heart to pin a city.
                  </CardContent>
                </Card>
              }
            />
          </div>

          <div className="md:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-pretty text-lg font-semibold">Hometown</h2>
              {hometown && (
                <Button variant="ghost" size="sm" onClick={() => setHometown(null)}>
                  Remove
                </Button>
              )}
            </div>
            {hometown ? (
              <WeatherCard place={hometown} unit={unit} highlight />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Pick a hometown from search or the quick setup above.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <footer className="mt-10 flex items-center justify-between border-t pt-6 text-xs text-muted-foreground">
          <p>Data by WeatherAPI.com. Local data stored only in your browser.</p>
          <p>© {new Date().getFullYear()} WeatherNow</p>
        </footer>
      </div>
    </main>
  )
}

function WeatherBackground({
  theme,
  place,
}: {
  theme?: string
  place: { latitude: number; longitude: number } | null
}) {
  const isDark = theme === "dark"
  const src = isDark ? "/images/dark-noise.png" : "/images/light-noise.png"

  const { data } = useSWR(
    place ? `/api/weather/forecast?lat=${place.latitude}&lon=${place.longitude}&days=1` : null,
    (u) => fetch(u).then((r) => r.json()),
    { revalidateOnFocus: false },
  )

  const code = data?.current?.weather_code ?? 3
  const isDay = (data?.current?.is_day ?? 1) === 1
  const tone = bgClassForWeather(code, isDay)

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", "bg-neutral-950 dark:bg-neutral-950", tone)}
      style={{
        backgroundImage: `url('${src}')`,
        backgroundSize: "cover",
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
      }}
    />
  )
}
