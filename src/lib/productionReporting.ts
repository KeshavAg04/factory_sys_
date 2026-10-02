import { supabase } from './supabase'

export type ProductionEntry = {
  id: string | number
  production_date: string
  labour_name?: string | null
  factory?: string | null
  machine?: string | null
  shift?: string | null
  mesh?: string | null
  bag_type?: string | null
  bag_name?: string | null
  quantity?: number | string | null
  rate?: number | string | null
  amount?: number | string | null
  created_at?: string | null
}

const PAGE_SIZE = 1000

export function dateValue(
  value: unknown
) {
  return String(value || '').slice(0, 10)
}

export function formatDateValue(
  date: Date
) {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      date.getDate()
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function monthBounds(
  offset: number
) {
  const now =
    new Date()

  const start =
    new Date(
      now.getFullYear(),
      now.getMonth() + offset,
      1
    )

  const end =
    new Date(
      now.getFullYear(),
      now.getMonth() + offset + 1,
      0
    )

  return {
    from: formatDateValue(start),
    to: formatDateValue(end),
  }
}

export function productionQuantity(
  entry: Pick<ProductionEntry, 'quantity'>
) {
  return Number(entry.quantity || 0)
}

export function sumProductionQuantity(
  entries: Pick<ProductionEntry, 'quantity'>[]
) {
  return entries.reduce(
    (sum, entry) =>
      sum + productionQuantity(entry),
    0
  )
}

export function productionTons(
  entry: Pick<ProductionEntry, 'bag_type' | 'quantity'>
) {
  const type =
    entry.bag_type?.toLowerCase() || ''

  const quantity =
    productionQuantity(entry)

  if (type.includes('1400')) return quantity * 1.4
  if (type.includes('1350')) return quantity * 1.35
  if (type.includes('1250')) return quantity * 1.25
  if (
    type.includes('50kg') ||
    type.includes('50 kg')
  ) return quantity * 0.05

  return 0
}

export function sumProductionTons(
  entries: Pick<ProductionEntry, 'bag_type' | 'quantity'>[]
) {
  return entries.reduce(
    (sum, entry) =>
      sum + productionTons(entry),
    0
  )
}

export async function fetchProductionEntries(
  factoryFilter = ''
) {
  const rows: ProductionEntry[] = []
  let from = 0

  while (true) {
    let query =
      supabase
        .from('production_entries')
        .select(
          'id,production_date,labour_name,factory,machine,shift,mesh,bag_type,bag_name,quantity,rate,amount,created_at'
        )
        .order(
          'production_date',
          {
            ascending: true,
          }
        )
        .range(
          from,
          from + PAGE_SIZE - 1
        )

    if (factoryFilter) {
      query =
        query.eq(
          'factory',
          factoryFilter
        )
    }

    const {
      data,
      error,
    } = await query

    if (error) {
      throw error
    }

    const page =
      data || []

    rows.push(
      ...page
    )

    if (page.length < PAGE_SIZE) {
      break
    }

    from += PAGE_SIZE
  }

  return rows
}
