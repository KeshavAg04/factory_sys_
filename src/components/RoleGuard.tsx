'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { getUserRole } from '@/lib/getUserRole'

import { supabase }
from '@/lib/supabase'
import { isDadiFactory } from '@/lib/permissions'

type Props = {
  allowedRoles: string[]
  allowDadiFactory?: boolean
  children: React.ReactNode
}

export default function RoleGuard({
  allowedRoles,
  allowDadiFactory = false,
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

let factory =
localStorage.getItem(
'userFactory'
) || ''

if(
allowDadiFactory &&
role === 'production' &&
!factory
){

const {
data:{user}
} =
await supabase.auth.getUser()

if(user){

const {data} =
await supabase
.from('profiles')
.select('factory')
.eq('id',user.id)
.single()

factory =
data?.factory || ''

localStorage.setItem(
'userFactory',
factory
)

}

}

const canUseDadiFactoryAccess =
allowDadiFactory &&
role === 'production' &&
isDadiFactory(factory)

if (
role &&
(
allowedRoles.includes(role) ||
canUseDadiFactoryAccess
)
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
