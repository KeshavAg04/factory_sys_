import type {
  ReactNode,
} from 'react'

type CardTone =
  'slate' |
  'blue' |
  'emerald' |
  'amber' |
  'rose'

function cx(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(' ')
}

export function PageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('erp-page', className)}>
      {children}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string
  title: string
  actions?: ReactNode
}) {
  return (
    <div className="erp-page-header">
      <div>
        {eyebrow && (
          <p className="erp-eyebrow">
            {eyebrow}
          </p>
        )}

        <h1 className="erp-page-title">
          {title}
        </h1>
      </div>

      {actions && (
        <div className="erp-page-actions">
          {actions}
        </div>
      )}
    </div>
  )
}

export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cx('erp-surface-card', className)}>
      {children}
    </section>
  )
}

export function FilterPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cx('erp-filter-panel', className)}>
      {children}
    </section>
  )
}

export function FormSection({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cx('erp-form-section', className)}>
      {title && (
        <h2 className="erp-section-title">
          {title}
        </h2>
      )}

      {children}
    </section>
  )
}

export function FormField({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cx('erp-form-field', className)}>
      <span>
        {label}
      </span>

      {children}
    </label>
  )
}

export function StatCard({
  label,
  value,
  unit,
  support,
  tone = 'slate',
}: {
  label: string
  value: ReactNode
  unit?: string
  support?: string
  tone?: CardTone
}) {
  return (
    <article className={`erp-stat-card erp-stat-${tone}`}>
      <div className="erp-stat-icon" />

      <p className="erp-stat-label">
        {label}
      </p>

      <div className="erp-stat-value">
        {value}
        {unit && (
          <span>
            {unit}
          </span>
        )}
      </div>

      {support && (
        <p className="erp-stat-support">
          {support}
        </p>
      )}
    </article>
  )
}

export function EmptyState({
  title = 'No data found',
  description = 'Try changing the filters or adding new entries.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="erp-empty-state">
      <p className="font-semibold text-slate-800">
        {title}
      </p>

      <p className="text-sm text-slate-500">
        {description}
      </p>
    </div>
  )
}
