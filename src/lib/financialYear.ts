export const FINANCIAL_MONTH_ORDER = [
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  0,
  1,
  2,
]

export type FinancialYearMonthGroup<T> = {
  key: string
  label: string
  month: number
  year: number
  items: T[]
}

export type FinancialYearGroup<T> = {
  key: string
  label: string
  startYear: number
  months: FinancialYearMonthGroup<T>[]
}

type GroupSortOrder =
  'financialYear' |
  'newestFirst'

export function getFinancialYearStartYear(
  value: string | Date
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value)

  const year =
    date.getFullYear()

  const month =
    date.getMonth()

  return month >= 3
    ? year
    : year - 1
}

export function getFinancialYear(
  value: string | Date
) {
  const startYear =
    getFinancialYearStartYear(value)

  const endYear =
    String(
      startYear + 1
    ).slice(-2)

  return `FY ${startYear}-${endYear}`
}

export function getFinancialMonthLabel(
  value: string | Date
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value)

  return date.toLocaleString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    }
  )
}

export function getFinancialMonthKey(
  value: string | Date
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value)

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`
}

export function groupByFinancialYearAndMonth<T>(
  items: T[],
  getDate: (item: T) => string | Date,
  sortOrder: GroupSortOrder = 'financialYear'
) {
  const yearMap =
    new Map<
      string,
      FinancialYearGroup<T>
    >()

  items.forEach((item) => {
    const date =
      getDate(item)

    const parsedDate =
      date instanceof Date
        ? date
        : new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return
    }

    const startYear =
      getFinancialYearStartYear(
        parsedDate
      )

    const fyKey =
      String(startYear)

    const monthKey =
      getFinancialMonthKey(
        parsedDate
      )

    if (!yearMap.has(fyKey)) {
      yearMap.set(fyKey, {
        key: fyKey,
        label:
          getFinancialYear(
            parsedDate
          ),
        startYear,
        months: [],
      })
    }

    const yearGroup =
      yearMap.get(fyKey)!

    let monthGroup =
      yearGroup.months.find(
        (group) =>
          group.key === monthKey
      )

    if (!monthGroup) {
      monthGroup = {
        key: monthKey,
        label:
          getFinancialMonthLabel(
            parsedDate
          ),
        month:
          parsedDate.getMonth(),
        year:
          parsedDate.getFullYear(),
        items: [],
      }

      yearGroup.months.push(
        monthGroup
      )
    }

    monthGroup.items.push(item)
  })

  return Array.from(
    yearMap.values()
  )
    .sort(
      (a, b) =>
        b.startYear - a.startYear
    )
    .map((yearGroup) => ({
      ...yearGroup,
      months:
        yearGroup.months.sort(
          (a, b) => {
            if (sortOrder === 'newestFirst') {
              if (a.year !== b.year) {
                return b.year - a.year
              }

              return b.month - a.month
            }

            const orderA =
              FINANCIAL_MONTH_ORDER.indexOf(
                a.month
              )

            const orderB =
              FINANCIAL_MONTH_ORDER.indexOf(
                b.month
              )

            if (orderA !== orderB) {
              return orderA - orderB
            }

            return a.year - b.year
          }
        ).map((monthGroup) => ({
          ...monthGroup,
          items:
            sortOrder === 'newestFirst'
              ? [...monthGroup.items].sort(
                  (a, b) => {
                    const dateA =
                      new Date(
                        getDate(a)
                      ).getTime()

                    const dateB =
                      new Date(
                        getDate(b)
                      ).getTime()

                    if (dateA !== dateB) {
                      return dateB - dateA
                    }

                    const createdA =
                      new Date(
                        (a as {
                          created_at?: string
                        }).created_at || 0
                      ).getTime()

                    const createdB =
                      new Date(
                        (b as {
                          created_at?: string
                        }).created_at || 0
                      ).getTime()

                    if (createdA !== createdB) {
                      return createdB - createdA
                    }

                    return String(
                      (b as {
                        id?: string | number
                      }).id || ''
                    ).localeCompare(
                      String(
                        (a as {
                          id?: string | number
                        }).id || ''
                      )
                    )
                  }
                )
              : monthGroup.items,
        })),
    }))
}
