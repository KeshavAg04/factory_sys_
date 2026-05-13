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
    loading,
    setLoading,
  ] = useState(true)

  useEffect(() => {

    fetchEntries()

  }, [])

  async function fetchEntries() {

    setLoading(true)

    const {
      data,
      error,
    } = await supabase
      .from(
        'production_entries'
      )
      .select('*')

    if (error) {

      console.log(error)

      setLoading(false)

      return
    }

    setEntries(data || [])

    setLoading(false)
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
  
    // 50 KG
  
    if (
      type.includes('50')
    ) {
  
      return qty * 0.05
    }
  
    // 1250 KG
  
    if (
      type.includes('1250')
    ) {
  
      return qty * 1.25
    }
  
    // 1350 KG
  
    if (
      type.includes('1350')
    ) {
  
      return qty * 1.35
    }
  
    // 1400 KG
  
    if (
      type.includes('1400')
    ) {
  
      return qty * 1.4
    }
  
    // fallback
  
    return qty
  }

  const totalTons =
    entries.reduce(
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

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const todayTons =
    entries
      .filter(
        (entry) =>
          entry.date === today
      )
      .reduce(
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

      entries
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

      entries.forEach(
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

    }, [entries])

  const machineData =
    useMemo(() => {

      const grouped:
      Record<
        string,
        number
      > = {}

      entries.forEach(
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

    }, [entries])

  return (

    <div className="p-4 md:p-6 space-y-6">

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <p className="text-slate-500 text-sm">
            Total Goods Produced
          </p>

          <h2 className="text-5xl font-bold text-slate-900 mt-2">

            {totalTons.toFixed(2)}
            {' '}
            T

          </h2>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <p className="text-slate-500 text-sm">
            Today's Production
          </p>

          <h2 className="text-5xl font-bold text-slate-900 mt-2">

            {todayTons.toFixed(2)}
            {' '}
            T

          </h2>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <p className="text-slate-500 text-sm">
            Total Machines
          </p>

          <h2 className="text-5xl font-bold text-slate-900 mt-2">

            {machineCount}

          </h2>

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* PIE */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <h2 className="text-3xl font-bold text-slate-900 mb-6">

            Production Category Wise

          </h2>

          <div className="h-[420px]">

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
                  outerRadius={140}
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

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <h2 className="text-3xl font-bold text-slate-900 mb-6">

            Machine Production

          </h2>

          <div className="h-[420px]">

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
                    10,
                    10,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {loading && (

        <div className="text-slate-500">

          Loading dashboard...

        </div>

      )}

    </div>
  )
}