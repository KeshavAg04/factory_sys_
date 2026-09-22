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
