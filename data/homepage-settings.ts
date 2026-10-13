import { appConfig } from "@/data/config"

export const SOCIAL_PLATFORMS = [
  "WhatsApp",
  "Instagram",
  "TikTok",
  "Telegram",
  "Facebook",
  "YouTube",
  "X",
  "Discord",
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

export interface HomepageSocialLink {
  id: string
  platform: SocialPlatform
  url: string
}

export interface HomepageAdvertisementSlide {
  id: string
  imageUrl: string
  destinationUrl: string
  altText: string
}

export interface HomepageSettings {
  socialLinks: HomepageSocialLink[]
  advertisement: {
    slides: HomepageAdvertisementSlide[]
    enabled: boolean
    intervalSeconds: number
  }
}

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  socialLinks: [
    { id: "whatsapp", platform: "WhatsApp", url: appConfig.socialMedia.whatsapp },
    { id: "instagram", platform: "Instagram", url: appConfig.socialMedia.instagram },
    { id: "tiktok", platform: "TikTok", url: appConfig.socialMedia.tiktok },
  ],
  advertisement: {
    slides: [],
    enabled: false,
    intervalSeconds: 5,
  },
}