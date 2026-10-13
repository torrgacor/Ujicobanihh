import { NextResponse } from "next/server"
import { getHomepageSettings } from "@/lib/homepage-settings"

export async function GET() {
  const settings = await getHomepageSettings()
  return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } })
}
