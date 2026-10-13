"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Facebook, Gamepad2, Instagram, MessageCircle, Music2, Send, Share2, Twitter, Youtube } from "lucide-react"
import { DEFAULT_HOMEPAGE_SETTINGS, type HomepageSettings, type SocialPlatform } from "@/data/homepage-settings"

const platformIcons = {
  WhatsApp: MessageCircle,
  Instagram,
  TikTok: Music2,
  Telegram: Send,
  Facebook,
  YouTube: Youtube,
  X: Twitter,
  Discord: Gamepad2,
} satisfies Record<SocialPlatform, typeof MessageCircle>

const platformColors: Record<SocialPlatform, string> = {
  WhatsApp: "bg-[#25D366] hover:bg-[#128C7E]",
  Instagram: "bg-[#E4405F] hover:bg-[#C13584]",
  TikTok: "bg-black hover:bg-[#333333]",
  Telegram: "bg-[#229ED9] hover:bg-[#168AC4]",
  Facebook: "bg-[#1877F2] hover:bg-[#0E63D7]",
  YouTube: "bg-[#FF0000] hover:bg-[#D90000]",
  X: "bg-[#111111] hover:bg-[#333333]",
  Discord: "bg-[#5865F2] hover:bg-[#4752C4]",
}

export function SocialMediaButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [socialLinks, setSocialLinks] = useState(DEFAULT_HOMEPAGE_SETTINGS.socialLinks)

  useEffect(() => {
    fetch("/api/homepage-settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((settings: HomepageSettings) => setSocialLinks(settings.socialLinks))
      .catch((error) => console.error("Gagal memuat tautan sosial media:", error))
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 flex flex-col-reverse items-center gap-3"
          >
            {socialLinks.map((social, index) => {
              const Icon = platformIcons[social.platform]
              return (
                <motion.a
                  key={social.id}
                  href={social.url}
                  aria-label={social.platform}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ${platformColors[social.platform]}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={isOpen ? "Tutup tautan sosial media" : "Buka tautan sosial media"}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 225 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Share2 className="h-5 w-5" />
      </motion.button>
    </div>
  )
}