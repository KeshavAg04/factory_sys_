'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { supabase } from '@/lib/supabase'

export default function FactoryTransferPage() {

  const [loading,setLoading] =
    useState(false)

  const [factories,setFactories] =
    useState<string[]>([])

  const [bagNames,setBagNames] =
    useState<string[]>([])

  const [transfers,setTransfers] =
    useState<any[]>([])

  const [transferDate,setTransferDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    )

  const [fromFactory,setFromFactory] =
    useState('')

  const [toFactory,setToFactory] =
    useState('')

  const [bagName,setBagName] =
    useState('')

  const [quantity,setQuantity] =
    useState('')

  const [remarks,setRemarks] =
    useState('')

  useEffect(()=>{

    loadFactories()
    loadBagNames()
    loadTransfers()

  },[])

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
        item => item.factory_name
      ) || []
    )
  
  }

  async function loadBagNames(){

    const {data} =
      await supabase
      .from('bag_name_master')
      .select('bag_name')
      .order(
        'bag_name',
        {
          ascending:true
        }
      )

    setBagNames(
      data?.map(
        b=>b.bag_name
      ) || []
    )

  }

  async function loadTransfers(){

    const {data} =
      await supabase
      .from('factory_transfers')
      .select('*')
      .order(
        'transfer_date',
        {
          ascending:false
        }
      )

    setTransfers(
      data || []
    )

  }

  async function saveTransfer(){

    if(
      fromFactory ===
      toFactory
    ){

      toast.error(
        'From and To factory cannot be same'
      )

      return

    }

    if(
      !bagName
    ){

      toast.error(
        'Select bag name'
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

    const {error} =
      await supabase
      .from(
        'factory_transfers'
      )
      .insert([
        {
          transfer_date:
            transferDate,

          from_factory:
            fromFactory,

          to_factory:
            toFactory,

          bag_name:
            bagName,

          quantity:
            Number(quantity),

          remarks
        }
      ])

    setLoading(false)

    if(error){

      toast.error(
        'Transfer save failed'
      )

      return

    }

    toast.success(
      'Transfer saved'
    )

    setFromFactory('')
    setToFactory('')
    setBagName('')
    setQuantity('')
    setRemarks('')

    loadTransfers()

  }

  async function deleteTransfer(
    id:string
  ){

    const confirmDelete =
      confirm(
        'Delete transfer?'
      )

    if(
      !confirmDelete
    ) return

    await supabase
      .from(
        'factory_transfers'
      )
      .delete()
      .eq(
        'id',
        id
      )

    toast.success(
      'Transfer deleted'
    )

    loadTransfers()

  }

  return (

    <main className="min-h-screen bg-slate-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        <div className="mb-6">

          <p className="text-slate-500 text-sm">
            Inventory Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Factory Transfer
          </h1>

        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
              type="date"
              value={transferDate}
              onChange={(e)=>
                setTransferDate(
                  e.target.value
                )
              }
              className="border p-3 rounded-2xl"
            />

            <select
              value={fromFactory}
              onChange={(e)=>
                setFromFactory(
                  e.target.value
                )
              }
              className="border p-3 rounded-2xl"
            >
              <option value="">
                From Factory
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

            <select
              value={toFactory}
              onChange={(e)=>
                setToFactory(
                  e.target.value
                )
              }
              className="border p-3 rounded-2xl"
            >
              <option value="">
                To Factory
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

            <select
              value={bagName}
              onChange={(e)=>
                setBagName(
                  e.target.value
                )
              }
              className="border p-3 rounded-2xl"
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

            <input
              type="number"
              value={quantity}
              onChange={(e)=>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="Quantity"
              className="border p-3 rounded-2xl"
            />

            <input
              type="text"
              value={remarks}
              onChange={(e)=>
                setRemarks(
                  e.target.value
                )
              }
              placeholder="Remarks"
              className="border p-3 rounded-2xl"
            />

          </div>

          <button
            onClick={saveTransfer}
            disabled={loading}
            className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-2xl"
          >
            {
              loading
              ? 'Saving...'
              : 'Save Transfer'
            }
          </button>

        </div>

        <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">From</th>
                <th className="p-4 text-left">To</th>
                <th className="p-4 text-left">Bag</th>
                <th className="p-4 text-left">Qty</th>
                <th className="p-4 text-left">Remarks</th>
                <th className="p-4 text-left">Action</th>

              </tr>

            </thead>

            <tbody>

              {transfers.map(
                transfer=>(
                  <tr
                    key={transfer.id}
                    className="border-t"
                  >

                    <td className="p-4">
                      {transfer.transfer_date}
                    </td>

                    <td className="p-4">
                      {transfer.from_factory}
                    </td>

                    <td className="p-4">
                      {transfer.to_factory}
                    </td>

                    <td className="p-4">
                      {transfer.bag_name}
                    </td>

                    <td className="p-4">
                      {transfer.quantity}
                    </td>

                    <td className="p-4">
                      {transfer.remarks}
                    </td>

                    <td className="p-4">

                      <button
                        onClick={()=>
                          deleteTransfer(
                            transfer.id
                          )
                        }
                        className="bg-red-500 text-white px-3 py-2 rounded-xl"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </main>

  )

}