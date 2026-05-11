'use client'

import Link from 'next/link'

import {
  Factory,
  FileSpreadsheet,
  PlusCircle,
  TrendingUp,
} from 'lucide-react'

<h1>NEW VERSION TEST</h1>

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-gray-500 text-sm">
            Production Management System
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Dashboard
          </h1>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl p-6 shadow-md">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Factories
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  2
                </h2>

              </div>

              <Factory size={40} />

            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Daily Entries
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  Live
                </h2>

              </div>

              <TrendingUp size={40} />

            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Reports
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  Export
                </h2>

              </div>

              <FileSpreadsheet size={40} />

            </div>
          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Link href="/production-entry">

            <div className="bg-black text-white rounded-2xl p-8 shadow-md hover:scale-[1.02] transition cursor-pointer">

              <div className="flex items-center gap-4">

                <PlusCircle size={42} />

                <div>

                  <h2 className="text-2xl font-bold">
                    Add Production
                  </h2>

                  <p className="text-gray-300 mt-2">
                    Add new daily production entries
                  </p>

                </div>
              </div>
            </div>
          </Link>

          <Link href="/reports">

            <div className="bg-white rounded-2xl p-8 shadow-md hover:scale-[1.02] transition cursor-pointer">

              <div className="flex items-center gap-4">

                <FileSpreadsheet size={42} />

                <div>

                  <h2 className="text-2xl font-bold">
                    Reports
                  </h2>

                  <p className="text-gray-500 mt-2">
                    View and export production reports
                  </p>

                </div>
              </div>
            </div>
          </Link>

        </div>

      </div>
    </main>
  )
}