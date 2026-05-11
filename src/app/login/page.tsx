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
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-black">

        <h1 className="text-3xl font-bold mb-2">
          Login
        </h1>

        <p className="text-gray-500 mb-6">
          Factory Production System
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full border p-4 rounded-xl"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border p-4 rounded-xl"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-4 rounded-xl font-semibold"
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