"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyAffiliateEmail } from "@/app/actions/affiliate-registration"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"

function AffiliateVerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleVerify = async () => {
    if (!token) {
      setResult({ success: false, message: "Tautan verifikasi tidak valid." })
      return
    }

    setIsLoading(true)
    try {
      const verification = await verifyAffiliateEmail(token)
      setResult({
        success: verification.success,
        message: verification.success
          ? verification.message || "Email berhasil diverifikasi."
          : verification.error || "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
      })
    } catch {
      setResult({ success: false, message: "Terjadi kesalahan saat memverifikasi email." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_45%),linear-gradient(135deg,_#050505_0%,_#111827_100%)] px-4 py-10 text-white">
      <Card className="w-full max-w-md border-white/10 bg-zinc-950/90 shadow-2xl shadow-black/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/15 text-teal-300">
            <Check className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Verifikasi Email Affiliate</CardTitle>
          <CardDescription className="text-slate-400">
            Aktifkan akun affiliate dengan mengonfirmasi alamat email Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <p className={result.success ? "text-center text-emerald-300" : "text-center text-rose-300"} role="status">
              {result.message}
            </p>
          ) : !token ? (
            <p className="text-center text-rose-300" role="alert">Tautan verifikasi tidak valid.</p>
          ) : (
            <Button onClick={handleVerify} disabled={isLoading || !token} className="w-full bg-teal-600 hover:bg-teal-500">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Memverifikasi..." : "Verifikasi dan Aktifkan Akun"}
            </Button>
          )}
          {result?.success && (
            <Button asChild className="w-full bg-teal-600 hover:bg-teal-500">
              <Link href="/affiliate/login">Login Affiliate</Link>
            </Button>
          )}
          {!result?.success && (
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full border-white/10 bg-zinc-900 text-white hover:bg-zinc-800">
                <Link href="/affiliate/register">Daftar ulang / kirim tautan baru</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full text-slate-300 hover:bg-zinc-900 hover:text-white">
                <Link href="/affiliate">Kembali</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AffiliateVerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Memuat...</div>}>
      <AffiliateVerifyContent />
    </Suspense>
  )
}
