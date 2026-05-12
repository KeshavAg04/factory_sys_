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
} from 'recharts'

import { supabase } from '@/lib/supabase'

export default function DashboardPage() {

  const [entries, setEntries] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

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

  // TODAY

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const todayEntries =
    entries.filter(
      (entry) =>
        entry.production_date === today
    )

  // TOTALS

  const todayQuantity =
    todayEntries.reduce(
      (sum, entry) =>
        sum +
        Number(entry.quantity || 0),
      0
    )

  const todayAmount =
    todayEntries.reduce(
      (sum, entry) =>
        sum +
        Number(entry.amount || 0),
      0
    )

  // FACTORY SUMMARY

  const factorySummary =
    useMemo(() => {

      const grouped: any = {}

      entries.forEach((entry) => {

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
          factory,
          quantity:
            grouped[factory]
              .quantity,
          amount:
            grouped[factory]
              .amount,
        })
      )

    }, [entries])

  // MACHINE SUMMARY

  const machineSummary =
    useMemo(() => {

      const grouped: any = {}

      entries.forEach((entry) => {

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
          machine,
          quantity:
            grouped[machine]
              .quantity,
          amount:
            grouped[machine]
              .amount,
        })
      )

    }, [entries])

  // LABOUR SUMMARY

  const labourSummary =
    useMemo(() => {

      const grouped: any = {}

      entries.forEach((entry) => {

        if (
          !grouped[
            entry.labour_name
          ]
        ) {

          grouped[
            entry.labour_name
          ] = {
            quantity: 0,
            amount: 0,
          }
        }

        grouped[
          entry.labour_name
        ].quantity +=
          Number(
            entry.quantity || 0
          )

        grouped[
          entry.labour_name
        ].amount +=
          Number(
            entry.amount || 0
          )

      })

      return Object.keys(grouped).map(
        (labour) => ({
          labour,
          quantity:
            grouped[labour]
              .quantity,
          amount:
            grouped[labour]
              .amount,
        })
      )

    }, [entries])

  // DAILY TREND

  const dailyTrend =
    useMemo(() => {

      const grouped: any = {}

      entries.forEach((entry) => {

        if (
          !grouped[
            entry.production_date
          ]
        ) {

          grouped[
            entry.production_date
          ] = 0
        }

        grouped[
          entry.production_date
        ] +=
          Number(
            entry.amount || 0
          )

      })

      return Object.keys(grouped).map(
        (date) => ({
          date,
          amount:
            grouped[date],
        })
      )

    }, [entries])

  // MONTHLY TREND

  const monthlyTrend =
    useMemo(() => {

      const grouped: any = {}

      entries.forEach((entry) => {

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

    }, [entries])

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
            Dashboard
          </h1>

        </div>

        {/* TOP CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Today Quantity
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {todayQuantity}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Today Amount
            </p>

            <h2 className="text-4xl font-bold mt-2">
              ₹{todayAmount}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Total Entries
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {entries.length}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Total Machines
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {machineSummary.length}
            </h2>

          </div>

        </div>

        {/* FACTORY + MACHINE */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* FACTORY */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-2xl font-bold mb-4">
              Factory Summary
            </h2>

            <div className="space-y-4">

              {factorySummary.map(
                (factory) => (

                  <div
                    key={
                      factory.factory
                    }
                    className="border rounded-xl p-4"
                  >

                    <div className="flex justify-between">

                      <div>

                        <h3 className="font-bold text-lg">
                          {
                            factory.factory
                          }
                        </h3>

                        <p className="text-gray-500">
                          Qty:{' '}
                          {
                            factory.quantity
                          }
                        </p>

                      </div>

                      <h3 className="text-xl font-bold">
                        ₹
                        {
                          factory.amount
                        }
                      </h3>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* MACHINE */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-2xl font-bold mb-4">
              Machine Summary
            </h2>

            <div className="space-y-4">

              {machineSummary.map(
                (machine) => (

                  <div
                    key={
                      machine.machine
                    }
                    className="border rounded-xl p-4"
                  >

                    <div className="flex justify-between">

                      <div>

                        <h3 className="font-bold text-lg">
                          {
                            machine.machine
                          }
                        </h3>

                        <p className="text-gray-500">
                          Qty:{' '}
                          {
                            machine.quantity
                          }
                        </p>

                      </div>

                      <h3 className="text-xl font-bold">
                        ₹
                        {
                          machine.amount
                        }
                      </h3>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

        {/* LABOUR */}

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">

          <h2 className="text-2xl font-bold mb-4">
            Labour Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {labourSummary.map(
              (labour) => (

                <div
                  key={labour.labour}
                  className="border rounded-xl p-4"
                >

                  <h3 className="font-bold text-lg">
                    {labour.labour}
                  </h3>

                  <p className="text-gray-500 mt-2">
                    Quantity:{' '}
                    {labour.quantity}
                  </p>

                  <h3 className="text-xl font-bold mt-2">
                    ₹
                    {labour.amount}
                  </h3>

                </div>

              )
            )}

          </div>

        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* DAILY */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-2xl font-bold mb-6">
              Daily Trend
            </h2>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={dailyTrend}>

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="amount" />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* MONTHLY */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-2xl font-bold mb-6">
              Monthly Trend
            </h2>

            <div className="h-[350px]">

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

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="amount"
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}