'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import RoleGuard from '@/components/RoleGuard'


export default function RecentDispatchPage() {

  const [entries,setEntries] =
    useState<any[]>([])

  const [loading,setLoading] =
    useState(true)

  const [visibleCount,setVisibleCount] =
    useState(25)

  const [customerFilter,setCustomerFilter] =
    useState('')

  const [vehicleFilter,setVehicleFilter] =
    useState('')

  const [fromDate,setFromDate] =
    useState('')

  const [toDate,setToDate] =
    useState('')

  const [search,setSearch] =
    useState('')

  const [editingId,setEditingId] =
    useState<string | null>(null)

  const [editData,setEditData] =
    useState<any>({})

  useEffect(()=>{

    fetchEntries()

  },[])

  async function fetchEntries(){

    setLoading(true)

    const {data,error} =
      await supabase
      .from('dispatch_entries')
      .select('*')
      .order(
        'created_at',
        {
          ascending:false
        }
      )

    if(!error){

      setEntries(data||[])

    }

    setLoading(false)

  }

  const customers =
    [...new Set(
      entries.map(
        e=>e.customer_name
      ).filter(Boolean)
    )]

  const vehicles =
    [...new Set(
      entries.map(
        e=>e.vehicle_no
      ).filter(Boolean)
    )]

  const filteredEntries =
    useMemo(()=>{

      return entries.filter(entry=>{

        const matchesCustomer =
          !customerFilter ||
          entry.customer_name ===
          customerFilter

        const matchesVehicle =
          !vehicleFilter ||
          entry.vehicle_no ===
          vehicleFilter

        const matchesFromDate =
          !fromDate ||
          entry.dispatch_date >=
          fromDate

        const matchesToDate =
          !toDate ||
          entry.dispatch_date <=
          toDate

          const searchValue =
          search.toLowerCase()
          
          const matchesSearch =
          
          !search ||
          
          entry.customer_name
          ?.toLowerCase()
          .includes(searchValue)
          
          ||
          
          entry.invoice_number
          ?.toLowerCase()
          .includes(searchValue)
          
          ||
          
          entry.bag_name
          ?.toLowerCase()
          .includes(searchValue)
          
          ||
          
          entry.vehicle_no
          ?.toLowerCase()
          .includes(searchValue)
          
          ||
          
          entry.dispatch_bags
?.toString()
.includes(searchValue)

||

          entry.lr_number
          ?.toLowerCase()
          .includes(searchValue)
          
          ||
          
          entry.transporter_name
          ?.toLowerCase()
          .includes(searchValue)

        return (

          matchesCustomer &&
          matchesVehicle &&
          matchesFromDate &&
          matchesToDate &&
          matchesSearch

        )

      })

    },[
      entries,
      customerFilter,
      vehicleFilter,
      fromDate,
      toDate,
      search
    ])

  async function deleteEntry(
    id:string
  ){

    const typed =
      prompt(
        'Type DELETE to remove this dispatch entry'
      )

    if(
      typed !== 'DELETE'
    ){

      toast.error(
        'Delete cancelled'
      )

      return

    }

    const {error} =
      await supabase
      .from(
        'dispatch_entries'
      )
      .delete()
      .eq(
        'id',
        id
      )

    if(error){

      toast.error(
        'Delete failed'
      )

      return

    }

    toast.success(
      'Dispatch deleted'
    )

    fetchEntries()

  }

  function startEdit(
    entry:any
  ){

    setEditingId(
      entry.id
    )

    setEditData({
      ...entry
    })

  }

  async function saveEdit(){

    const {
      id,
      created_at,
      ...updateData
    } = editData
  
    const {error} =
      await supabase
      .from(
        'dispatch_entries'
      )
      .update(
        updateData
      )
      .eq(
        'id',
        editingId
      )
  
    if(error){
  
      console.log(error)
  
      toast.error(
        'Update failed'
      )
  
      return
  
    }
  
    toast.success(
      'Dispatch updated'
    )
  
    setEditingId(null)
  
    fetchEntries()
  
  }

  if(loading){

    return (

      <main className="min-h-screen flex items-center justify-center text-slate-500 text-lg">

        Loading dispatch entries...

      </main>

    )

  }
  return (
    <RoleGuard
allowedRoles={[
'Admin',
'accounts'
]}
>

    <main className="min-h-screen bg-slate-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">

          <p className="text-slate-500 text-sm">
            Dispatch Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Recent Dispatch Entries
          </h1>

        </div>

        {/* FILTERS */}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            <select
              value={customerFilter}
              onChange={(e)=>
                setCustomerFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            >

              <option value="">
                All Customers
              </option>

              {customers.map(
                (customer)=>(
                  <option
                    key={customer}
                    value={customer}
                  >
                    {customer}
                  </option>
                )
              )}

            </select>

            <select
              value={vehicleFilter}
              onChange={(e)=>
                setVehicleFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            >

              <option value="">
                All Vehicles
              </option>

              {vehicles.map(
                (vehicle)=>(
                  <option
                    key={vehicle}
                    value={vehicle}
                  >
                    {vehicle}
                  </option>
                )
              )}

            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e)=>
                setFromDate(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e)=>
                setToDate(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            />

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e)=>
                setSearch(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
            />

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-slate-200">

          <table className="w-full text-sm min-w-[2400px]">

            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">

              <tr>

                <th className="p-4 text-left">
                  Date
                </th>

                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-left">
Invoice No
</th>

                <th className="p-4 text-left">
                  Factory
                </th>

                <th className="p-4 text-left">
                  Bag Type
                </th>

                <th className="p-4 text-left">
                  Bag Name
                </th>

                <th className="p-4 text-left">
                  Mesh
                </th>

                <th className="p-4 text-left">
                  Quantity
                </th>

                <th className="p-4 text-left">
  Dispatch Bags
</th>

                <th className="p-4 text-left">
                  Vehicle No
                </th>

                <th className="p-4 text-left">
Transporter
</th>

<th className="p-4 text-left">
LR No
</th>

<th className="p-4 text-left">
LR Freight
</th>

<th className="p-4 text-left">
Freight Type
</th>

<th className="p-4 text-left">
Freight PMT
</th>

<th className="p-4 text-left">
Total Freight
</th>

<th className="p-4 text-left">
Loading Amount
</th>

<th className="p-4 text-left">
Loading Status
</th>

<th className="p-4 text-left">
Vasuli
</th>

                <th className="p-4 text-left">
                  Remarks
                </th>

                <th className="p-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredEntries
                .slice(
                  0,
                  visibleCount
                )
                .map(
                  (entry)=>(
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100"
                    >

                      <td className="p-4">
                        {entry.dispatch_date}
                      </td>

                      <td className="p-4">
                        {entry.customer_name}
                      </td>

                      <td className="p-4">
{entry.invoice_number}
</td>

                      <td className="p-4">
                        {entry.factory}
                      </td>

                      <td className="p-4">
                        {entry.bag_type}
                      </td>

                      <td className="p-4">
                        {entry.bag_name}
                      </td>

                      <td className="p-4">
                        {entry.mesh}
                      </td>

                      <td className="p-4">
                        {Number(entry.quantity || 0).toFixed(2)}
                      </td>

                      <td className="p-4 font-semibold">
  {entry.dispatch_bags}
</td>

                      <td className="p-4">
                        {entry.vehicle_no}
                      </td>

                      <td className="p-4">
{entry.transporter_name}
</td>

<td className="p-4">
{entry.lr_number}
</td>

<td className="p-4">
₹{Number(entry.lr_freight || 0).toFixed(2)}
</td>

<td className="p-4">
{entry.freight_type}
</td>

<td className="p-4">
₹{Number(entry.freight_pmt || 0).toFixed(2)}
</td>

<td className="p-4 font-semibold">
₹{Number(entry.total_freight || 0).toFixed(2)}
</td>

<td className="p-4">
₹{Number(entry.loading_amount || 0).toFixed(2)}
</td>

<td className="p-4">
{
entry.loading_pending
? 'Pending'
: 'Cleared'
}
</td>

<td className="p-4 font-semibold text-green-700">
₹{Number(entry.vasuli || 0).toFixed(2)}
</td>

                      <td className="p-4">
                        {entry.remarks}
                      </td>

                      <td className="p-4 flex gap-2">

                        <button
                          onClick={()=>
                            startEdit(
                              entry
                            )
                          }
                          className="bg-slate-800 text-white px-3 py-2 rounded-xl"
                        >
                          Edit
                        </button>

                        <button
                          onClick={()=>
                            deleteEntry(
                              entry.id
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

        {/* LOAD MORE */}

        <div className="flex justify-center mt-6">

          {visibleCount <
            filteredEntries.length && (

            <button
              onClick={()=>
                setVisibleCount(
                  visibleCount + 25
                )
              }
              className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm"
            >
              Load More
            </button>

          )}

        </div>

        {/* EDIT MODAL */}

        {editingId && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

<div className="bg-white rounded-3xl p-5 w-full max-w-5xl max-h-[85vh] overflow-y-auto">

              <h2 className="text-2xl font-bold mb-4">
                Edit Dispatch Entry
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {Object.keys(
                  editData
                ).map((key)=>{

                  if(
                    key==='id' ||
                    key==='created_at' ||
                    key==='vasuli' ||
                    key==='total_freight'
                  ) return null

                  return (

                    <input
                      key={key}
                      value={
                        editData[key] ?? ''
                      }
                      onChange={(e)=>
                        setEditData({
                          ...editData,
                          [key]:
                            e.target.value
                        })
                      }
                      placeholder={key}
                      className="border border-slate-200 p-3 rounded-2xl"
                    />

                  )

                })}

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={saveEdit}
                  className="bg-slate-800 text-white px-5 py-3 rounded-2xl"
                >
                  Save
                </button>

                <button
                  onClick={()=>
                    setEditingId(null)
                  }
                  className="bg-slate-200 px-5 py-3 rounded-2xl"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>
    </RoleGuard>

  )

}