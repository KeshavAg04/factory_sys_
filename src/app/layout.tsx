import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Production Management',
  description: 'Factory Production Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="en">

      <body className="bg-slate-100">

        <div className="min-h-screen flex flex-col">

          {/* DESKTOP TOP NAVBAR */}

          <aside className="hidden md:flex items-center justify-between bg-slate-100 border-b border-slate-200 px-8 py-4 sticky top-0 z-50">

            <div>

              <p className="text-slate-500 text-sm">
                Production Management
              </p>

              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                KM Factory
              </h1>

            </div>

            <nav className="flex gap-3">

              <Link
                href="/"
                className="bg-white hover:bg-slate-200 transition px-5 py-3 rounded-2xl shadow-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                href="/production-entry"
                className="bg-white hover:bg-slate-200 transition px-5 py-3 rounded-2xl shadow-sm font-medium"
              >
                Production Entry
              </Link>

              <Link
                href="/recent-entries"
                className="bg-white hover:bg-slate-200 transition px-5 py-3 rounded-2xl shadow-sm font-medium"
              >
                Recent Entries
              </Link>

              <Link
                href="/reports"
                className="bg-white hover:bg-slate-200 transition px-5 py-3 rounded-2xl shadow-sm font-medium"
              >
                Reports
              </Link>

            </nav>

          </aside>

          {/* MOBILE NAVBAR */}

          <header className="md:hidden bg-slate-100 border-b border-slate-200 px-4 py-4 sticky top-0 z-50 shadow-sm">

            <div>

              <p className="text-slate-500 text-sm">
                Production Management
              </p>

              <h1 className="text-xl font-bold text-slate-900 mt-1">
                KM Factory
              </h1>

            </div>

            <div className="flex gap-2 overflow-x-auto mt-4 pb-1">

              <Link
                href="/"
                className="bg-white whitespace-nowrap px-4 py-2 rounded-xl shadow-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                href="/production-entry"
                className="bg-white whitespace-nowrap px-4 py-2 rounded-xl shadow-sm font-medium"
              >
                Entry
              </Link>

              <Link
                href="/recent-entries"
                className="bg-white whitespace-nowrap px-4 py-2 rounded-xl shadow-sm font-medium"
              >
                Recent
              </Link>

              <Link
                href="/reports"
                className="bg-white whitespace-nowrap px-4 py-2 rounded-xl shadow-sm font-medium"
              >
                Reports
              </Link>

            </div>

          </header>

          {/* PAGE CONTENT */}

          <main className="flex-1">

            {children}

          </main>

        </div>

      </body>

    </html>
  )
}