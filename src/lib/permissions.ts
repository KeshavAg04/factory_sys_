export const DADI_FACTORY = 'Dadi'

export function isDadiFactory(
  factory?: string | null
) {
  return (
    (factory || '').trim().toLowerCase() ===
    DADI_FACTORY.toLowerCase()
  )
}
