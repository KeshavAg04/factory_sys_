'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import { usernameToEmail } from '@/lib/auth'

export default function LoginPage() {

  const router = useRouter()

  const [username, setUsername] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const handleLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault()

    setLoading(true)

    const email =
      usernameToEmail(username)

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 w-full max-w-md text-black">

        <div className="mb-8">

          <div className="erp-brand-mark mb-5">
            KM
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">
            Manufacturing ERP
          </p>

          <h1 className="text-3xl font-bold text-slate-950">
            Sign in
          </h1>

          <p className="text-slate-500 mt-2">
            Factory Production System
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Username
            </span>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full border p-4 rounded-2xl"
            required
          />

          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Password
            </span>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border p-4 rounded-2xl"
            required
          />

          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-semibold"
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>

        </form>

      </div>

    </main>
  )
}
