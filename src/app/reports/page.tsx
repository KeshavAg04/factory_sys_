'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  supabase,
} from '@/lib/supabase'

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

export default function ReportsPage() {

  const [
    entries,
    setEntries,
  ] = useState<Entry[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    fromDate,
    setFromDate,
  ] = useState('')

  const [
    toDate,
    setToDate,
  ] = useState('')

  useEffect(() => {

    fetchEntries()

  }, [])

  async function fetchEntries() {

    setLoading(true)

    let query =
      supabase
        .from('production_entries')
        .select('*')
        .order('date', {
          ascending: false,
        })

    if (fromDate) {

      query =
        query.gte(
          'date',
          fromDate
        )
    }

    if (toDate) {

      query =
        query.lte(
          'date',
          toDate
        )
    }

    const {
      data,
    } = await query

    setEntries(data || [])

    setLoading(false)
  }

  useEffect(() => {

    fetchEntries()

  }, [
    fromDate,
    toDate,
  ])

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
    entries.reduce((sum, entry) => {

      return (
        sum +
        calculateTons(
          entry.bag_type,
          entry.quantity,
        )
      )

    }, 0)

  const totalAmount =
    entries.reduce((sum, entry) => {

      return (
        sum +
        Number(entry.amount)
      )

    }, 0)

  const categorySummary =
    useMemo(() => {

      const grouped:
      Record<
        string,
        {
          bags: number
          tons: number
        }
      > = {}

      entries.forEach((entry) => {

        const key =
          `${entry.bag_type} ${entry.mesh}#`

        const tons =
          calculateTons(
            entry.bag_type,
            entry.quantity,
          )

        if (!grouped[key]) {

          grouped[key] = {

            bags: 0,
            tons: 0,

          }
        }

        grouped[key].bags +=
          Number(entry.quantity)

        grouped[key].tons +=
          tons
      })

      return Object.entries(grouped)
    }, [entries])

  return (

    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}

      <div>

        <p className="text-slate-500 text-sm">
          Production Management
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-1">
          Reports
        </h1>

      </div>

      {/* FILTERS */}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          />

        </div>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
            Total Amount
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-2">

            ₹
            {totalAmount.toLocaleString()}

          </h2>

        </div>

      </div>

      {/* CATEGORY SUMMARY */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-900">

            Category Wise Production

          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-[900px] w-full">

            <thead>

              <tr className="bg-slate-100">

                <th className="text-left px-5 py-4 text-slate-700 font-semibold">

                  Category

                </th>

                <th className="text-left px-5 py-4 text-slate-700 font-semibold">

                  Bags Produced

                </th>

                <th className="text-left px-5 py-4 text-slate-700 font-semibold">

                  Goods Produced

                </th>

              </tr>

            </thead>

            <tbody>

              {categorySummary.map(
                ([key, value]) => (

                  <tr
                    key={key}
                    className="border-t border-slate-100"
                  >

                    <td className="px-5 py-4 text-slate-900">

                      {key}

                    </td>

                    <td className="px-5 py-4 text-slate-900">

                      {value.bags}

                    </td>

                    <td className="px-5 py-4 text-slate-900 font-medium">

                      {value.tons.toFixed(2)} T

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ENTRIES TABLE */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-900">

            Production Entries

          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-[900px] w-full">

            <thead>

              <tr className="bg-slate-100">

                <th className="text-left px-5 py-4">
                  Date
                </th>

                <th className="text-left px-5 py-4">
                  Factory
                </th>

                <th className="text-left px-5 py-4">
                  Machine
                </th>

                <th className="text-left px-5 py-4">
                  Labour
                </th>

                <th className="text-left px-5 py-4">
                  Category
                </th>

                <th className="text-left px-5 py-4">
                  Qty
                </th>

                <th className="text-left px-5 py-4">
                  Tons
                </th>

                <th className="text-left px-5 py-4">
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {entries.map((entry) => (

                <tr
                  key={entry.id}
                  className="border-t border-slate-100"
                >

                  <td className="px-5 py-4">

                    {entry.date}

                  </td>

                  <td className="px-5 py-4">

                    {entry.factory}

                  </td>

                  <td className="px-5 py-4">

                    {entry.machine}

                  </td>

                  <td className="px-5 py-4">

                    {entry.labour_name}

                  </td>

                  <td className="px-5 py-4">

                    {entry.bag_type}
                    {' '}
                    {entry.mesh}#

                  </td>

                  <td className="px-5 py-4">

                    {entry.quantity}

                  </td>

                  <td className="px-5 py-4 font-medium">

                    {calculateTons(
                      entry.bag_type,
                      entry.quantity,
                    ).toFixed(2)}
                    {' '}
                    T

                  </td>

                  <td className="px-5 py-4">

                    ₹
                    {Number(
                      entry.amount
                    ).toLocaleString()}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {loading && (

        <div className="text-slate-500">

          Loading reports...

        </div>

      )}

    </div>
  )
}