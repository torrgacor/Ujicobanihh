"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function WithdrawForm({
  withdrawMethod,
  accountNumber,
  accountName,
}: {
  withdrawMethod: string
  accountNumber: string
  accountName: string
}) {
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || amount <= 0) {
      toast({ title: "Jumlah tidak valid", description: "Masukkan jumlah penarikan yang benar", variant: "destructive" })
      return
    }
    if (!withdrawMethod || !accountNumber || !accountName) {
      toast({ title: "Data rekening belum lengkap", description: "Hubungi admin untuk memperbarui data rekening withdraw Anda", variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/affiliate/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Berhasil dikirim", description: "Pengajuan withdraw berhasil dibuat", variant: "default" })
        setAmount(0)
      } else {
        toast({ title: "Gagal mengajukan", description: data.error || "Silakan coba lagi", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Gagal mengajukan", description: "Tidak dapat terhubung ke server", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="space-y-4 border border-white/10 bg-zinc-950/75 text-white">
      <CardHeader>
        <CardTitle>Ajukan Withdraw</CardTitle>
        <CardDescription>Withdraw akan dikirim ke rekening yang Anda daftarkan. Hubungi admin jika ingin memperbarui data rekening.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Jumlah (Rp)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="50000"
              className="border-white/10 bg-zinc-900 text-white placeholder:text-slate-500 focus-visible:ring-teal-500"
            />
          </div>
          <div className="space-y-2 rounded-md border border-white/10 bg-zinc-900/70 p-4 sm:col-span-2">
            <p className="text-sm font-medium">Data rekening terdaftar</p>
            <p className="text-sm text-muted-foreground">{withdrawMethod} • {accountNumber}</p>
            <p className="text-sm text-muted-foreground">Atas nama {accountName}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Pastikan jumlah melebihi batas minimal withdraw dan tidak lebih dari saldo Anda.</p>
          <Button type="submit" onClick={submit} disabled={loading} className="bg-teal-600 text-white hover:bg-teal-500">
            {loading ? "Mengirim..." : "Ajukan Withdraw"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
