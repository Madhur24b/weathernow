"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLocalStorage } from "@/hooks/use-local-storage"

export default function SettingsPage() {
  const { resolvedTheme } = useTheme()
  const [name, setName] = useLocalStorage<string | null>("weathernow:name", null)
  const [unit, setUnit] = useLocalStorage<"c" | "f">("weathernow:unit", "c")
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <h1 className="mb-4 text-xl font-semibold">Settings</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-3">
            <div className="grid w-full gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                placeholder="e.g. Alex"
                value={name ?? ""}
                onChange={(e) => setName(e.target.value)}
                aria-label="Your name"
              />
            </div>
            <Button variant="secondary" onClick={() => setName((name ?? "").trim() || null)}>
              Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Theme</div>
              <div className="mt-1">
                <ThemeToggle />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Temperature Unit</div>
              <Tabs value={unit} onValueChange={(v) => setUnit(v as "c" | "f")}>
                <TabsList>
                  <TabsTrigger value="c">°C</TabsTrigger>
                  <TabsTrigger value="f">°F</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <a href="/" className="text-sm underline">
          Back to WeatherNow
        </a>
      </div>
    </main>
  )
}
