import { NextResponse } from "next/server";

function mapWeatherApiCodeToWmoLike(code: number): number {
  // Map WeatherAPI condition codes to simplified WMO-like categories
  if (code === 1000) return 0; // clear
  if ([1003, 1006, 1009].includes(code)) return 2; // cloud
  if ([1030, 1135, 1147].includes(code)) return 45; // fog
  if (
    [
      1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246,
      1204, 1207, 1249, 1252, 1072, 1168, 1171,
    ].includes(code)
  )
    return 63; // rain / drizzle
  if (
    [
      1066, 1069, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258,
      1237, 1261, 1264,
    ].includes(code)
  )
    return 75; // snow / ice
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 95; // thunder
  return 3; // default cloud
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const days = searchParams.get("days") || "7";

    const key = process.env.WEATHERAPI_KEY;
    if (!key) {
      console.error("API Key is missing");
      return NextResponse.json(
        { error: "Missing WEATHERAPI_KEY" },
        { status: 500 }
      );
    }
    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Missing coordinates" },
        { status: 400 }
      );
    }

    const url = new URL("https://api.weatherapi.com/v1/forecast.json");
    url.searchParams.set("key", key);
    url.searchParams.set("q", `${lat},${lon}`);
    url.searchParams.set("days", days);
    url.searchParams.set("aqi", "no");
    url.searchParams.set("alerts", "no");

    console.log(
      "Fetching weather data from:",
      url.toString().replace(key, "[REDACTED]")
    );

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: { message: res.statusText } }));
      console.error("WeatherAPI Error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "WeatherAPI forecast failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (!data?.current) {
      console.error("Invalid response from WeatherAPI:", data);
      return NextResponse.json(
        { error: "Invalid response from WeatherAPI" },
        { status: 500 }
      );
    }

    // Normalize to Open-Meteo-like structure with Celsius base
    const normalized = {
      current: {
        temperature_2m: data.current?.temp_c ?? 0,
        apparent_temperature:
          data.current?.feelslike_c ?? data.current?.temp_c ?? 0,
        relative_humidity_2m: data.current?.humidity ?? 0,
        wind_speed_10m: data.current?.wind_kph
          ? Number((data.current.wind_kph / 3.6).toFixed(1))
          : 0, // kph -> m/s
        is_day: data.current?.is_day === 1 ? 1 : 0,
        weather_code: mapWeatherApiCodeToWmoLike(
          data.current?.condition?.code ?? 1003
        ),
      },
      daily: (() => {
        const daysArr = data.forecast?.forecastday ?? [];
        return {
          time: daysArr.map((d: any) => d.date),
          temperature_2m_max: daysArr.map((d: any) => d.day?.maxtemp_c ?? 0),
          temperature_2m_min: daysArr.map((d: any) => d.day?.mintemp_c ?? 0),
          weather_code: daysArr.map((d: any) =>
            mapWeatherApiCodeToWmoLike(d?.day?.condition?.code ?? 1003)
          ),
          sunrise: daysArr.map((d: any) => d.astro?.sunrise ?? null),
          sunset: daysArr.map((d: any) => d.astro?.sunset ?? null),
        };
      })(),
    };

    return NextResponse.json(normalized, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in weather forecast API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
