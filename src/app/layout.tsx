'use client'

import './globals.css'

import Link from 'next/link'

import {
  usePathname,
} from 'next/navigation'

import {
  Toaster,
} from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname =
    usePathname()

  const navClass = (
    path: string
  ) => `

    px-5 py-3 rounded-2xl shadow-sm
    font-medium transition whitespace-nowrap

    ${
      pathname === path

        ? 'bg-slate-800 text-white'

        : 'bg-white hover:bg-slate-200 text-slate-800'
    }

  `

  return (

    <html lang="en">

      <head>

        <title>
          KM Factory
        </title>

        <meta
          name="description"
          content="Production Management System"
        />

        <link
          rel="manifest"
          href="/manifest.json"
        />

        <meta
          name="theme-color"
          content="#0f172a"
        />

      </head>

      <body className="bg-slate-100">

        <Toaster position="top-right" />

        <div className="min-h-screen flex flex-col">

          {/* DESKTOP NAVBAR */}

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
                className={navClass('/')}
              >
                Dashboard
              </Link>

              <Link
                href="/production-entry"
                className={navClass('/production-entry')}
              >
                Production Entry
              </Link>

              <Link
                href="/recent-entries"
                className={navClass('/recent-entries')}
              >
                Recent Entries
              </Link>

              <Link
                href="/reports"
                className={navClass('/reports')}
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
                className={navClass('/')}
              >
                Dashboard
              </Link>

              <Link
                href="/production-entry"
                className={navClass('/production-entry')}
              >
                Entry
              </Link>

              <Link
                href="/recent-entries"
                className={navClass('/recent-entries')}
              >
                Recent
              </Link>

              <Link
                href="/reports"
                className={navClass('/reports')}
              >
                Reports
              </Link>

            </div>

          </header>

          {/* PAGE CONTENT */}

          <main className="flex-1 pt-56 md:pt-0">

            {children}

          </main>

        </div>

      </body>

    </html>
  )
}