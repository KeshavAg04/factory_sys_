'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { getUserRole } from '@/lib/getUserRole'

import { supabase }
from '@/lib/supabase'

type Props = {
  allowedRoles: string[]
  children: React.ReactNode
}

export default function RoleGuard({
  allowedRoles,
  children,
}: Props) {

  const router =
    useRouter()

  const [loading, setLoading] =
    useState(true)

  const [allowed, setAllowed] =
    useState(false)

  useEffect(() => {

    checkAccess()

  }, [])

  async function checkAccess() {

    const role =
await getUserRole()

if(!role){

  router.push('/login')
  
  setLoading(false)
  
  return
  
  }

const isMobile =

/Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i
.test(
navigator.userAgent
)

if(
  role === 'accounts' &&
  isMobile
  ){
  
  await supabase.auth.signOut()
  
  setLoading(false)
  
  alert(
  'Accounts users can access the ERP only from desktop devices.'
  )
  
  router.push('/login')
  
  return
  
  }

if (
role &&
allowedRoles.includes(role)
) {

setAllowed(true)

} else {

router.push('/')

}

    setLoading(false)

  }

  if (loading) {

    return (
      <div className="p-10">
        Loading...
      </div>
    )

  }

  if (!allowed) {

    return null

  }

  return <>{children}</>

}