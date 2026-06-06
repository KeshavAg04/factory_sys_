'use client'

import { useEffect, useState } from 'react'
import { getUserRole } from '@/lib/getUserRole'

export default function TestRolePage() {

  const [role,setRole] =
    useState('loading')

  useEffect(()=>{

    async function load(){

      const userRole =
        await getUserRole()

      setRole(
        userRole || 'none'
      )

    }

    load()

  },[])

  return (

    <div className="p-10">

      <h1 className="text-4xl font-bold">

        Role: {role}

      </h1>

    </div>

  )

}