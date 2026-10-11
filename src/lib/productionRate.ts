export type RateMasterRow = {
  mesh: string
  bag_type: string
  rate: number | string
}

type SupabaseRateClient = {
  from: (table: 'rate_master') => {
    select: (columns: string) => {
      then?: unknown
      eq: (
        column: string,
        value: string
      ) => {
        eq: (
          column: string,
          value: string
        ) => {
          maybeSingle: () => Promise<{
            data: { rate: number | string } | null
            error: unknown
          }>
        }
      }
    }
  }
}

function normalizeMeshKey(
  value: string
) {
  const match =
    String(value || '')
      .toLowerCase()
      .trim()
      .match(/\d+/)

  return match
    ? match[0]
    : String(value || '')
        .toLowerCase()
        .trim()
}

function normalizeBagTypeKey(
  value: string
) {
  const normalized =
    String(value || '')
      .toLowerCase()
      .replace(/\s+/g, '')

  if (normalized.includes('1400')) return '1400kg'
  if (normalized.includes('1350')) return '1350kg'
  if (normalized.includes('1250')) return '1250kg'
  if (normalized.includes('50kg')) return '50kg'

  return normalized
}

export function findProductionRate(
  rates: RateMasterRow[],
  mesh: string,
  bagType: string
) {
  const foundRate =
    rates.find(
      (item) =>
        normalizeBagTypeKey(item.bag_type) ===
          normalizeBagTypeKey(bagType) &&
        normalizeMeshKey(item.mesh) ===
          normalizeMeshKey(mesh)
    )

  if (!foundRate) {
    return null
  }

  return Number(foundRate.rate)
}

export async function getProductionRate(
  supabase: unknown,
  mesh: string,
  bagType: string
) {
  const client =
    supabase as SupabaseRateClient

  const { data, error } =
    await client
      .from('rate_master')
      .select('rate')
      .eq('mesh', mesh)
      .eq('bag_type', bagType)
      .maybeSingle()

  if (error || !data) {
    const fallbackRes =
      await (
        client
          .from('rate_master')
          .select('mesh,bag_type,rate') as unknown as Promise<{
          data: RateMasterRow[] | null
          error: unknown
        }>
      )

    const fallbackRate =
      findProductionRate(
        fallbackRes.data || [],
        mesh,
        bagType
      )

    return fallbackRate
  }

  return Number(data.rate)
}
