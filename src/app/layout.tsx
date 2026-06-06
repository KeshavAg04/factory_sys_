'use client'

import './globals.css'

import Link from 'next/link'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import {
  Toaster,
} from 'react-hot-toast'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [role,setRole] =
useState('')

const [mobileMenuOpen,setMobileMenuOpen] =
useState(false)

const [productionOpen,setProductionOpen] =
useState(false)

const [inventoryOpen,setInventoryOpen] =
useState(false)

const [dispatchOpen,setDispatchOpen] =
useState(false)

const [loadingRole,setLoadingRole] =
useState(true)

useEffect(()=>{

  loadRole()

  const {
    data: listener
  } =
  supabase.auth.onAuthStateChange(
    () => {

      loadRole()

    }
  )

  return () => {

    listener.subscription.unsubscribe()

  }

},[])

async function loadRole(){

  setLoadingRole(true)

  const {
    data:{user}
  } =
  await supabase.auth.getUser()

  if(!user){

    setRole('')
    setLoadingRole(false)
  
    return

  }

  const {data} =
await supabase
.from('profiles')
.select('role,factory')
.eq('id',user.id)
.single()

  setRole(
    data?.role || ''
  )

  localStorage.setItem(
    'userFactory',
    data?.factory || ''
    )
    
    localStorage.setItem(
    'userRole',
    data?.role || ''
    )

  setLoadingRole(false)

}

async function handleLogout(){

  await supabase.auth.signOut()

  router.push('/login')

}

  const pathname =
    usePathname()
  
  const router =
    useRouter()

  const isLoginPage =
  pathname === '/login'

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

          <div className="hidden md:block">

          <nav className="flex items-center justify-between w-full px-8 py-3">

  <div className="flex items-center gap-8">

    <Link
      href="/"
      className={`
        text-sm font-semibold
        pb-1 border-b-2 transition
        ${
          pathname === '/'
            ? 'border-slate-900 text-slate-900'
            : 'border-transparent text-slate-600 hover:text-slate-900'
        }
      `}
    >
      Dashboard
    </Link>

    {(role === 'Admin' ||
      role === 'production') && (

      <div className="relative group py-3">

        <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">

          Production ▾

        </button>

        <div className="absolute top-8 left-0 mt-0 hidden group-hover:flex flex-col bg-white shadow-xl rounded-xl min-w-[220px] border border-slate-200 overflow-hidden z-50">

          <Link
            href="/production-entry"
            className="px-4 py-3 hover:bg-slate-100"
          >
            Production Entry
          </Link>

          <Link
            href="/recent-entries"
            className="px-4 py-3 hover:bg-slate-100"
          >
            Recent Production
          </Link>

          <Link
            href="/reports"
            className="px-4 py-3 hover:bg-slate-100"
          >
            Production Reports
          </Link>

          <Link
  href="/opening-stock"
  className="px-4 py-3 hover:bg-slate-100"
>
  Opening Stock Master
</Link>

<Link
  href="/bag-name-master"
  className="px-4 py-3 hover:bg-slate-100"
>
  Bag Name Master
</Link>

<Link
  href="/monthly-labour-report"
  className="px-4 py-3 hover:bg-slate-100"
>
  Monthly Labour Report
</Link>

        </div>

      </div>

    )}

    <div className="relative group py-3">

      <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">

        Inventory ▾

      </button>

      <div className="absolute top-8 left-0 mt-0 hidden group-hover:flex flex-col bg-white shadow-xl rounded-xl min-w-[220px] border border-slate-200 overflow-hidden z-50">

        <Link
          href="/empty-bag-inward"
          className="px-4 py-3 hover:bg-slate-100"
        >
          Empty Bag Inward
        </Link>

        <Link
          href="/factory-transfer"
          className="px-4 py-3 hover:bg-slate-100"
        >
          Factory Transfer
        </Link>

        <Link
          href="/inventory"
          className="px-4 py-3 hover:bg-slate-100"
        >
          Inventory Dashboard
        </Link>

        <Link
href="/inventory-closing"
className="px-4 py-3 hover:bg-slate-100"
>
Inventory Closing
</Link>

      </div>

    </div>

    {(role === 'Admin' ||
      role === 'accounts') && (

      <div className="relative group py-3">

        <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">

          Dispatch ▾

        </button>

        <div className="absolute top-8 left-0 mt-0 hidden group-hover:flex flex-col bg-white shadow-xl rounded-xl min-w-[220px] border border-slate-200 overflow-hidden z-50">

          <Link
            href="/dispatch"
            className="px-4 py-3 hover:bg-slate-100"
          >
            Dispatch Entry
          </Link>

          <Link
            href="/recent-dispatch"
            className="px-4 py-3 hover:bg-slate-100"
          >
            Recent Dispatch
          </Link>

          <Link
            href="/dispatch-reports"
            className="px-4 py-3 hover:bg-slate-100"
          >
            Dispatch Reports
          </Link>

        </div>

      </div>

    )}

  </div>

  <button
    onClick={handleLogout}
    className="
      px-4 py-2
      rounded-xl
      bg-red-500
      text-white
      text-sm
      font-medium
      hover:bg-red-600
      transition
    "
  >
    Logout
  </button>

