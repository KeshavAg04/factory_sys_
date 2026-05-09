import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <h1 className="text-xl font-bold">
          Factory Production
        </h1>

        <div className="flex gap-4">

          <Link
            href="/"
            className="hover:text-gray-300"
          >
            Dashboard
          </Link>

          <Link
            href="/production-entry"
            className="hover:text-gray-300"
          >
            Add Entry
          </Link>

          <Link
            href="/reports"
            className="hover:text-gray-300"
          >
            Reports
          </Link>

        </div>
      </div>
    </nav>
  )
}