import { NextResponse } from "next/server"
import { getCollections } from "@/lib/affiliate"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, phoneNumber } = body
    if (!email || !phoneNumber) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

    const { affiliateProfiles } = await getCollections()
    const profile = await affiliateProfiles.findOne({ email: String(email).toLowerCase().trim(), phoneNumber: String(phoneNumber).trim() })
    if (!profile) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
    if (profile.status !== "active") {
      return NextResponse.json(
        { error: profile.status === "pending" ? "Verifikasi email Anda sebelum login." : "Akun affiliate tidak aktif." },
        { status: 403 }
      )
    }

    const res = NextResponse.json({ success: true })
    res.cookies.set('affiliate_user', profile.userId, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: "lax", secure: process.env.NODE_ENV === "production" })
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
