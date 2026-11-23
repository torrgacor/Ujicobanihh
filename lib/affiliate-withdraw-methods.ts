export const AFFILIATE_WITHDRAW_METHODS = [
  { value: "transfer_bank", label: "Transfer Bank" },
  { value: "e_wallet", label: "E-Wallet (OVO/Dana/GoPay)" },
  { value: "dana", label: "DANA" },
  { value: "ovo", label: "OVO" },
  { value: "gopay", label: "GoPay" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "linkaja", label: "LinkAja" },
  { value: "pulsa", label: "Pulsa" },
] as const

export function getAffiliateWithdrawMethodLabel(method?: string | null) {
  return AFFILIATE_WITHDRAW_METHODS.find((option) => option.value === method)?.label ?? method ?? "Transfer Bank"
}
