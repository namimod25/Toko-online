export const Rupiah = (IDR) => {
    const numericIDR = typeof IDR === 'string' ? parseFloat(IDR) : IDR

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericIDR)
}

export const RupiahCurency = (IDR) => {
    const numericIDR = typeof IDR === 'string' ? parseFloat(IDR) : IDR

    if (numericIDR >= 1000000){
        return `Rp ${(numericIDR / 1000000).toFixed(1)}Jt`
    }else if(numericIDR >= 1000){
        return `Rp ${(numericIDR >= 1000).toFixed(0)}Rb`
    }else{
        return Rupiah(numericIDR)
    }
}