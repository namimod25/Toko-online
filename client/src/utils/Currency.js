export const Rupiah = (amount) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount)
}

export const RupiahCompact = (amount) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (numericAmount >= 1000000) {
    return `Rp ${(numericAmount / 1000000).toFixed(1)}jt`
  } else if (numericAmount >= 1000) {
    return `Rp ${(numericAmount / 1000).toFixed(0)}rb`
  } else {
    return Rupiah(numericAmount)
  }
}