'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

interface Entry {
  id: string
  production_date: string
  factory: string
  labour_name: string
  machine: string
  shift: string
  bag_name: string
  quantity: number
  amount: number
}

interface Factory {
  id: string
  factory_name: string
}

export default function ReportsPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [factories, setFactories] = useState<Factory[]>([])

  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    factory: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchFactories()
    fetchEntries()
  }, [])

  const fetchFactories = async () => {
    const { data } = await supabase
      .from('factory_master')
      .select('*')

    if (data) {
      setFactories(data)
    }
  }

  const fetchEntries = async () => {
    setLoading(true)

    let query = supabase
      .from('production_entries')
      .select('*')
      .order('production_date', {
        ascending: false,
      })

    if (filters.factory) {
      query = query.eq(
        'factory',
        filters.factory
      )
    }

    if (filters.startDate) {
      query = query.gte(
        'production_date',
        filters.startDate
      )
    }

    if (filters.endDate) {
      query = query.lte(
        'production_date',
        filters.endDate
      )
    }

    const { data, error } = await query

    if (error) {
      console.log(error)
      return
    }

    setEntries(data || [])
    setLoading(false)
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      entries.map((entry) => ({
        Date: entry.production_date,
        Factory: entry.factory,
        Labour: entry.labour_name,
        Machine: entry.machine,
        Shift: entry.shift,
        Bag: entry.bag_name,
        Quantity: entry.quantity,
        Amount: entry.amount,
      }))
    )

    const workbook = XLSX.utils.book_new()

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

  const totalQuantity = entries.reduce(
    (sum, entry) => sum + entry.quantity,
    0
  )

  const totalAmount = entries.reduce(
    (sum, entry) => sum + entry.amount,
    0
  )

  return (
    <main className="min-h-screen bg-gray-100 p-4">
  
      <div className="max-w-7xl mx-auto">
  
        {/* HEADER */}
  
        <div className="mb-6">
  
          <p className="text-gray-500 text-sm">
            Production Management
          </p>
  
          <h1 className="text-4xl font-bold mt-2">
            Production Reports
          </h1>
  
        </div>
  
        {/* FILTERS */}
  
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
  
          <h2 className="text-xl font-semibold mb-4">
            Filters
          </h2>
  
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  
            <select
              value={filters.factory}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  factory: e.target.value,
                })
              }
              className="border p-4 rounded-xl"
            >
              <option value="">
                All Factories
              </option>
  
              {factories.map((factory) => (
                <option
                  key={factory.id}
                  value={factory.factory_name}
                >
                  {factory.factory_name}
                </option>
              ))}
            </select>
  
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  startDate: e.target.value,
                })
              }
              className="border p-4 rounded-xl"
            />
  
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  endDate: e.target.value,
                })
              }
              className="border p-4 rounded-xl"
            />
  
            <button
              onClick={fetchEntries}
              className="bg-black text-white rounded-xl text-lg font-semibold"
            >
              Search
            </button>
  
          </div>
  
          <button
            onClick={exportToExcel}
            className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Export Excel
          </button>
  
        </div>
  
        {/* TOTALS */}
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  
          <div className="bg-white rounded-2xl shadow-md p-6">
  
            <p className="text-gray-500">
              Total Quantity
            </p>
  
            <h2 className="text-4xl font-bold mt-2">
              {totalQuantity}
            </h2>
  
          </div>
  
          <div className="bg-black text-white rounded-2xl shadow-md p-6">
  
            <p className="text-gray-300">
              Total Amount
            </p>
  
            <h2 className="text-4xl font-bold mt-2">
              ₹{totalAmount}
            </h2>
  
          </div>
  
        </div>
  
        {/* TABLE */}
  
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
  
          <div className="overflow-x-auto">
  
            {loading ? (
              <div className="p-6">
                Loading...
              </div>
            ) : (
  
              <table className="w-full">
  
                <thead className="bg-gray-100">
  
                  <tr>
  
                    <th className="p-4 text-left">
                      Date
                    </th>
  
                    <th className="p-4 text-left">
                      Factory
                    </th>
  
                    <th className="p-4 text-left">
                      Labour
                    </th>
  
                    <th className="p-4 text-left">
                      Machine
                    </th>
  
                    <th className="p-4 text-left">
                      Shift
                    </th>
  
                    <th className="p-4 text-left">
                      Bag
                    </th>
  
                    <th className="p-4 text-left">
                      Qty
                    </th>
  
                    <th className="p-4 text-left">
                      Amount
                    </th>
  
                  </tr>
  
                </thead>
  
                <tbody>
  
                  {entries.map((entry) => (
  
                    <tr
                      key={entry.id}
                      className="border-t hover:bg-gray-50"
                    >
  
                      <td className="p-4">
                        {entry.production_date}
                      </td>
  
                      <td className="p-4">
                        {entry.factory}
                      </td>
  
                      <td className="p-4">
                        {entry.labour_name}
                      </td>
  
                      <td className="p-4">
                        {entry.machine}
                      </td>
  
                      <td className="p-4">
                        {entry.shift}
                      </td>
  
                      <td className="p-4">
                        {entry.bag_name}
                      </td>
  
                      <td className="p-4 font-semibold">
                        {entry.quantity}
                      </td>
  
                      <td className="p-4 font-semibold">
                        ₹{entry.amount}
                      </td>
  
                    </tr>
  
                  ))}
  
                </tbody>
  
              </table>
  
            )}
  
          </div>
  
        </div>
  
      </div>
  
    </main>
  )
}