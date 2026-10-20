export interface HasilUploadCdn {
  success: boolean
  url?: string
  fileName?: string
  size?: number
  error?: string
}

export async function uploadHomepageImage(file: File): Promise<HasilUploadCdn> {
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File harus berupa gambar" }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Ukuran gambar maksimal 5 MB" }
  }

  try {
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("https://cdn.zass.in/upload", { method: "POST", body: formData })
    const data = await response.json()

    if (!response.ok || !data?.success || typeof data.url !== "string") {
      return { success: false, error: data?.message || "Gagal mengunggah gambar iklan" }
    }

    return { success: true, url: data.url, fileName: data.fileName, size: data.size }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tidak dapat terhubung ke CDN" }
  }
}

export async function uploadBuktiTransfer(file: File): Promise<HasilUploadCdn> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("https://cdn.zass.in/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || "Gagal mengunggah bukti transfer" }
    }

    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      size: data.size,
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Tidak dapat terhubung ke CDN" }
  }
}
