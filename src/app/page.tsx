'use client'

import Link from 'next/link'

export default function DashboardPage() {

  return (
    <div className="space-y-6">

      <div>
        <p className="text-slate-500">
          Production Management
        </p>

        <h1 className="text-5xl font-bold text-[#0B1533]">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0B1533] mb-2">
            Production Entry
          </h2>

          <p className="text-slate-500 mb-6">
            Add new production entries
          </p>

          <Link
            href="/production-entry"
            className="inline-flex bg-[#14213D] text-white px-6 py-3 rounded-2xl"
          >
            Open Entry Page
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0B1533] mb-2">
            Reports
          </h2>

          <p className="text-slate-500 mb-6">
            View production reports
          </p>

          <Link
            href="/reports"
            className="inline-flex bg-[#14213D] text-white px-6 py-3 rounded-2xl"
          >
            Open Reports
          </Link>
        </div>

      </div>

    </div>
  )
}