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
import { isDadiFactory } from '@/lib/permissions'



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [role,setRole] =
useState('')

const [userFactory,setUserFactory] =
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
    setUserFactory('')
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

  setUserFactory(
    data?.factory || ''
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

  const canAccessDispatch =
  role === 'Admin' ||
  role === 'accounts' ||
  (
    role === 'production' &&
    isDadiFactory(userFactory)
  )

  const productionRoutes = [
    '/production-entry',
    '/recent-entries',
    '/reports',
    '/opening-stock',
    '/bag-name-master',
    '/monthly-labour-report',
  ]

  const dispatchRoutes = [
    '/dispatch',
    '/recent-dispatch',
    '/dispatch-reports',
    '/credit-debit',
    '/credit-debit-reports',
    '/recent-credit-debit',
  ]

  const navLinkClass = (
    path: string
  ) =>
    pathname === path
      ? 'erp-nav-link erp-nav-link-active'
      : 'erp-nav-link'

  const navButtonClass = (
    paths: string[]
  ) =>
    paths.includes(pathname)
      ? 'erp-nav-button erp-nav-button-active'
      : 'erp-nav-button'

  const dropdownLinkClass = (
    path: string
  ) =>
    pathname === path
      ? 'erp-dropdown-link erp-dropdown-link-active'
      : 'erp-dropdown-link'

  const mobileLinkClass = (
    path: string
  ) =>
    pathname === path
      ? 'erp-mobile-link erp-mobile-link-active'
      : 'erp-mobile-link'

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

      <body>

        <Toaster position="top-right" />

        <div className="erp-shell flex flex-col">

          {/* DESKTOP NAVBAR */}

          <div className="hidden md:block sticky top-0 z-[200] bg-white/95 border-b border-slate-200 shadow-sm">

          <nav className="erp-topbar relative z-[210] flex items-center justify-between gap-6 px-8 py-3">

  <div className="flex items-center gap-3">

    <div className="flex items-center gap-3 pr-3">

      <div className="erp-brand-mark">
        KM
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Manufacturing ERP
        </p>

        <p className="text-sm font-bold text-slate-900">
          KM Factory
        </p>
      </div>

    </div>

    <Link
      href="/"
      className={navLinkClass('/')}
    >
      Dashboard
    </Link>

    {(role === 'Admin' ||
      role === 'production') && (

      <div className="relative group py-3 z-[220]">

        <button className={navButtonClass(productionRoutes)}>

          Production ▾

        </button>

        <div className="erp-dropdown absolute top-full left-0 -mt-1 hidden group-hover:flex flex-col z-[230]">

          <Link
            href="/production-entry"
            className={dropdownLinkClass('/production-entry')}
          >
            Production Entry
          </Link>

          <Link
            href="/recent-entries"
            className={dropdownLinkClass('/recent-entries')}
          >
            Recent Production
          </Link>

          <Link
            href="/reports"
            className={dropdownLinkClass('/reports')}
          >
            Production Reports
          </Link>

          <Link
  href="/opening-stock"
  className={dropdownLinkClass('/opening-stock')}
>
  Opening Stock Master
</Link>

<Link
  href="/bag-name-master"
  className={dropdownLinkClass('/bag-name-master')}
>
  Bag Name Master
</Link>

<Link
  href="/monthly-labour-report"
  className={dropdownLinkClass('/monthly-labour-report')}
>
  Monthly Labour Report
</Link>

        </div>

      </div>

    )}


    {canAccessDispatch && (

      <div className="relative group py-3 z-[220]">

        <button className={navButtonClass(dispatchRoutes)}>

          Dispatch ▾

        </button>

        <div className="erp-dropdown absolute top-full left-0 -mt-1 hidden group-hover:flex flex-col z-[230]">

          <Link
            href="/dispatch"
            className={dropdownLinkClass('/dispatch')}
          >
            Dispatch Entry
          </Link>

          <Link
            href="/recent-dispatch"
            className={dropdownLinkClass('/recent-dispatch')}
          >
            Recent Dispatch
          </Link>

          <Link
            href="/dispatch-reports"
            className={dropdownLinkClass('/dispatch-reports')}
          >
            Dispatch Reports
          </Link>

          <Link
  href="/credit-debit"
  className={dropdownLinkClass('/credit-debit')}
>
  Credit / Debit Entry
</Link>

<Link
  href="/credit-debit-reports"
  className={dropdownLinkClass('/credit-debit-reports')}
>
  Credit / Debit Reports
</Link>

<Link
  href="/recent-credit-debit"
  className={dropdownLinkClass('/recent-credit-debit')}
>
  Recent Credit / Debit
</Link>

        </div>

      </div>

    )}

  </div>

  <button
    onClick={handleLogout}
    className="
      min-h-10
      px-4 py-2
      rounded-full
      border
      border-red-100
      bg-red-50
      text-red-700
      text-sm
      font-bold
      hover:bg-red-100
    "
  >
    Logout
  </button>

</nav>
</div>

          {/* MOBILE NAVBAR */}

          {!isLoginPage && (

<header className="erp-mobile-header md:hidden border-b border-slate-200 sticky top-0 z-50 shadow-sm">

  <div className="flex items-center justify-between px-4 py-4">

    <div>

      <p className="text-slate-500 text-xs">
        Manufacturing ERP
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
        text-sm
        font-bold
        px-3
        py-2
        rounded-xl
        bg-slate-100
        border
        border-slate-200
      "
    >
      ☰
    </button>

  </div>

  {mobileMenuOpen && (

    <div className="border-t border-slate-200 bg-white shadow-xl">

      <Link
        href="/"
        onClick={() => {
          setMobileMenuOpen(false)
          setProductionOpen(false)
          setInventoryOpen(false)
          setDispatchOpen(false)
        }}
        className={mobileLinkClass('/')}
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
            className="erp-mobile-link w-full text-left"
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
                className={mobileLinkClass('/production-entry')}
              >
                Production Entry
              </Link>

              <Link
                href="/recent-entries"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className={mobileLinkClass('/recent-entries')}
              >
                Recent Production
              </Link>

              <Link
                href="/reports"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className={mobileLinkClass('/reports')}
              >
                Production Reports
              </Link>

              <Link
  href="/opening-stock"
  onClick={()=>{
    setMobileMenuOpen(false)
  }}
  className={mobileLinkClass('/opening-stock')}
>
  Opening Stock Master
</Link>

<Link
  href="/monthly-labour-report"
  onClick={() => {
    setMobileMenuOpen(false)
    setProductionOpen(false)
  }}
  className={mobileLinkClass('/monthly-labour-report')}
>
  Labour Report
</Link>

            </div>

          )}

        </>

      )}


      {canAccessDispatch && (

        <>
          <button
            onClick={()=>{
              setDispatchOpen(
                !dispatchOpen
              )
              setProductionOpen(false)

  setInventoryOpen(false)
            }}
            className="erp-mobile-link w-full text-left"
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
                className={mobileLinkClass('/dispatch')}
              >
                Dispatch Entry
              </Link>

              <Link
                href="/recent-dispatch"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className={mobileLinkClass('/recent-dispatch')}
              >
                Recent Dispatch
              </Link>

              <Link
                href="/dispatch-reports"
                onClick={()=>{
                  setMobileMenuOpen(false)
                }}
                className={mobileLinkClass('/dispatch-reports')}
              >
                Dispatch Reports
              </Link>

              <Link
  href="/credit-debit"
  onClick={()=>{
    setMobileMenuOpen(false)
  }}
  className={mobileLinkClass('/credit-debit')}
>
  Credit / Debit Entry
</Link>

<Link
  href="/credit-debit-reports"
  onClick={()=>{
    setMobileMenuOpen(false)
  }}
  className={mobileLinkClass('/credit-debit-reports')}
>
  Credit / Debit Reports
</Link>

<Link
  href="/recent-credit-debit"
  onClick={()=>{
    setMobileMenuOpen(false)
  }}
  className={mobileLinkClass('/recent-credit-debit')}
>
  Recent Credit / Debit
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
          bg-red-50
          text-red-700
          font-bold
        "
      >
        Logout
      </button>

    </div>

  )}

</header>

)}

{/* PAGE CONTENT */}

<main className="flex-1">

            {children}

          </main>

</div>

      </body>

    </html>
  )
}
