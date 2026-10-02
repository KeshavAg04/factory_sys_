export function formatDateDisplay(
  value?: string | Date | null
) {
  if (!value) return ''

  const raw =
    value instanceof Date
      ? `${value.getFullYear()}-${String(
          value.getMonth() + 1
        ).padStart(2, '0')}-${String(
          value.getDate()
        ).padStart(2, '0')}`
      : String(value).slice(0, 10)

  const [
    year,
    month,
    day,
  ] = raw.split('-')

  if (!year || !month || !day) {
    return String(value)
  }

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    )

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}

export function formatNumber(
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
) {
  return Number(value || 0).toLocaleString(
    'en-IN',
    options
  )
}

export function formatBags(
  value: number | string | null | undefined
) {
  return formatNumber(
    value,
    {
      maximumFractionDigits: 0,
    }
  )
}

export function formatMT(
  value: number | string | null | undefined
) {
  return `${Number(value || 0).toFixed(2)} MT`
}

export function formatCurrency(
  value: number | string | null | undefined
) {
  return `₹${formatNumber(value)}`
}
