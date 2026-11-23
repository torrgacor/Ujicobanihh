"use server"

import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { sendEmail } from "@/lib/email-service"
import { sendTelegramAdminMessage } from "@/lib/telegram-service"
import { syncAffiliateLevel } from "@/lib/affiliate"
import crypto from "crypto"

export interface RegisterAffiliateInput {
  storeName: string
  email: string
  ownerName: string
  phoneNumber: string
  withdrawMethod: string
  accountNumber: string
  accountName: string
}

export async function registerAffiliate(input: RegisterAffiliateInput) {
  try {
    // Validate input
    if (!input.storeName?.trim()) {
      return { success: false, error: "Nama toko harus diisi" }
    }
    if (!input.email?.trim()) {
      return { success: false, error: "Email harus diisi" }
    }
    if (!input.ownerName?.trim()) {
      return { success: false, error: "Nama pemilik harus diisi" }
    }
    if (!input.phoneNumber?.trim()) {
      return { success: false, error: "Nomor telepon harus diisi" }
    }
    if (!input.withdrawMethod?.trim()) {
      return { success: false, error: "Metode withdraw harus dipilih" }
    }
    if (!input.accountNumber?.trim()) {
      return { success: false, error: "Nomor akun harus diisi" }
    }
    if (!input.accountName?.trim()) {
      return { success: false, error: "Nama akun harus diisi" }
    }

    const email = input.email.trim().toLowerCase()
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const affiliateProfiles = db.collection("affiliate_profiles")
    const existing = await affiliateProfiles.findOne({ email })

    if (existing && existing.status !== "pending") {
      return { success: false, error: "Email sudah terdaftar sebagai affiliate" }
    }

    const token = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const verificationUrl = `${(process.env.NEXT_PUBLIC_APP_URL || appConfig.LinkWebsite).replace(/\/+$/, "")}/affiliate/verify?token=${token}`
    const now = new Date()
    let userId: string
    let referralCode: string

    if (existing) {
      userId = existing.userId
      referralCode = existing.referralCode
      const updateResult = await affiliateProfiles.updateOne(
        { userId, status: "pending" },
        {
          $set: {
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpiresAt: verificationExpiresAt,
            updatedAt: now,
          },
        }
      )
      if (updateResult.matchedCount === 0) {
        return { success: false, error: "Status akun berubah. Silakan coba mendaftar kembali." }
      }
    } else {
      userId = `affiliate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      referralCode = generateReferralCode()
      const affiliateData = {
        userId,
        storeName: input.storeName.trim(),
        email,
        ownerName: input.ownerName.trim(),
        phoneNumber: input.phoneNumber.trim(),
        withdrawMethod: input.withdrawMethod,
        accountNumber: input.accountNumber.trim(),
        accountName: input.accountName.trim(),
        referralCode,
        status: "pending" as const,
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: verificationExpiresAt,
        wallet: {
          balance: 0,
          pending: 0,
        },
        referralStats: {
          clicks: 0,
          conversions: 0,
          successfulTransactions: 0,
          totalCommission: 0,
        },
        levelName: "Bronze",
        levelThreshold: 0,
        levelCommissionPercent: 10,
        createdAt: now,
        updatedAt: now,
      }

      await affiliateProfiles.insertOne(affiliateData)
      await syncAffiliateLevel(userId)
    }

    const emailResult = await sendEmail({
      to: email,
      subject: "Verifikasi Email Affiliate",
      html: `
        <h2>Verifikasi Pendaftaran Affiliate</h2>
        <p>Terima kasih telah mendaftar sebagai affiliate di ${appConfig.nameHost}.</p>
        <p>Aktifkan akun Anda dengan mengklik tombol berikut. Tautan berlaku selama 24 jam.</p>
        <p><a href="${verificationUrl}">Verifikasi dan Aktifkan Akun</a></p>
        <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
      `,
    })

    if (!emailResult.success) {
      await affiliateProfiles.updateOne(
        { userId, emailVerificationTokenHash: tokenHash },
        { $unset: { emailVerificationTokenHash: "", emailVerificationExpiresAt: "" } }
      )
      if (!existing) {
        await affiliateProfiles.deleteOne({ userId })
      }
      return { success: false, error: "Email verifikasi gagal dikirim. Silakan coba mendaftar kembali." }
    }

    await sendTelegramAdminMessage(
      `🆕 REGISTRASI AFFILIATE BARU\n\nNama Toko: ${existing?.storeName || input.storeName}\nEmail: ${email}\nUser ID: ${userId}\nStatus: Menunggu Verifikasi Email`
    ).catch((error) => console.error("Gagal mengirim notifikasi registrasi affiliate:", error))

    return {
      success: true,
      message: "Registrasi berhasil! Silakan buka email dan aktifkan akun melalui tautan verifikasi.",
      userId,
      referralCode,
    }
  } catch (error) {
    console.error("registerAffiliate error:", error)
    return { success: false, error: "Gagal mendaftar affiliate" }
  }
}

export async function verifyAffiliateEmail(token: string) {
  try {
    if (!token?.trim()) {
      return { success: false, error: "Tautan verifikasi tidak valid atau sudah kedaluwarsa." }
    }

    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const affiliateProfiles = db.collection("affiliate_profiles")
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex")
    const result = await affiliateProfiles.updateOne(
      {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { $gt: new Date() },
        status: "pending",
      },
      {
        $set: {
          status: "active",
          updatedAt: new Date(),
        },
        $unset: {
          emailVerificationTokenHash: "",
          emailVerificationExpiresAt: "",
        },
      },
    )

    if (result.modifiedCount === 0) {
      return { success: false, error: "Tautan verifikasi tidak valid atau sudah kedaluwarsa." }
    }

    return { success: true, message: "Email berhasil diverifikasi. Akun affiliate Anda sekarang aktif." }
  } catch (error) {
    console.error("verifyAffiliateEmail error:", error)
    return { success: false, error: "Gagal memverifikasi email affiliate" }
  }
}

export async function rejectAffiliate(userId: string, reason?: string) {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const affiliateProfiles = db.collection("affiliate_profiles")

    const result = await affiliateProfiles.findOneAndUpdate(
      { userId },
      {
        $set: {
          status: "rejected",
          rejectionReason: reason,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )

    if (!result) {
      return { success: false, error: "Affiliate tidak ditemukan" }
    }

    // Send email
    await sendEmail({
      to: result.email,
      subject: "Pendaftaran Affiliate Ditolak",
      html: `
        <h2>Pendaftaran Affiliate Ditolak</h2>
        <p>Maaf, pendaftaran affiliate Anda telah ditolak.</p>
        ${reason ? `<p><strong>Alasan:</strong> ${reason}</p>` : ""}
        <p>Untuk informasi lebih lanjut, silakan hubungi support kami.</p>
      `,
    })

    return { success: true, message: "Affiliate berhasil ditolak" }
  } catch (error) {
    console.error("rejectAffiliate error:", error)
    return { success: false, error: "Gagal menolak affiliate" }
  }
}

export async function getAffiliateByCode(referralCode: string) {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const affiliateProfiles = db.collection("affiliate_profiles")

    const affiliate = await affiliateProfiles.findOne({
      referralCode,
      status: "active",
    })

    if (!affiliate) {
      return { success: false, error: "Referral code tidak valid" }
    }

    return {
      success: true,
      data: {
        userId: affiliate.userId,
        storeName: affiliate.storeName,
        referralCode: affiliate.referralCode,
      },
    }
  } catch (error) {
    console.error("getAffiliateByCode error:", error)
    return { success: false, error: "Gagal memvalidasi referral code" }
  }
}

function generateReferralCode(): string {
  return `ref_${crypto.randomBytes(6).toString("hex").toUpperCase()}`
}