</nav>
</div>

          {/* MOBILE NAVBAR */}

          {!isLoginPage && (

<header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">

  <div className="flex items-center justify-between px-4 py-4">

    <div>

      <p className="text-slate-500 text-xs">
        Production Management
      </p>

      <h1 className="text-xl font-bold text-slate-900">
        KM Factory
      </h1>

    </div>

    <button
      onClick={()=>{

        const newState =
          !mobileMenuOpen
      
        setMobileMenuOpen(
          newState
        )
      
        if(!newState){
      
          setProductionOpen(false)
      
          setInventoryOpen(false)
      
          setDispatchOpen(false)
      
        }
      
      }}
      className="
        text-2xl
        px-3
        py-1
        rounded-lg
        bg-slate-100
      "
    >
      ☰
    </button>

  </div>

  {mobileMenuOpen && (

    <div className="border-t border-slate-200 bg-white">

      <Link
        href="/"
        className="block px-4 py-3 border-b"
      >
        Dashboard
      </Link>

      {(role === 'Admin' ||
        role === 'production') && (

        <>
          <button
            onClick={()=> {
              setProductionOpen(
                !productionOpen
              )
              setInventoryOpen(false)

  setDispatchOpen(false)}
            }
            className="w-full text-left px-4 py-3 border-b font-medium"
          >
            Production ▼
          </button>

          {productionOpen && (

            <div className="bg-slate-50">

              <Link
                href="/production-entry"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className="block px-8 py-3 border-b"
              >
                Production Entry
              </Link>

              <Link
                href="/recent-entries"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className="block px-8 py-3 border-b"
              >
                Recent Production
              </Link>

              <Link
                href="/reports"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className="block px-8 py-3 border-b"
              >
                Production Reports
              </Link>

              <Link
  href="/opening-stock"
  onClick={()=>{
    setMobileMenuOpen(false)
  }}
  className="block px-8 py-3 border-b"
>
  Opening Stock Master
</Link>

<Link
  href="/monthly-labour-report"
  className={navClass('/monthly-labour-report')}
>
  Labour Report
</Link>

            </div>

          )}

        </>

      )}

      <button
        onClick={()=>{
          setInventoryOpen(
            !inventoryOpen
          )
          setProductionOpen(false)

  setDispatchOpen(false)
        }}
        className="w-full text-left px-4 py-3 border-b font-medium"
      >
        Inventory ▼
      </button>

      {inventoryOpen && (

        <div className="bg-slate-50">

          <Link
            href="/empty-bag-inward"
            onClick={()=>{
              setMobileMenuOpen(false)
            }}
            className="block px-8 py-3 border-b"
          >
            Empty Bag Inward
          </Link>

          <Link
            href="/factory-transfer"
            onClick={()=>{
              setMobileMenuOpen(false)
            }}
            className="block px-8 py-3 border-b"
          >
            Factory Transfer
          </Link>

          <Link
            href="/inventory"
            onClick={()=>{
              setMobileMenuOpen(false)
            }}
            className="block px-8 py-3 border-b"
          >
            Inventory Dashboard
          </Link>

          <Link
href="/inventory-closing"
className={navClass('/inventory-closing')}
onClick={()=>{
setMobileMenuOpen(false)
setInventoryOpen(false)
}}
>
Inventory Closing
</Link>

        </div>

      )}

      {(role === 'Admin' ||
        role === 'accounts') && (

        <>
          <button
            onClick={()=>{
              setDispatchOpen(
                !dispatchOpen
              )
              setProductionOpen(false)

  setInventoryOpen(false)
            }}
            className="w-full text-left px-4 py-3 border-b font-medium"
          >
            Dispatch ▼
          </button>

          {dispatchOpen && (

            <div className="bg-slate-50">

              <Link
                href="/dispatch"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className="block px-8 py-3 border-b"
              >
                Dispatch Entry
              </Link>

              <Link
                href="/recent-dispatch"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className="block px-8 py-3 border-b"
              >
                Recent Dispatch
              </Link>

              <Link
                href="/dispatch-reports"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className="block px-8 py-3 border-b"
              >
                Dispatch Reports
              </Link>

            </div>

          )}

        </>

      )}

      <button
        onClick={handleLogout}
        className="
          w-full
          text-left
          px-4
          py-3
          bg-red-500
          text-white
        "
      >
        Logout
      </button>

    </div>

  )}

</header>

)}

{/* PAGE CONTENT */}

<main className="flex-1 pt-56 md:pt-0">

            {children}

          </main>

</div>

      </body>

    </html>
  )
}