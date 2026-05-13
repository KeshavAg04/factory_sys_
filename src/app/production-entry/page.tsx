'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  supabase,
} from '@/lib/supabase'

export default function ReportsPage() {

  const [
    entries,
    setEntries,
  ] = useState<any[]>([])

  const [
    factories,
    setFactories,
  ] = useState<any[]>([])

  const [
    machines,
    setMachines,
  ] = useState<any[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    selectedFactory,
    setSelectedFactory,
  ] = useState('')

  const [
    selectedMachine,
    setSelectedMachine,
  ] = useState('')

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    fromDate,
    setFromDate,
  ] = useState('')

  const [
    toDate,
    setToDate,
  ] = useState('')

  useEffect(() => {

    fetchMasters()

    fetchEntries()

  }, [])

  useEffect(() => {

    fetchEntries()

  }, [
    selectedFactory,
    selectedMachine,
    fromDate,
    toDate,
  ])

  async function fetchMasters() {

    const factoriesRes =
      await supabase
        .from('factory_master')
        .select('*')

    const machinesRes =
      await supabase
        .from('machine_master')
        .select('*')

    setFactories(
      factoriesRes.data || []
    )

    setMachines(
      machinesRes.data || []
    )
  }

  async function fetchEntries() {

    setLoading(true)

    let query =
      supabase
        .from(
          'production_entries'
        )
        .select('*')
        .order('date', {
          ascending: false,
        })

    if (selectedFactory) {

      query =
        query.eq(
          'factory',
          selectedFactory
        )
    }

    if (selectedMachine) {

      query =
        query.eq(
          'machine',
          selectedMachine
        )
    }

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

  const filteredEntries =
    entries.filter((entry) => {

      if (!search)
        return true

      return JSON.stringify(
        entry
      )
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    })

  function calculateTons(
    bagType: string,
    quantity: number,
  ) {

    const type =
      bagType?.toLowerCase() || ''

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

  const totalAmount =
    filteredEntries.reduce(
      (sum, entry) => {

        return (
          sum +
          Number(
            entry.amount || 0
          )
        )

      },
      0
    )

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

      filteredEntries.forEach(
        (entry) => {

          const key =
            `${entry.bag_type} (${entry.mesh}#)`

          if (
            !grouped[key]
          ) {

            grouped[key] = {

              bags: 0,
              tons: 0,

            }
          }

          grouped[key].bags +=
            Number(
              entry.quantity
            )

          grouped[key].tons +=
            calculateTons(
              entry.bag_type,
              Number(
                entry.quantity
              )
            )
        }
      )

      return Object.entries(
        grouped
      )

    }, [filteredEntries])

  return (

    <div className="p-4 md:p-6 space-y-6">

      <div>

        <p className="text-slate-500 text-sm">
          Production Management
        </p>

        <h1 className="text-4xl font-bold text-slate-900">
          Reports
        </h1>

      </div>

      {/* FILTERS */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
          />

          <select
            value={
              selectedFactory
            }
            onChange={(e) =>
              setSelectedFactory(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
          >

            <option value="">
              All Factories
            </option>

            {factories.map(
              (item) => (

                <option
                  key={item.id}
                  value={
                    item.factory_name
                  }
                >
                  {
                    item.factory_name
                  }
                </option>

              )
            )}

          </select>

          <select
            value={
              selectedMachine
            }
            onChange={(e) =>
              setSelectedMachine(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
          >

            <option value="">
              All Machines
            </option>

            {machines.map(
              (item) => (

                <option
                  key={item.id}
                  value={
                    item.machine_name
                  }
                >
                  {
                    item.machine_name
                  }
                </option>

              )
            )}

          </select>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
          />

        </div>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <p className="text-slate-500 text-sm">
            Total Goods Produced
          </p>

          <h2 className="text-4xl font-bold mt-2 text-slate-900">

            {totalTons.toFixed(2)} T

          </h2>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <p className="text-slate-500 text-sm">
            Total Amount
          </p>

          <h2 className="text-4xl font-bold mt-2 text-slate-900">

            ₹
            {totalAmount.toLocaleString()}

          </h2>

        </div>

      </div>

      {/* CATEGORY SUMMARY */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">

          <h2 className="text-2xl font-bold text-slate-900">

            Category Wise Production

          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-[900px] w-full">

            <thead>

              <tr className="bg-slate-100">

                <th className="text-left px-6 py-4">
                  Category
                </th>

                <th className="text-left px-6 py-4">
                  Bags Produced
                </th>

                <th className="text-left px-6 py-4">
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

                    <td className="px-6 py-4">
                      {key}
                    </td>

                    <td className="px-6 py-4">
                      {value.bags}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {value.tons.toFixed(
                        2
                      )}{' '}
                      T
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">

          <h2 className="text-2xl font-bold text-slate-900">

            Production Entries

          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-[1200px] w-full">

            <thead>

              <tr className="bg-slate-100">

                <th className="text-left px-6 py-4">
                  Date
                </th>

                <th className="text-left px-6 py-4">
                  Factory
                </th>

                <th className="text-left px-6 py-4">
                  Machine
                </th>

                <th className="text-left px-6 py-4">
                  Labour
                </th>

                <th className="text-left px-6 py-4">
                  Category
                </th>

                <th className="text-left px-6 py-4">
                  Qty
                </th>

                <th className="text-left px-6 py-4">
                  Tons
                </th>

                <th className="text-left px-6 py-4">
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredEntries.map(
                (entry) => (

                  <tr
                    key={entry.id}
                    className="border-t border-slate-100"
                  >

                    <td className="px-6 py-4">
                      {entry.date}
                    </td>

                    <td className="px-6 py-4">
                      {entry.factory}
                    </td>

                    <td className="px-6 py-4">
                      {entry.machine}
                    </td>

                    <td className="px-6 py-4">
                      {
                        entry.labour_name
                      }
                    </td>

                    <td className="px-6 py-4">

                      {
                        entry.bag_type
                      }
                      {' '}
                      (
                      {entry.mesh}
                      #)

                    </td>

                    <td className="px-6 py-4">
                      {
                        entry.quantity
                      }
                    </td>

                    <td className="px-6 py-4 font-medium">

                      {calculateTons(
                        entry.bag_type,
                        Number(
                          entry.quantity
                        )
                      ).toFixed(2)}
                      {' '}
                      T

                    </td>

                    <td className="px-6 py-4">

                      ₹
                      {Number(
                        entry.amount
                      ).toLocaleString()}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {loading && (

        <div className="text-slate-500">

          Loading...

        </div>

      )}

    </div>
  )
}