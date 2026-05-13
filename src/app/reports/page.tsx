'use client'

import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

export default function ReportsPage() {

  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [visibleCount, setVisibleCount] =
    useState(25)

  // FILTERS

  const [startDate, setStartDate] =
    useState('')

  const [endDate, setEndDate] =
    useState('')

  const [factoryFilter, setFactoryFilter] =
    useState('')

  const [machineFilter, setMachineFilter] =
    useState('')

  const [labourFilter, setLabourFilter] =
    useState('')

  const [shiftFilter, setShiftFilter] =
    useState('')

  const [bagTypeFilter, setBagTypeFilter] =
    useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {

    setLoading(true)

    const { data, error } =
      await supabase
        .from('production_entries')
        .select('*')
        .order('production_date', {
          ascending: false,
        })

    if (!error) {
      setEntries(data || [])
    }

    setLoading(false)
  }

  // QUICK FILTERS

  const applyTodayFilter = () => {

    const today = new Date()
      .toISOString()
      .split('T')[0]

    setStartDate(today)
    setEndDate(today)
  }

  const applyThisWeekFilter = () => {

    const now = new Date()

    const firstDay = new Date(now)

    firstDay.setDate(
      now.getDate() - now.getDay()
    )

    const lastDay = new Date(now)

    lastDay.setDate(
      firstDay.getDate() + 6
    )

    setStartDate(
      firstDay
        .toISOString()
        .split('T')[0]
    )

    setEndDate(
      lastDay
        .toISOString()
        .split('T')[0]
    )
  }

  const applyThisMonthFilter = () => {

    const now = new Date()

    const firstDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )

    const lastDay = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    )

    setStartDate(
      firstDay
        .toISOString()
        .split('T')[0]
    )

    setEndDate(
      lastDay
        .toISOString()
        .split('T')[0]
    )
  }

  // FILTER OPTIONS

  const factories =
    [...new Set(
      entries.map(
        (entry) => entry.factory
      )
    )]

  const machines =
    [...new Set(
      entries.map(
        (entry) => entry.machine
      )
    )]

  const labours =
    [...new Set(
      entries.map(
        (entry) => entry.labour_name
      )
    )]

  const bagTypes =
    [...new Set(
      entries.map(
        (entry) => entry.bag_type
      )
    )]

  // FILTERED DATA

  const filteredEntries =
    useMemo(() => {

      return entries.filter((entry) => {

        const matchesStartDate =
          !startDate ||
          entry.production_date >= startDate

        const matchesEndDate =
          !endDate ||
          entry.production_date <= endDate

        const matchesFactory =
          !factoryFilter ||
          entry.factory === factoryFilter

        const matchesMachine =
          !machineFilter ||
          entry.machine === machineFilter

        const matchesLabour =
          !labourFilter ||
          entry.labour_name === labourFilter

        const matchesShift =
          !shiftFilter ||
          entry.shift === shiftFilter

        const matchesBagType =
          !bagTypeFilter ||
          entry.bag_type === bagTypeFilter

        return (
          matchesStartDate &&
          matchesEndDate &&
          matchesFactory &&
          matchesMachine &&
          matchesLabour &&
          matchesShift &&
          matchesBagType
        )
      })

    }, [
      entries,
      startDate,
      endDate,
      factoryFilter,
      machineFilter,
      labourFilter,
      shiftFilter,
      bagTypeFilter,
    ])

  // SUMMARY

  const totalQuantity =
    filteredEntries.reduce(
      (sum, entry) =>
        sum +
        Number(entry.quantity || 0),
      0
    )

  const totalAmount =
    filteredEntries.reduce(
      (sum, entry) =>
        sum +
        Number(entry.amount || 0),
      0
    )

  // EXCEL EXPORT

  const exportExcel = () => {

    const worksheet =
      XLSX.utils.json_to_sheet(
        filteredEntries
      )

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Production Report'
    )

    XLSX.writeFile(
      workbook,
      'production-report.xlsx'
    )
  }

  if (loading) {

    return (
      <main className="min-h-screen flex items-center justify-center text-slate-500 text-lg">
        Loading reports...
      </main>
    )
  }

  return (

    <main className="min-h-screen bg-slate-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">

          <p className="text-slate-500 text-sm">
            Production Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Reports
          </h1>

        </div>

        {/* QUICK FILTERS */}

        <div className="flex flex-wrap gap-3 mb-4">

          <button
            onClick={applyTodayFilter}
            className="bg-slate-800 text-white px-4 py-2 rounded-xl"
          >
            Today
          </button>

          <button
            onClick={applyThisWeekFilter}
            className="bg-white border border-slate-200 px-4 py-2 rounded-xl"
          >
            This Week
          </button>

          <button
            onClick={applyThisMonthFilter}
            className="bg-white border border-slate-200 px-4 py-2 rounded-xl"
          >
            This Month
          </button>

        </div>

        {/* FILTERS */}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 mb-6 sticky top-32 md:top-24 md:z-30">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            />

            <select
              value={factoryFilter}
              onChange={(e) =>
                setFactoryFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            >

              <option value="">
                All Factories
              </option>

              {factories.map((factory) => (

                <option
                  key={factory}
                  value={factory}
                >
                  {factory}
                </option>

              ))}

            </select>

            <select
              value={machineFilter}
              onChange={(e) =>
                setMachineFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            >

              <option value="">
                All Machines
              </option>

              {machines.map((machine) => (

                <option
                  key={machine}
                  value={machine}
                >
                  {machine}
                </option>

              ))}

            </select>

            <select
              value={labourFilter}
              onChange={(e) =>
                setLabourFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            >

              <option value="">
                All Labours
              </option>

              {labours.map((labour) => (

                <option
                  key={labour}
                  value={labour}
                >
                  {labour}
                </option>

              ))}

            </select>

            <select
              value={shiftFilter}
              onChange={(e) =>
                setShiftFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            >

              <option value="">
                All Shifts
              </option>

              <option value="Day">
                Day
              </option>

              <option value="Night">
                Night
              </option>

            </select>

            <select
              value={bagTypeFilter}
              onChange={(e) =>
                setBagTypeFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            >

              <option value="">
                All Bag Types
              </option>

              {bagTypes.map((bagType) => (

                <option
                  key={bagType}
                  value={bagType}
                >
                  {bagType}
                </option>

              ))}

            </select>

            <button
              onClick={exportExcel}
              className="bg-slate-800 text-white rounded-2xl p-3"
            >
              Export Excel
            </button>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <p className="text-slate-500">
              Total Quantity
            </p>

            <h2 className="text-4xl font-bold mt-2 text-slate-900">
              {totalQuantity}
            </h2>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <p className="text-slate-500">
              Total Amount
            </p>

            <h2 className="text-4xl font-bold mt-2 text-slate-900">
              ₹{totalAmount}
            </h2>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-slate-200">

          <table className="w-full text-sm">

            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">

              <tr>

                <th className="p-4 text-left">
                  Date
                </th>

                <th className="p-4 text-left">
                  Factory
                </th>

                <th className="p-4 text-left">
                  Machine
                </th>

                <th className="p-4 text-left">
                  Labour
                </th>

                <th className="p-4 text-left">
                  Shift
                </th>

                <th className="p-4 text-left">
                  Mesh
                </th>

                <th className="p-4 text-left">
                  Bag Type
                </th>

                <th className="p-4 text-left">
                  Bag Name
                </th>

                <th className="p-4 text-left">
                  Qty
                </th>

                <th className="p-4 text-left">
                  Rate
                </th>

                <th className="p-4 text-left">
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredEntries
                .slice(0, visibleCount)
                .map((entry) => (

                <tr
                  key={entry.id}
                  className="border-b border-slate-100"
                >

                  <td className="p-4">
                    {entry.production_date}
                  </td>

                  <td className="p-4">
                    {entry.factory}
                  </td>

                  <td className="p-4">
                    {entry.machine}
                  </td>

                  <td className="p-4">
                    {entry.labour_name}
                  </td>

                  <td className="p-4">
                    {entry.shift}
                  </td>

                  <td className="p-4">
                    {entry.mesh}
                  </td>

                  <td className="p-4">
                    {entry.bag_type}
                  </td>

                  <td className="p-4">
                    {entry.bag_name}
                  </td>

                  <td className="p-4">
                    {entry.quantity}
                  </td>

                  <td className="p-4">
                    ₹{entry.rate}
                  </td>

                  <td className="p-4 font-semibold">
                    ₹{entry.amount}
                  </td>

                </tr>

              ))}

              {/* TOTALS */}

              <tr className="bg-slate-100 font-bold border-t border-slate-300">

                <td
                  className="p-4"
                  colSpan={8}
                >
                  Totals
                </td>

                <td className="p-4">
                  {totalQuantity}
                </td>

                <td className="p-4"></td>

                <td className="p-4">
                  ₹{totalAmount}
                </td>

              </tr>

            </tbody>

          </table>

        </div>

        {/* LOAD MORE */}

        <div className="flex justify-center mt-6">

          {visibleCount <
            filteredEntries.length && (

            <button
              onClick={() =>
                setVisibleCount(
                  visibleCount + 25
                )
              }
              className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm"
            >
              Load More
            </button>

          )}

        </div>

      </div>

    </main>
  )
}