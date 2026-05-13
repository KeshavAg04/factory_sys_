'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

import {
  supabase,
} from '@/lib/supabase'

const COLORS = [

  '#bfdbfe',
  '#fecaca',
  '#bbf7d0',
  '#fde68a',
  '#ddd6fe',
  '#fbcfe8',

]

export default function DashboardPage() {

  const [
    entries,
    setEntries,
  ] = useState<any[]>([])

  const [
    selectedRange,
    setSelectedRange,
  ] = useState('month')

  useEffect(() => {

    fetchEntries()

  }, [])

  async function fetchEntries() {

    const {
      data,
    } = await supabase
      .from(
        'production_entries'
      )
      .select('*')

    setEntries(data || [])
  }

  function calculateTons(
    bagType: string,
    quantity: number,
  ) {

    const qty =
      Number(quantity || 0)

    const type =
      String(
        bagType || ''
      ).toLowerCase()

    if (
      type.includes('50')
    ) {

      return qty * 0.05
    }

    if (
      type.includes('1250')
    ) {

      return qty * 1.25
    }

    if (
      type.includes('1350')
    ) {

      return qty * 1.35
    }

    if (
      type.includes('1400')
    ) {

      return qty * 1.4
    }

    return qty
  }

  const filteredEntries =
    useMemo(() => {

      const now =
        new Date()

      return entries.filter(
        (entry) => {

          const entryDate =
            new Date(
              entry.date
            )

          if (
            selectedRange ===
            'today'
          ) {

            return (
              entryDate
                .toDateString() ===
              now.toDateString()
            )
          }

          if (
            selectedRange ===
            'week'
          ) {

            const weekAgo =
              new Date()

            weekAgo.setDate(
              now.getDate() -
                7
            )

            return (
              entryDate >=
              weekAgo
            )
          }

          if (
            selectedRange ===
            'month'
          ) {

            return (
              entryDate.getMonth() ===
                now.getMonth() &&
              entryDate.getFullYear() ===
                now.getFullYear()
            )
          }

          return true
        }
      )

    }, [
      entries,
      selectedRange,
    ])

  const totalTons =
    filteredEntries.reduce(
      (sum, entry) => {

        return (
          sum +
          calculateTons(
            entry.bag_type,
            Number(
              entry.quantity
            )
          )
        )

      },
      0
    )

  const machineCount =
    new Set(

      filteredEntries
        .map(
          (entry) =>
            entry.machine
        )
        .filter(Boolean)

    ).size

  const categoryData =
    useMemo(() => {

      const grouped:
      Record<
        string,
        number
      > = {}

      filteredEntries.forEach(
        (entry) => {

          const key =
            `${entry.bag_type} (${entry.mesh}#)`

          const tons =
            calculateTons(
              entry.bag_type,
              Number(
                entry.quantity
              )
            )

          if (!grouped[key]) {

            grouped[key] = 0
          }

          grouped[key] += tons
        }
      )

      return Object.entries(
        grouped
      ).map(
        ([name, value]) => ({

          name,
          value:
            Number(
              value.toFixed(2)
            ),

        })
      )

    }, [filteredEntries])

  const machineData =
    useMemo(() => {

      const grouped:
      Record<
        string,
        number
      > = {}

      filteredEntries.forEach(
        (entry) => {

          const machine =
            entry.machine ||
            'Unknown'

          const tons =
            calculateTons(
              entry.bag_type,
              Number(
                entry.quantity
              )
            )

          if (
            !grouped[machine]
          ) {

            grouped[machine] = 0
          }

          grouped[machine] += tons
        }
      )

      return Object.entries(
        grouped
      ).map(
        ([name, value]) => ({

          name,
          value:
            Number(
              value.toFixed(2)
            ),

        })
      )

    }, [filteredEntries])

  return (

    <div className="p-4 md:p-6 space-y-5">

      {/* TOP */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <p className="text-slate-500 text-sm">
            Production Management
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              setSelectedRange(
                'today'
              )
            }
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              selectedRange ===
              'today'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            Today
          </button>

          <button
            onClick={() =>
              setSelectedRange(
                'week'
              )
            }
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              selectedRange ===
              'week'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            This Week
          </button>

          <button
            onClick={() =>
              setSelectedRange(
                'month'
              )
            }
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              selectedRange ===
              'month'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            This Month
          </button>

        </div>

      </div>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

          <p className="text-slate-500 text-sm">
            Goods Produced
          </p>

          <h2 className="text-4xl font-bold text-slate-900 mt-2">

            {totalTons.toFixed(2)}
            {' '}
            T

          </h2>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

          <p className="text-slate-500 text-sm">
            Active Machines
          </p>

          <h2 className="text-4xl font-bold text-slate-900 mt-2">

            {machineCount}

          </h2>

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* PIE */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

          <h2 className="text-2xl font-bold text-slate-900 mb-4">

            Category Wise

          </h2>

          <div className="h-[320px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={
                    categoryData
                  }
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label={({
                    value,
                  }) =>
                    `${value}T`
                  }
                >

                  {categoryData.map(
                    (
                      entry,
                      index
                    ) => (

                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* BAR */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

          <h2 className="text-2xl font-bold text-slate-900 mb-4">

            Machine Production

          </h2>

          <div className="h-[320px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  machineData
                }
              >

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  )
}