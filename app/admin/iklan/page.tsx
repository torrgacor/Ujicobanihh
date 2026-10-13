"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Loader2, Plus, Save, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { uploadHomepageImage } from "@/lib/cdn-upload"
import { DEFAULT_HOMEPAGE_SETTINGS, SOCIAL_PLATFORMS, type HomepageSettings, type SocialPlatform } from "@/data/homepage-settings"

export default function AdminAdvertisementPage() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_HOMEPAGE_SETTINGS)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const authResponse = await fetch("/api/admin/check", { cache: "no-store" })
        if (!authResponse.ok) {
          router.replace("/admin")
          return
        }
        const response = await fetch("/api/homepage-settings", { cache: "no-store" })
        if (response.ok) setSettings(await response.json())
      } catch {
        router.replace("/admin")
      } finally {
        setIsCheckingAuth(false)
      }
    }
    load()
  }, [router])

  const updateSocial = (id: string, field: "platform" | "url", value: string) => {
    setSettings((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((social) =>
        social.id === id ? { ...social, [field]: value } as typeof social : social
      ),
    }))
  }

  const updateAdvertisement = (field: "enabled" | "intervalSeconds", value: boolean | number) => {
    setSettings((current) => ({
      ...current,
      advertisement: { ...current.advertisement, [field]: value },
    }))
  }

  const updateAdvertisementSlide = (id: string, field: "altText" | "destinationUrl" | "imageUrl", value: string) => {
    setSettings((current) => ({
      ...current,
      advertisement: {
        ...current.advertisement,
        slides: current.advertisement.slides.map((slide) => slide.id === id ? { ...slide, [field]: value } : slide),
      },
    }))
  }

  const moveAdvertisementSlide = (id: string, direction: -1 | 1) => {
    setSettings((current) => {
      const slides = [...current.advertisement.slides]
      const index = slides.findIndex((slide) => slide.id === id)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= slides.length) return current
      ;[slides[index], slides[nextIndex]] = [slides[nextIndex], slides[index]]
      return { ...current, advertisement: { ...current.advertisement, slides } }
    })
  }

  const handleImageUpload = async (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setIsUploading(true)
    const result = await uploadHomepageImage(file)
    setIsUploading(false)
    if (!result.success || !result.url) {
      toast({ title: "Gagal mengunggah gambar", description: result.error, variant: "destructive" })
      return
    }
    setSettings((current) => ({
      ...current,
      advertisement: {
        ...current.advertisement,
        enabled: true,
        slides: current.advertisement.slides.map((slide) => slide.id === id ? { ...slide, imageUrl: result.url! } : slide),
      },
    }))
    toast({ title: "Gambar berhasil diunggah", description: "Simpan pengaturan untuk menampilkan iklan." })
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/homepage-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan pengaturan")
      toast({ title: "Pengaturan tersimpan", description: "Perubahan sudah diterapkan di halaman utama." })
    } catch (error) {
      toast({
        title: "Gagal menyimpan",
        description: error instanceof Error ? error.message : "Coba lagi nanti",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-dark-950 text-white">Memeriksa autentikasi...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-500 via-dark-700 to-dark-900 p-4 text-white md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Iklan & Sosial Media</h1>
            <p className="mt-1 text-sm text-gray-400">Atur gambar iklan beranda dan ikon tautan sosial.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin/vouchermts")}>
            <ArrowLeft className="h-4 w-4" /> Kembali ke admin
          </Button>
        </header>

        <Card className="border-dark-300 bg-dark-400 text-white">
          <CardHeader>
            <CardTitle>Iklan halaman utama</CardTitle>
            <CardDescription className="text-gray-400">Gambar akan tampil di atas formulir pembelian.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              {settings.advertisement.slides.map((slide, index) => (
                <div key={slide.id} className="space-y-4 rounded-md border border-dark-300 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-medium">Slide {index + 1}</h3>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="icon" aria-label={`Geser slide ${index + 1} ke atas`} disabled={index === 0} onClick={() => moveAdvertisementSlide(slide.id, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="icon" aria-label={`Geser slide ${index + 1} ke bawah`} disabled={index === settings.advertisement.slides.length - 1} onClick={() => moveAdvertisementSlide(slide.id, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="icon" aria-label={`Hapus slide ${index + 1}`} onClick={() => setSettings((current) => ({
                        ...current,
                        advertisement: { ...current.advertisement, slides: current.advertisement.slides.filter((item) => item.id !== slide.id) },
                      }))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={slide.altText || `Pratinjau slide ${index + 1}`} className="max-h-72 w-full rounded-md bg-dark-500 object-contain" />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-dark-200 text-gray-500">
                      <ImagePlus className="mr-2 h-5 w-5" /> Belum ada gambar
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" disabled={isUploading} asChild>
                      <label className="cursor-pointer">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {isUploading ? "Mengunggah..." : "Pilih gambar"}
                        <input className="sr-only" type="file" accept="image/*" onChange={(event) => handleImageUpload(slide.id, event)} />
                      </label>
                    </Button>
                    <span className="text-xs text-gray-400">PNG, JPG, WEBP atau GIF, maksimal 5 MB</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`ad-alt-${slide.id}`}>Teks alternatif</Label>
                      <Input id={`ad-alt-${slide.id}`} value={slide.altText} onChange={(event) => updateAdvertisementSlide(slide.id, "altText", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ad-link-${slide.id}`}>Tautan tujuan (opsional)</Label>
                      <Input id={`ad-link-${slide.id}`} type="url" placeholder="https://contoh.com" value={slide.destinationUrl} onChange={(event) => updateAdvertisementSlide(slide.id, "destinationUrl", event.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                disabled={settings.advertisement.slides.length >= 10}
                onClick={() => setSettings((current) => ({
                  ...current,
                  advertisement: {
                    ...current.advertisement,
                    slides: [...current.advertisement.slides, {
                      id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                      imageUrl: "",
                      destinationUrl: "",
                      altText: "Iklan",
                    }],
                  },
                }))}
              >
                <Plus className="h-4 w-4" /> Tambah slide iklan
              </Button>
              <span className="text-xs text-gray-400">Maksimal 10 slide.</span>
            </div>

            <div className="max-w-xs space-y-2">
              <Label htmlFor="ad-interval">Durasi tiap slide (detik)</Label>
              <Input id="ad-interval" type="number" min={2} max={60} value={settings.advertisement.intervalSeconds} onChange={(event) => updateAdvertisement("intervalSeconds", Number(event.target.value))} />
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.advertisement.enabled}
                disabled={!settings.advertisement.slides.some((slide) => slide.imageUrl)}
                onChange={(event) => updateAdvertisement("enabled", event.target.checked)}
                className="h-4 w-4 accent-red-600"
              />
              Tampilkan iklan di halaman utama
            </label>
          </CardContent>
        </Card>

        <Card className="border-dark-300 bg-dark-400 text-white">
          <CardHeader>
            <CardTitle>Tombol sosial media</CardTitle>
            <CardDescription className="text-gray-400">Pilih ikon platform dan tautan yang tampil pada tombol mengambang.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.socialLinks.map((social) => (
              <div key={social.id} className="grid gap-3 rounded-md border border-dark-300 p-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                <div className="space-y-2">
                  <Label>Ikon platform</Label>
                  <Select value={social.platform} onValueChange={(value) => updateSocial(social.id, "platform", value as SocialPlatform)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map((platform) => <SelectItem key={platform} value={platform}>{platform}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`social-${social.id}`}>Tautan</Label>
                  <Input id={`social-${social.id}`} type="url" value={social.url} placeholder="https://..." onChange={(event) => updateSocial(social.id, "url", event.target.value)} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Hapus ${social.platform}`}
                  onClick={() => setSettings((current) => ({ ...current, socialLinks: current.socialLinks.filter((item) => item.id !== social.id) }))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={settings.socialLinks.length >= SOCIAL_PLATFORMS.length}
              onClick={() => setSettings((current) => ({
                ...current,
                socialLinks: [...current.socialLinks, { id: `social-${Date.now()}`, platform: "WhatsApp", url: "" }],
              }))}
            >
              <Plus className="h-4 w-4" /> Tambah sosial media
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-8">
          <Button onClick={saveSettings} disabled={isSaving || isUploading} className="bg-red-600 text-white hover:bg-red-700">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Menyimpan..." : "Simpan perubahan"}
          </Button>
        </div>
      </div>
    </main>
  )
    }
