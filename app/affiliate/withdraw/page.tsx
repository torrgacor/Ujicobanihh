import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AffiliateNav from "@/components/affiliate/affiliate-nav"
import WithdrawForm from "@/components/affiliate/withdraw-form"
import { getAffiliateMinWithdraw, getCollections } from "@/lib/affiliate"
import { formatDate, formatRupiah } from "@/lib/utils"
import { Wallet, Clock3 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AffiliateWithdrawPage() {
  const cookieStore = await cookies()
  const affiliateUser = cookieStore.get("affiliate_user")?.value
  if (!affiliateUser) redirect("/affiliate/login")

  const { affiliateProfiles, withdrawalRequests } = await getCollections()
  const affiliate = await affiliateProfiles.findOne({ userId: affiliateUser })
  if (!affiliate) redirect("/affiliate/register")
  if (affiliate.status !== "active") redirect("/affiliate/login?status=verification-required")

  const [withdrawals, minWithdraw] = await Promise.all([
    withdrawalRequests.find({ affiliateId: affiliateUser }).sort({ createdAt: -1 }).toArray(),
    getAffiliateMinWithdraw(),
  ])

  const payoutMethod = affiliate.withdrawMethod === "e_wallet" ? "E-Wallet" : "Transfer Bank"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.1),_transparent_35%),linear-gradient(135deg,_#050505_0%,_#111827_100%)] px-4 py-6 text-slate-50 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <AffiliateNav />

        <div>
          <h1 className="text-3xl font-semibold">Penarikan Saldo</h1>
          <p className="mt-2 text-slate-400">Ajukan penarikan komisi affiliate ke rekening terdaftar.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border border-white/10 bg-zinc-950/75">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-5 w-5 text-teal-400" />
                Saldo Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{formatRupiah(affiliate.wallet?.balance ?? 0)}</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-zinc-950/75">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock3 className="h-5 w-5 text-amber-400" />
                Saldo Tertahan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{formatRupiah(affiliate.wallet?.pending ?? 0)}</p>
            </CardContent>
          </Card>
        </div>

        <WithdrawForm
          withdrawMethod={payoutMethod}
          accountNumber={affiliate.accountNumber || ""}
          accountName={affiliate.accountName || ""}
          balance={affiliate.wallet?.balance ?? 0}
          minWithdraw={minWithdraw}
        />

        <Card className="border border-white/10 bg-zinc-950/75">
          <CardHeader>
            <CardTitle>Riwayat Pengajuan</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-slate-300">Tanggal</TableHead>
                  <TableHead className="text-slate-300">Jumlah</TableHead>
                  <TableHead className="text-slate-300">Metode</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Referensi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdraw) => (
                  <TableRow key={withdraw._id.toString()} className="border-white/10">
                    <TableCell className="text-slate-300">{formatDate(withdraw.createdAt)}</TableCell>
                    <TableCell className="font-semibold text-amber-300">{formatRupiah(withdraw.amount)}</TableCell>
                    <TableCell className="text-slate-300">{withdraw.method}</TableCell>
                    <TableCell>
                      <span className={`rounded px-2 py-1 text-xs ${
                        withdraw.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : withdraw.status === "rejected"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {withdraw.status === "approved" ? "Disetujui" : withdraw.status === "rejected" ? "Ditolak" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300">{withdraw.txId || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {withdrawals.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Belum ada pengajuan penarikan.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
