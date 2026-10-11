export const DADI_FACTORY = 'Dadi'
export const DEMO_FACTORY = 'Demo Factory'

export function isDadiFactory(
  factory?: string | null
) {
  return (
    (factory || '').trim().toLowerCase() ===
    DADI_FACTORY.toLowerCase()
  )
}

export function isDemoRole(
  role?: string | null
) {
  return (
    (role || '').trim().toLowerCase() ===
    'demo'
  )
}

export function isDemoFactory(
  factory?: string | null
) {
  return (
    (factory || '').trim().toLowerCase() ===
    DEMO_FACTORY.toLowerCase()
  )
}

export function isVisibleForDemoMode<T extends {
  factory?: string | null
  factory_name?: string | null
}>(
  row: T,
  role?: string | null
) {
  const rowFactory =
    row.factory ?? row.factory_name ?? null

  return isDemoRole(role)
    ? isDemoFactory(rowFactory)
    : !isDemoFactory(rowFactory)
}
