'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReportsPage() {

  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  // SUMMARYS

  const totalQuantity =
    filteredEntries.reduce(
      (sum, entry) =>
        sum + Number(entry.quantity || 0),
      0
    )

  const totalAmount =
    filteredEntries.reduce(
      (sum, entry) =>
        sum + Number(entry.amount || 0),
      0
    )

  const totalEntries =
    filteredEntries.length

  // CSV EXPORT

  const exportCSV = () => {

    const headers = [
      'Date',
      'Factory',
      'Machine',
      'Labour',
      'Shift',
      'Mesh',
      'Bag Type',
      'Bag Name',
      'Quantity',
      'Rate',
      'Amount',
    ]

    const rows =
      filteredEntries.map((entry) => [

        entry.production_date,
        entry.factory,
        entry.machine,
        entry.labour_name,
        entry.shift,
        entry.mesh,
        entry.bag_type,
        entry.bag_name,
        entry.quantity,
        entry.rate,
        entry.amount,

      ])

    const csvContent =

      [
        headers.join(','),

        ...rows.map((row) =>
          row.join(',')
        ),

      ].join('\n')

    const blob =
      new Blob(
        [csvContent],
        {
          type: 'text/csv;charset=utf-8;',
        }
      )

    const link =
      document.createElement('a')

    const url =
      URL.createObjectURL(blob)

    link.setAttribute('href', url)

    link.setAttribute(
      'download',
      'production-report.csv'
    )

    link.style.visibility = 'hidden'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  }

  if (loading) {

    return (
      <main className="p-6">
        Loading...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">

          <p className="text-gray-500 text-sm">
            Production Management
          </p>

          <h1 className="text-4xl font-bold mt-2 text-black">
            Reports
          </h1>

        </div>

        {/* FILTERS */}

        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
            />

            <select
              value={factoryFilter}
              onChange={(e) =>
                setFactoryFilter(
                  e.target.value
                )
              }
              className="border p-3 rounded-xl"
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
              className="border p-3 rounded-xl"
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
              className="border p-3 rounded-xl"
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
              className="border p-3 rounded-xl"
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
              className="border p-3 rounded-xl"
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
              onClick={exportCSV}
              className="bg-black text-white rounded-xl p-3"
            >
              Export CSV
            </button>

          </div>

        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Total Quantity
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {totalQuantity}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Total Amount
            </p>

            <h2 className="text-4xl font-bold mt-2">
              ₹{totalAmount}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Total Entries
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {totalEntries}
            </h2>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md">

          <table className="w-full text-sm">

            <thead className="bg-black text-white">

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

              {filteredEntries.map((entry) => (

                <tr
                  key={entry.id}
                  className="border-b"
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
                    {entry.rate}
                  </td>

                  <td className="p-4">
                    ₹{entry.amount}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  )
}