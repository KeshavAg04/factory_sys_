'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { supabase } from '@/lib/supabase'

const CHART_COLORS = [
  '#93c5fd',
  '#86efac',
  '#fca5a5',
  '#c4b5fd',
  '#fcd34d',
  '#67e8f9',
  '#fdba74',
]

export default function DashboardPage() {

  const [entries, setEntries] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [dashboardFilter, setDashboardFilter] =
    useState('month')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {

    setLoading(true)

    const { data, error } =
      await supabase
        .from('production_entries')
        .select('*')

    if (!error) {
      setEntries(data || [])
    }

    setLoading(false)
  }

  // FILTERED DASHBOARD DATA

  const filteredDashboardEntries =
    useMemo(() => {

      const now = new Date()

      return entries.filter((entry) => {

        const entryDate =
          new Date(entry.production_date)

        if (
          dashboardFilter === 'today'
        ) {

          return (
            entry.production_date ===
            now
              .toISOString()
              .split('T')[0]
          )
        }

        if (
          dashboardFilter === 'week'
        ) {

          const firstDay =
            new Date(now)

          firstDay.setDate(
            now.getDate() -
            now.getDay()
          )

          return entryDate >= firstDay
        }

        return (
          entryDate.getMonth() ===
            now.getMonth() &&
          entryDate.getFullYear() ===
            now.getFullYear()
        )
      })

    }, [entries, dashboardFilter])

  // TODAY

  const todayQuantity =
    filteredDashboardEntries.reduce(
      (sum, entry) =>
        sum +
        Number(entry.quantity || 0),
      0
    )

  const todayAmount =
    filteredDashboardEntries.reduce(
      (sum, entry) =>
        sum +
        Number(entry.amount || 0),
      0
    )

  // FACTORY SUMMARY

  const factorySummary =
    useMemo(() => {

      const grouped: any = {}

      filteredDashboardEntries.forEach((entry) => {

        if (!grouped[entry.factory]) {

          grouped[entry.factory] = {
            quantity: 0,
            amount: 0,
          }
        }

        grouped[entry.factory]
          .quantity +=
          Number(entry.quantity || 0)

        grouped[entry.factory]
          .amount +=
          Number(entry.amount || 0)

      })

      return Object.keys(grouped).map(
        (factory) => ({
          name: factory,
          quantity:
            grouped[factory]
              .quantity,
          amount:
            grouped[factory]
              .amount,
        })
      )

    }, [filteredDashboardEntries])

  // MACHINE SUMMARY

  const machineSummary =
    useMemo(() => {

      const grouped: any = {}

      filteredDashboardEntries.forEach((entry) => {

        if (!grouped[entry.machine]) {

          grouped[entry.machine] = {
            quantity: 0,
            amount: 0,
          }
        }

        grouped[entry.machine]
          .quantity +=
          Number(entry.quantity || 0)

        grouped[entry.machine]
          .amount +=
          Number(entry.amount || 0)

      })

      return Object.keys(grouped).map(
        (machine) => ({
          name: machine,
          quantity:
            grouped[machine]
              .quantity,
          amount:
            grouped[machine]
              .amount,
        })
      )

    }, [filteredDashboardEntries])

  // MONTHLY TREND

  const monthlyTrend =
    useMemo(() => {

      const grouped: any = {}

      filteredDashboardEntries.forEach((entry) => {

        const month =
          entry.production_date?.slice(
            0,
            7
          )

        if (!grouped[month]) {

          grouped[month] = {
            quantity: 0,
            amount: 0,
          }
        }

        grouped[month]
          .quantity +=
          Number(entry.quantity || 0)

        grouped[month]
          .amount +=
          Number(entry.amount || 0)

      })

      return Object.keys(grouped).map(
        (month) => ({
          month,
          quantity:
            grouped[month]
              .quantity,
          amount:
            grouped[month]
              .amount,
        })
      )

    }, [filteredDashboardEntries])

  if (loading) {

    return (
      <main className="min-h-screen flex items-center justify-center text-slate-500 text-lg">
        Loading analytics...
      </main>
    )
  }

  return (

    <main className="min-h-screen bg-slate-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-slate-500 text-sm">
            Production Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Executive Dashboard
          </h1>

        </div>

        {/* DASHBOARD FILTERS */}

        <div className="flex flex-wrap gap-3 mb-6">

          <button
            onClick={() =>
              setDashboardFilter(
                'today'
              )
            }
            className={`px-4 py-2 rounded-xl ${
              dashboardFilter ===
              'today'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            Today
          </button>

          <button
            onClick={() =>
              setDashboardFilter(
                'week'
              )
            }
            className={`px-4 py-2 rounded-xl ${
              dashboardFilter ===
              'week'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            This Week
          </button>

          <button
            onClick={() =>
              setDashboardFilter(
                'month'
              )
            }
            className={`px-4 py-2 rounded-xl ${
              dashboardFilter ===
              'month'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200'
            }`}
          >
            This Month
          </button>

        </div>

        {/* TOP CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <p className="text-slate-500">
              Total Quantity
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-900">
              {todayQuantity}
            </h2>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <p className="text-slate-500">
              Total Amount
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-900">
              ₹{todayAmount}
            </h2>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <p className="text-slate-500">
              Total Entries
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-900">
              {filteredDashboardEntries.length}
            </h2>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <p className="text-slate-500">
              Total Machines
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-900">
              {machineSummary.length}
            </h2>

          </div>

        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* FACTORY */}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Factory Comparison
            </h2>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={factorySummary}>

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: '#000000',
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: '#000000',
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="amount"
                    fill="#94a3b8"
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

          {/* PIE */}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Machine Utilization
            </h2>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={machineSummary}
                    dataKey="amount"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >

                    {machineSummary.map(
                      (_, index) => (

                        <Cell
                          key={index}
                          fill={
                            CHART_COLORS[
                              index %
                              CHART_COLORS.length
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

        </div>

        {/* MONTHLY TREND */}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Monthly Production Trend
          </h2>

          <div className="h-[400px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={monthlyTrend}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: '#000000',
                  }}
                />

                <YAxis
                  tick={{
                    fill: '#000000',
                  }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#64748b"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </main>
  )
}