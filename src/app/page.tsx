import Link from 'next/link'

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Factory Production Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Link href="/production-entry">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl cursor-pointer">
              <h2 className="text-2xl font-bold">
                Add Production
              </h2>

              <p className="text-gray-600 mt-2">
                Add daily production entries
              </p>
            </div>
          </Link>

          <Link href="/reports">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl cursor-pointer">
              <h2 className="text-2xl font-bold">
                Reports
              </h2>

              <p className="text-gray-600 mt-2">
                View and export reports
              </p>
            </div>
          </Link>

        </div>
      </div>
    </main>
  )
}