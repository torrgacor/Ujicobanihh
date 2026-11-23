"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, WalletCards } from "lucide-react"

const items = [
  { href: "/affiliate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/affiliate/withdraw", label: "Penarikan Saldo", icon: WalletCards },
  { href: "/affiliate/transactions", label: "Riwayat", icon: History },
]

export default function AffiliateNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Navigasi affiliate">
      {items.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
              active
                ? "border-teal-400/40 bg-teal-500/15 text-teal-200"
                : "border-white/10 bg-zinc-900/70 text-slate-300 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
