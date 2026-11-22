import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createWithdrawalRequest } from "@/app/actions/affiliate"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const affiliateId = cookieStore.get("affiliate_user")?.value
    if (!affiliateId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount } = body
    if (!amount) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 })
    }

    const res = await createWithdrawalRequest({ affiliateId, amount: Number(amount) })
    if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 })
    return NextResponse.json({ success: true, requestId: res.requestId })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
