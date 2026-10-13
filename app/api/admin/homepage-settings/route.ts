import { NextResponse } from "next/server"
import { isAdminRequestAuthorized } from "@/lib/admin-auth"
import { SOCIAL_PLATFORMS, type HomepageSettings } from "@/data/homepage-settings"
import { saveHomepageSettings } from "@/lib/homepage-settings"

function isValidUrl(value: string, allowEmpty = false) {
  if (!value && allowEmpty) return true
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  if (!isAdminRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const socials = body?.socialLinks
    const advertisement = body?.advertisement
    const rawSlides = advertisement?.slides
    const intervalSeconds = Number(advertisement?.intervalSeconds)

    if (!Array.isArray(socials) || socials.length > 8) {
      return NextResponse.json({ error: "Daftar sosial media tidak valid" }, { status: 400 })
    }

    const socialLinks = socials.map((social: any) => ({
      id: String(social?.id ?? "").slice(0, 80),
      platform: social?.platform,
      url: String(social?.url ?? "").trim(),
    }))

    if (socialLinks.some((social: HomepageSettings["socialLinks"][number]) =>
      !social.id || !SOCIAL_PLATFORMS.includes(social.platform) || !isValidUrl(social.url)
    )) {
      return NextResponse.json({ error: "Platform atau tautan sosial media tidak valid" }, { status: 400 })
    }

    if (!Array.isArray(rawSlides) || rawSlides.length > 10) {
      return NextResponse.json({ error: "Daftar slide iklan tidak valid (maksimal 10)" }, { status: 400 })
    }

    if (!Number.isInteger(intervalSeconds) || intervalSeconds < 2 || intervalSeconds > 60) {
      return NextResponse.json({ error: "Durasi slide harus antara 2 dan 60 detik" }, { status: 400 })
    }

    const slides = rawSlides.map((slide: any) => ({
      id: String(slide?.id ?? "").slice(0, 80),
      imageUrl: String(slide?.imageUrl ?? "").trim(),
      destinationUrl: String(slide?.destinationUrl ?? "").trim(),
      altText: String(slide?.altText ?? "Iklan").trim().slice(0, 120) || "Iklan",
    }))

    if (slides.some((slide: HomepageSettings["advertisement"]["slides"][number]) =>
      !slide.id || !isValidUrl(slide.imageUrl, true) || !isValidUrl(slide.destinationUrl, true)
    )) {
      return NextResponse.json({ error: "URL gambar dan tujuan iklan harus menggunakan HTTPS" }, { status: 400 })
    }

    const settings: HomepageSettings = {
      socialLinks,
      advertisement: {
        slides,
        enabled: Boolean(advertisement?.enabled) && slides.some((slide: HomepageSettings["advertisement"]["slides"][number]) => Boolean(slide.imageUrl)),
        intervalSeconds,
      },
    }

    await saveHomepageSettings(settings)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Gagal menyimpan pengaturan halaman utama:", error)
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 })
  }
  }
