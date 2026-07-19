export type RateMasterRow = {
  mesh: string
  bag_type: string
  rate: number | string
}

type SupabaseRateClient = {
  from: (table: 'rate_master') => {
    select: (columns: string) => {
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

export function findProductionRate(
  rates: RateMasterRow[],
  mesh: string,
  bagType: string
) {
  const foundRate =
    rates.find(
      (item) =>
        item.bag_type === bagType &&
        item.mesh === mesh
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
    return null
  }

  return Number(data.rate)
}
