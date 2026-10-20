"use server"

import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { plans } from "@/data/plans"
import { pterodactylConfig } from "@/data/config"
import type { PaymentData } from "@/app/actions/create-payment"

type TransactionDetails = Omit<PaymentData, "_id"> & {
  planName: string
  selectedEggName: string | null
  replaceUsed?: number
}

export async function getSuccessfulTransactions() {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    const transactions = await paymentsCollection.find({}).sort({ createdAt: -1 }).limit(50).toArray()

    return transactions.map((transaction) => {
      const plan = plans.find((p) => p.id === transaction.planId)
      
      // Get egg name if selectedEggId exists
      let eggName = null
      if (transaction.selectedEggId) {
        const config = transaction.serverType === "private" ? pterodactylConfig.private : pterodactylConfig.public
        const egg = config?.eggs?.find((e: any) => e.id === transaction.selectedEggId)
        eggName = egg?.nama || `Egg ID: ${transaction.selectedEggId}`
      }

      return {
        transactionId: transaction.transactionId,
        email: maskEmail(transaction.email),
        planId: transaction.planId,
        planName: plan ? plan.name : "Unknown Plan",
        total: transaction.total,
        createdAt: transaction.createdAt,
        status: transaction.status,
        selectedEggId: transaction.selectedEggId,
        selectedEggName: eggName,
      }
    })
  } catch (error) {
    console.error("Error getting successful transactions:", error)
    return []
  }
}

export async function getTransactionById(transactionId: string): Promise<TransactionDetails | null> {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    const transaction = await paymentsCollection.findOne({ transactionId }) as PaymentData | null

    if (!transaction) {
      return null
    }

    if (transaction.replaceUsed === undefined) {
      await paymentsCollection.updateOne(
        { transactionId },
        { $set: { replaceUsed: 0 } }
      )
      transaction.replaceUsed = 0
    }

    const plan = plans.find((p) => p.id === transaction.planId)
    
    // Get egg name if selectedEggId exists
    let eggName = null
    if (transaction.selectedEggId) {
      const config = transaction.serverType === "private" ? pterodactylConfig.private : pterodactylConfig.public
      const egg = config?.eggs?.find((e: any) => e.id === transaction.selectedEggId)
      eggName = egg?.nama || `Egg ID: ${transaction.selectedEggId}`
    }

    return {
      ...transaction,
      planName: plan ? plan.name : "Unknown Plan",
      selectedEggName: eggName,
    } as TransactionDetails
  } catch (error) {
    console.error("Error getting transaction by ID:", error)
    return null
  }
}

export async function updateTransactionReplace(id: string) {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    const trx = await paymentsCollection.findOne({ transactionId: id })
    if (!trx) return null

    const newReplaceUsed = (trx.replaceUsed || 0) + 1

    await paymentsCollection.updateOne(
      { transactionId: id },
      { $set: { replaceUsed: newReplaceUsed } }
    )

    return { success: true, replaceUsed: newReplaceUsed }
  } catch (error) {
    console.error("Error updating transaction replace:", error)
    return { success: false, error: (error as Error).message }
  }
}

function maskEmail(email: string): string {
  const [username, domain] = email.split("@")
  if (username.length <= 3) return `${username}***@${domain}`
  const visiblePart = username.substring(0, 3)
  return `${visiblePart}***@${domain}`
}
