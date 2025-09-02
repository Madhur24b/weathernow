import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const key = process.env.WEATHERAPI_KEY
  if (!key) {
    return NextResponse.json({ error: "Missing WEATHERAPI_KEY" }, { status: 500 })
  }
  if (!q) {
    return NextResponse.json({ results: [] })
  }

  const url = new URL("https://api.weatherapi.com/v1/search.json")
  url.searchParams.set("key", key)
  url.searchParams.set("q", q)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    return NextResponse.json({ error: "WeatherAPI search failed" }, { status: 500 })
  }
  const data = (await res.json()) as Array<{
    id?: number
    name: string
    region?: string
    country?: string
    lat: number
    lon: number
  }>

  const results = (data || []).map((r) => ({
    id: String(r.id ?? `${r.lat},${r.lon}`),
    name: r.name,
    admin1: r.region,
    country: r.country,
    latitude: r.lat,
    longitude: r.lon,
  }))

  return NextResponse.json({ results })
}
