'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  supabase,
} from '@/lib/supabase'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

type Entry = {
  id: string
  date: string
  factory: string
  machine: string
  labour_name: string
  shift: string
  mesh: string
  bag_type: string
  bag_name: string
  quantity: number
  amount: number
}

const COLORS = [
  '#93c5fd',
  '#86efac',
  '#fca5a5',
  '#fde68a',
  '#c4b5fd',
  '#67e8f9',
]

export default function DashboardPage() {

  const [
    entries,
    setEntries,
  ] = useState<Entry[]>([])

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
    } = await supabase
      .from('production_entries')
      .select('*')
      .order('date', {
        ascending: false,
      })

    setEntries(data || [])

    setLoading(false)
  }

  function calculateTons(
    bagType: string,
    quantity: number,
  ) {

    const type =
      bagType.toLowerCase()

    if (type.includes('50'))
      return quantity * 0.05

    if (type.includes('1250'))
      return quantity * 1.25

    if (type.includes('1350'))
      return quantity * 1.35

    if (type.includes('1400'))
      return quantity * 1.4

    return 0
  }

  const totalTons =
    entries.reduce((sum, entry) => {

      return (
        sum +
        calculateTons(
          entry.bag_type,
          entry.quantity,
        )
      )

    }, 0)

  const totalMachines =
    new Set(
      entries.map(
        (e) => e.machine
      )
    ).size

  const todayEntries =
    entries.filter((entry) => {

      const today =
        new Date()
          .toISOString()
          .split('T')[0]

      return (
        entry.date === today
      )
    })

  const todayTons =
    todayEntries.reduce((sum, entry) => {

      return (
        sum +
        calculateTons(
          entry.bag_type,
          entry.quantity,
        )
      )

    }, 0)

  const bagCategoryData =
    useMemo(() => {

      const grouped:
      Record<string, number> = {}

      entries.forEach((entry) => {

        const key =
          `${entry.bag_type} ${entry.mesh}#`

        const tons =
          calculateTons(
            entry.bag_type,
            entry.quantity,
          )

        grouped[key] =
          (grouped[key] || 0) +
          tons
      })

      return Object.entries(grouped)
        .map(([name, value]) => ({
          name,
          value:
            Number(
              value.toFixed(2)
            ),
        }))
        .slice(0, 6)

    }, [entries])

  const machineData =
    useMemo(() => {

      const grouped:
      Record<string, number> = {}

      entries.forEach((entry) => {

        const tons =
          calculateTons(
            entry.bag_type,
            entry.quantity,
          )

        grouped[entry.machine || 'Unknown'] =
          (grouped[entry.machine || 'Unknown'] || 0) +
          tons
      })

      return Object.entries(grouped)
        .map(([machine, tons]) => ({
          machine,
          tons:
            Number(
              tons.toFixed(2)
            ),
        }))

    }, [entries])

  if (loading) {

    return (

      <div className="p-6 text-slate-500">

        Loading dashboard...

      </div>
    )
  }

  return (

    <div className="p-4 md:p-6 space-y-6">

      {/* TOP CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

          <p className="text-slate-500 text-sm">
            Total Goods Produced
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-2">

            {totalTons.toFixed(2)} T

          </h2>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

          <p className="text-slate-500 text-sm">
            Today's Production
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-2">

            {todayTons.toFixed(2)} T

          </h2>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 col-span-2 md:col-span-1">

          <p className="text-slate-500 text-sm">
            Total Machines
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-2">

            {totalMachines}

          </h2>

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PIE */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

          <h2 className="text-xl font-bold text-slate-900 mb-5">

            Production Category Wise

          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={bagCategoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label={(entry) =>
                  `${entry.value}T`
                }
              >

                {bagCategoryData.map(
                  (_, index) => (

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

        {/* MACHINE BAR */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

          <h2 className="text-xl font-bold text-slate-900 mb-5">

            Machine Production

          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={machineData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="machine"
                tick={{
                  fill: '#000',
                }}
              />

              <YAxis
                tick={{
                  fill: '#000',
                }}
              />

              <Tooltip />

              <Bar
                dataKey="tons"
                fill="#93c5fd"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  )
}