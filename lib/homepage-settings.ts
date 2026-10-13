import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { DEFAULT_HOMEPAGE_SETTINGS, type HomepageSettings } from "@/data/homepage-settings"

const SETTINGS_KEY = "homepage_content"

export async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const setting = await db.collection<{ key: string; value: unknown }>("app_settings").findOne({ key: SETTINGS_KEY })
    if (!setting?.value || typeof setting.value !== "object") return DEFAULT_HOMEPAGE_SETTINGS

    const value = setting.value as Partial<HomepageSettings> & {
      advertisement?: HomepageSettings["advertisement"] & {
        imageUrl?: string
        destinationUrl?: string
        altText?: string
      }
    }
    const advertisement = value.advertisement
    const intervalSeconds = advertisement?.intervalSeconds
    const slides = Array.isArray(advertisement?.slides)
      ? advertisement.slides
      : advertisement?.imageUrl
        ? [{
            id: "legacy-advertisement",
            imageUrl: advertisement.imageUrl,
            destinationUrl: advertisement.destinationUrl ?? "",
            altText: advertisement.altText ?? "Iklan",
          }]
        : []

    return {
      ...DEFAULT_HOMEPAGE_SETTINGS,
      ...value,
      socialLinks: Array.isArray(value.socialLinks) ? value.socialLinks : DEFAULT_HOMEPAGE_SETTINGS.socialLinks,
      advertisement: {
        slides,
        enabled: Boolean(advertisement?.enabled),
        intervalSeconds: Number.isInteger(intervalSeconds)
          ? Math.min(60, Math.max(2, intervalSeconds!))
          : DEFAULT_HOMEPAGE_SETTINGS.advertisement.intervalSeconds,
      },
    }
  } catch (error) {
    console.error("Gagal memuat pengaturan halaman utama:", error)
    return DEFAULT_HOMEPAGE_SETTINGS
  }
}

export async function saveHomepageSettings(settings: HomepageSettings): Promise<void> {
  const client = await clientPromise
  const db = client.db(appConfig.mongodb.dbName)
  await db.collection("app_settings").updateOne(
    { key: SETTINGS_KEY },
    { $set: { key: SETTINGS_KEY, value: settings, updatedAt: new Date() } },
    { upsert: true }
  )
}