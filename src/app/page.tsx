'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { supabase } from '@/lib/supabase'

function calculateTons(
  bagType: string,
  qty: number
) {

  const type =
    bagType?.toLowerCase() || ''

  if (type.includes('50')) {
    return qty * 0.05
  }

  if (type.includes('1250')) {
    return qty * 1.25
  }

  if (type.includes('1350')) {
    return qty * 1.35
  }

  if (type.includes('1400')) {
    return qty * 1.4
  }

  return 0
}

export default function DashboardPage() {

  const [entries, setEntries] =
    useState<any[]>([])

  const [range, setRange] =
    useState('month')

  useEffect(() => {

    fetchEntries()

  }, [])

  async function fetchEntries() {

    const { data } =
      await supabase
        .from(
          'production_entries'
        )
        .select('*')

    setEntries(data || [])
  }

  const filteredEntries =
    useMemo(() => {

      const now =
        new Date()

      return entries.filter(
        (item) => {

          const date =
            new Date(item.date)

          if (range === 'today') {

            return (
              date.toDateString() ===
              now.toDateString()
            )
          }

          if (range === 'week') {

            const diff =
              (now.getTime() -
                date.getTime()) /
              (1000 *
                60 *
                60 *
                24)

            return diff <= 7
          }

          if (range === 'month') {

            return (
              date.getMonth() ===
                now.getMonth() &&
              date.getFullYear() ===
                now.getFullYear()
            )
          }

          return true
        }
      )

    }, [entries, range])

  const totalGoods =
    filteredEntries.reduce(
      (sum, item) =>
        sum +
        calculateTons(
          item.bag_type,
          Number(
            item.quantity
          )
        ),
      0
    )

  const totalMachines =
    new Set(
      filteredEntries.map(
        (item) => item.machine
      )
    ).size

  const categoryData =
    Object.values(

      filteredEntries.reduce(
        (acc: any, item) => {

          const key =
            item.bag_type

          if (!acc[key]) {

            acc[key] = {

              name: key,
              value: 0,
            }
          }

          acc[key].value +=
            calculateTons(
              item.bag_type,
              Number(
                item.quantity
              )
            )

          return acc

        },
        {}
      )

    )

  const machineData =
    Object.values(

      filteredEntries.reduce(
        (acc: any, item) => {

          const key =
            item.machine

          if (!acc[key]) {

            acc[key] = {

              name: key,
              value: 0,
            }
          }

          acc[key].value +=
            Number(
              item.quantity
            )

          return acc

        },
        {}
      )

    )

  return (

    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500">
            Production Management
          </p>

          <h1 className="text-5xl font-bold text-slate-900">
            Dashboard
          </h1>

        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              setRange('today')
            }
            className={`px-5 py-3 rounded-2xl ${
              range === 'today'
                ? 'bg-slate-900 text-white'
                : 'bg-white'
            }`}
          >
            Today
          </button>

          <button
            onClick={() =>
              setRange('week')
            }
            className={`px-5 py-3 rounded-2xl ${
              range === 'week'
                ? 'bg-slate-900 text-white'
                : 'bg-white'
            }`}
          >
            This Week
          </button>

          <button
            onClick={() =>
              setRange('month')
            }
            className={`px-5 py-3 rounded-2xl ${
              range === 'month'
                ? 'bg-slate-900 text-white'
                : 'bg-white'
            }`}
          >
            This Month
          </button>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl p-6 border">

          <p className="text-slate-500">
            Goods Produced
          </p>

          <h2 className="text-5xl font-bold">
            {totalGoods.toFixed(2)} T
          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 border">

          <p className="text-slate-500">
            Active Machines
          </p>

          <h2 className="text-5xl font-bold">
            {totalMachines}
          </h2>

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl p-6 border">

          <h2 className="text-3xl font-bold mb-6">
            Category Wise
          </h2>

          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >

                  {categoryData.map(
                    (
                      _: any,
                      index
                    ) => (

                      <Cell
                        key={index}
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 border">

          <h2 className="text-3xl font-bold mb-6">
            Machine Production
          </h2>

          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={machineData}
              >

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="value" />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  )
}