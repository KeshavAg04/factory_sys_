'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { supabase } from '@/lib/supabase'

export default function EmptyBagInwardPage() {

  const [loading,setLoading] =
    useState(false)

  const [bagNames,setBagNames] =
    useState<string[]>([])

  const [factories,setFactories] =
    useState<string[]>([])

  const [inwardDate,setInwardDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    )

  const [factory,setFactory] =
    useState('')

  const [bagName,setBagName] =
    useState('')

  const [quantity,setQuantity] =
    useState('')

  const [remarks,setRemarks] =
    useState('')

  useEffect(()=>{

    loadBagNames()
    loadFactories()

  },[])

  async function loadBagNames(){

    const { data,error } =
    await supabase
    .from('bag_name_master')
    .select('bag_name')
    .order(
      'bag_name',
      {
        ascending:true
      }
    )

    if(error){

      console.log(error)
      return

    }

    const names =
      [
        ...new Set(
          (data || [])
            .map(
              item =>
              item.bag_name
            )
            .filter(Boolean)
        )
      ]

    setBagNames(names)

  }

  async function loadFactories(){

    const {data,error} =
      await supabase
        .from('factory_master')
        .select('factory_name')
        .order(
          'factory_name',
          {
            ascending:true
          }
        )

    if(error){

      console.log(error)
      return

    }

    setFactories(
      data?.map(
        item =>
        item.factory_name
      ) || []
    )

  }

  async function saveEntry(){

    if(!factory){

      toast.error(
        'Select Factory'
      )

      return

    }

    if(!bagName){

      toast.error(
        'Select Bag Name'
      )

      return

    }

    if(
      !quantity ||
      Number(quantity) <= 0
    ){

      toast.error(
        'Enter valid quantity'
      )

      return

    }

    setLoading(true)

    const { error } =
      await supabase
        .from('empty_bag_inward')
        .insert([
          {
            inward_date:
              inwardDate,

            factory:
              factory,

            bag_name:
              bagName,

            quantity:
              Number(quantity),

            remarks:
              remarks
          }
        ])

    setLoading(false)

    if(error){

      toast.error(
        'Failed to save entry'
      )

      return

    }

    toast.success(
      'Inward entry saved'
    )

    setFactory('')
    setBagName('')
    setQuantity('')
    setRemarks('')

  }

  return (

    <main className="min-h-screen bg-slate-100 p-4 md:p-6">

      <div className="max-w-3xl mx-auto">

        <div className="mb-6">

          <p className="text-slate-500 text-sm">
            Inventory Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Empty Bag Inward
          </h1>

        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>

<label className="block text-sm font-medium mb-2">
  Inward Date
</label>

<input
  type="date"
  value={inwardDate}
  onChange={(e)=>
    setInwardDate(
      e.target.value
    )
  }
  className="w-full border border-slate-200 p-3 rounded-2xl"
/>

</div>

<div>

<label className="block text-sm font-medium mb-2">
  Factory
</label>

<select
  value={factory}
  onChange={(e)=>
    setFactory(
      e.target.value
    )
  }
  className="w-full border border-slate-200 p-3 rounded-2xl"
>

  <option value="">
    Select Factory
  </option>

  {factories.map(
    factory=>(
      <option
        key={factory}
        value={factory}
      >
        {factory}
      </option>
    )
  )}

</select>

</div>

<div>

<label className="block text-sm font-medium mb-2">
  Bag Name
</label>

<select
  value={bagName}
  onChange={(e)=>
    setBagName(
      e.target.value
    )
  }
  className="w-full border border-slate-200 p-3 rounded-2xl"
>

  <option value="">
    Select Bag
  </option>

  {bagNames.map(
  (bag)=>(
    <option
      key={bag}
      value={bag}
    >
      {bag}
    </option>
  )
)}

</select>

</div>

<div>

<label className="block text-sm font-medium mb-2">
  Quantity
</label>

<input
  type="number"
  step="0.01"
  value={quantity}
  onChange={(e)=>
    setQuantity(
      e.target.value
    )
  }
  className="w-full border border-slate-200 p-3 rounded-2xl"
  placeholder="Enter Quantity"
/>

</div>

<div className="md:col-span-2">

<label className="block text-sm font-medium mb-2">
  Remarks
</label>

<input
  type="text"
  value={remarks}
  onChange={(e)=>
    setRemarks(
      e.target.value
    )
  }
  className="w-full border border-slate-200 p-3 rounded-2xl"
  placeholder="Remarks"
/>

</div>

</div>

<button
onClick={saveEntry}
disabled={loading}
className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition"
>
{
loading
? 'Saving...'
: 'Save Inward Entry'
}
</button>

</div>

</div>

</main>

)

}