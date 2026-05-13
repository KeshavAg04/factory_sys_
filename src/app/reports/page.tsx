'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { supabase } from '@/lib/supabase'

function calculateTons(
  bagType: string,
  qty: number
) {

  const type = bagType.toLowerCase()

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

export default function ReportsPage() {

  const [entries, setEntries] =
    useState<any[]>([])

  const [factories, setFactories] =
    useState<string[]>([])

  const [machines, setMachines] =
    useState<string[]>([])

  const [labours, setLabours] =
    useState<string[]>([])

  const [bagTypes, setBagTypes] =
    useState<string[]>([])

  const [fromDate, setFromDate] =
    useState('')

  const [toDate, setToDate] =
    useState('')

  const [factoryFilter,
    setFactoryFilter] =
    useState('')

  const [machineFilter,
    setMachineFilter] =
    useState('')

  const [labourFilter,
    setLabourFilter] =
    useState('')

  const [shiftFilter,
    setShiftFilter] =
    useState('')

  const [bagTypeFilter,
    setBagTypeFilter] =
    useState('')

  const [search, setSearch] =
    useState('')

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
        .order('date', {
          ascending: false,
        })

    const finalData =
      data || []

    setEntries(finalData)

    setFactories([
      ...new Set(
        finalData.map(
          (i) => i.factory
        )
      ),
    ])

    setMachines([
      ...new Set(
        finalData.map(
          (i) => i.machine
        )
      ),
    ])

    setLabours([
      ...new Set(
        finalData.map(
          (i) => i.labour
        )
      ),
    ])

    setBagTypes([
      ...new Set(
        finalData.map(
          (i) => i.bag_type
        )
      ),
    ])
  }

  const filteredEntries =
    useMemo(() => {

      return entries.filter(
        (entry) => {

          const matchesSearch =
            !search ||
            entry.labour
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            entry.machine
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )

          const matchesFactory =
            !factoryFilter ||
            entry.factory ===
              factoryFilter

          const matchesMachine =
            !machineFilter ||
            entry.machine ===
              machineFilter

          const matchesLabour =
            !labourFilter ||
            entry.labour ===
              labourFilter

          const matchesShift =
            !shiftFilter ||
            entry.shift ===
              shiftFilter

          const matchesBagType =
            !bagTypeFilter ||
            entry.bag_type ===
              bagTypeFilter

          const matchesFrom =
            !fromDate ||
            entry.date >= fromDate

          const matchesTo =
            !toDate ||
            entry.date <= toDate

          return (
            matchesSearch &&
            matchesFactory &&
            matchesMachine &&
            matchesLabour &&
            matchesShift &&
            matchesBagType &&
            matchesFrom &&
            matchesTo
          )
        }
      )

    }, [
      entries,
      search,
      factoryFilter,
      machineFilter,
      labourFilter,
      shiftFilter,
      bagTypeFilter,
      fromDate,
      toDate,
    ])

  const totalAmount =
    filteredEntries.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount || 0
        ),
      0
    )

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

  const categoryWise =
    Object.values(

      filteredEntries.reduce(
        (acc: any, item) => {

          const key =
            item.bag_type

          if (!acc[key]) {

            acc[key] = {

              category: key,
              bags: 0,
              tons: 0,
            }
          }

          acc[key].bags +=
            Number(
              item.quantity
            )

          acc[key].tons +=
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

  return (

    <div className="space-y-6">

      <div>

        <p className="text-slate-500">
          Production Management
        </p>

        <h1 className="text-5xl font-bold text-slate-900">
          Reports
        </h1>

      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
            className="h-14 rounded-2xl border border-slate-200 px-4"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
            className="h-14 rounded-2xl border border-slate-200 px-4"
          />

          <select
            value={factoryFilter}
            onChange={(e) =>
              setFactoryFilter(
                e.target.value
              )
            }
            className="h-14 rounded-2xl border border-slate-200 px-4"
          >

            <option value="">
              All Factories
            </option>

            {factories.map(
              (item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              )
            )}

          </select>

          <select
            value={machineFilter}
            onChange={(e) =>
              setMachineFilter(
                e.target.value
              )
            }
            className="h-14 rounded-2xl border border-slate-200 px-4"
          >

            <option value="">
              All Machines
            </option>

            {machines.map(
              (item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              )
            )}

          </select>

          <select
            value={labourFilter}
            onChange={(e) =>
              setLabourFilter(
                e.target.value
              )
            }
            className="h-14 rounded-2xl border border-slate-200 px-4"
          >

            <option value="">
              All Labours
            </option>

            {labours.map(
              (item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              )
            )}

          </select>

          <select
            value={shiftFilter}
            onChange={(e) =>
              setShiftFilter(
                e.target.value
              )
            }
            className="h-14 rounded-2xl border border-slate-200 px-4"
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
            className="h-14 rounded-2xl border border-slate-200 px-4"
          >

            <option value="">
              All Bag Types
            </option>

            {bagTypes.map(
              (item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              )
            )}

          </select>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search..."
            className="h-14 rounded-2xl border border-slate-200 px-4"
          />

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl border border-slate-200 p-6">

          <p className="text-slate-500">
            Total Goods Produced
          </p>

          <h2 className="text-5xl font-bold">
            {totalGoods.toFixed(2)} T
          </h2>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6">

          <p className="text-slate-500">
            Total Amount
          </p>

          <h2 className="text-5xl font-bold">
            ₹{totalAmount}
          </h2>

        </div>

      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-3xl font-bold">
            Category Wise Production
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="text-left p-4">
                Category
              </th>

              <th className="text-left p-4">
                Bags Produced
              </th>

              <th className="text-left p-4">
                Goods Produced
              </th>

            </tr>

          </thead>

          <tbody>

            {categoryWise.map(
              (item: any) => (

                <tr
                  key={item.category}
                  className="border-t"
                >

                  <td className="p-4">
                    {
                      item.category
                    }
                  </td>

                  <td className="p-4">
                    {item.bags}
                  </td>

                  <td className="p-4">
                    {item.tons.toFixed(
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
  )
}