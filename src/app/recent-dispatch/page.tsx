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

    const [customer,setCustomers]=useState<any[]>([])
    const [bagTypes,setBagTypes]=useState<any[]>([])
    const [bagNames,setBagNames]=useState<any[]>([])
    const [meshes,setMeshes]=useState<any[]>([])
    const [transporters,setTransporters]=useState<any[]>([])
    const [factories,setFactories]=useState<any[]>([])

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

  const [userFactory,setUserFactory] =
    useState('')

  useEffect(()=>{

    const factory =
      localStorage.getItem(
        'userFactory'
      ) || ''

    setUserFactory(factory)

    loadMasters(factory)

    fetchEntries(factory)

  },[])

  async function fetchEntries(
    factoryFilter = userFactory
  ){

    setLoading(true)

    let query =
      supabase
      .from('dispatch_entries')
      .select('*')
      .order(
        'created_at',
        {
          ascending:false
        }
      )

    if(factoryFilter){

      query =
        query.eq(
          'factory',
          factoryFilter
        )

    }

    const {data,error} =
      await query

    if(!error){

      setEntries(data||[])

    }

    setLoading(false)

  }

  async function loadMasters(
    factoryFilter = userFactory
  ){

    const [
      customerRes,
      factoryRes,
      bagTypeRes,
      bagNameRes,
      meshRes,
      transporterRes
    ] = await Promise.all([
      supabase
        .from('dispatch_entries')
        .select('customer_name'),
    
      supabase
        .from('factory_master')
        .select('factory_name'),
    
      supabase
        .from('bag_type_master')
        .select('bag_type'),
    
      supabase
        .from('bag_name_master')
        .select('bag_name'),
    
      supabase
        .from('mesh_master')
        .select('mesh_name')
        .order('mesh_name'),
    
      supabase
        .from('transporter_master')
        .select('transporter_name')
    ])
    
    setCustomers([
      ...new Map(
        (customerRes.data || [])
          .filter((x:any) => x.customer_name)
          .map((x:any) => [x.customer_name, x])
      ).values()
    ])
    setFactories(
      factoryFilter
      ? (factoryRes.data || [])
        .filter(
          (item:any)=>
            item.factory_name === factoryFilter
        )
      : factoryRes.data||[]
    )
    setBagTypes(bagTypeRes.data||[])
    setBagNames(bagNameRes.data||[])
    setMeshes(meshRes.data||[])
    setTransporters(transporterRes.data||[])
    
    }

  const customers =
    [...new Set(
      entries.map(
        e=>e.customer_name
      ).filter(Boolean)
    )]

  
  const filteredEntries =
    useMemo(()=>{

      return entries.filter(entry=>{

        const matchesCustomer =
          !customerFilter ||
          entry.customer_name ===
          customerFilter


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
          matchesFromDate &&
          matchesToDate &&
          matchesSearch

        )

      })

    },[
      entries,
      customerFilter,
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

    let query =
      supabase
      .from(
        'dispatch_entries'
      )
      .delete()
      .eq(
        'id',
        id
      )

    if(userFactory){

      query =
        query.eq(
          'factory',
          userFactory
        )

    }

    const {error} =
      await query

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

    if(
      userFactory &&
      entry.factory !== userFactory
    ){

      toast.error(
        'You can only edit dispatches for your assigned factory.'
      )

      return

    }

    setEditingId(
      entry.id
    )

    setEditData({
      ...entry
    })

  }

  useEffect(()=>{

    if(!editingId)
    return
    
    const qty =
    Number(
    editData.quantity || 0
    )
    
    const salesRate =
    Number(
    editData.sales_rate || 0
    )
    
    const freightPMT =
    Number(
    editData.freight_pmt || 0
    )
    
    setEditData(
    (prev:any)=>({
    
    ...prev,
    
    sales_amount:
    qty * salesRate,
    
    total_freight:
    qty * freightPMT
    
    })
    )
    
    },[
    editingId,
    editData.quantity,
    editData.sales_rate,
    editData.freight_pmt
    ])

  async function saveEdit(){

    if(
      userFactory &&
      editData.factory !== userFactory
    ){

      toast.error(
        'You can only save dispatches for your assigned factory.'
      )

      return

    }

    const {
      id,
      created_at,
      ...updateData
    } = editData
  
    let query =
      supabase
      .from(
        'dispatch_entries'
      )
      .update({

        ...updateData,
        
        sales_amount:
        Number(editData.quantity || 0) *
        Number(editData.sales_rate || 0),
        
        total_freight:
        Number(editData.quantity || 0) *
        Number(editData.freight_pmt || 0)
        
        })
      .eq(
        'id',
        editingId
      )

    if(userFactory){

      query =
        query.eq(
          'factory',
          userFactory
        )

    }

    const {error} =
      await query
  
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
allowDadiFactory
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
Sales Rate
</th>

<th className="p-4 text-left">
Sales Amount
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

                      <td className="p-4">
₹{Number(
entry.sales_rate || 0
).toLocaleString()}
</td>

<td className="p-4 font-semibold text-blue-700">
₹{Number(
entry.sales_amount || 0
).toLocaleString()}
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

              <div className="space-y-8">

{/* Dispatch Details */}

<div>

<h3 className="text-lg font-semibold mb-4">
Dispatch Details
</h3>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

<div>

<label className="text-sm text-slate-500">
Dispatch Date
</label>

<input
type="date"
value={editData.dispatch_date || ''}
onChange={e=>
setEditData({
...editData,
dispatch_date:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>

<div>

<label className="text-sm text-slate-500">
Invoice Number
</label>

<input
value={editData.invoice_number || ''}
onChange={e=>
setEditData({
...editData,
invoice_number:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>

<div>

<label className="text-sm text-slate-500">
Customer
</label>

<select
  value={editData.customer_name || ''}
  onChange={(e)=>
    setEditData({
      ...editData,
      customer_name: e.target.value
    })
  }
  className="border rounded-xl p-3 w-full"
>
  {customer.map((c:any)=>(
    <option
      key={c.customer_name}
      value={c.customer_name}
    >
      {c.customer_name}
    </option>
  ))}
</select>

</div>

<div>

<label className="text-sm text-slate-500">
Factory
</label>

<select
value={editData.factory || ''}
onChange={e=>
setEditData({
...editData,
factory:e.target.value
})
}
disabled={userFactory !== ''}
className="border rounded-xl p-3 w-full"
>

{factories.map((f:any)=>

<option
key={f.factory_name}
value={f.factory_name}
>

{f.factory_name}

</option>

)}

</select>

</div>

</div>

</div>

{/* Product Details */}

<div>

<h3 className="text-lg font-semibold mb-4">
Product Details
</h3>

<div className="grid grid-cols-1 md:grid-cols-5 gap-4">

<div>

<label className="text-sm text-slate-500">
Bag Type
</label>

<select
value={editData.bag_type || ''}
onChange={e=>
setEditData({
...editData,
bag_type:e.target.value
})
}
className="border rounded-xl p-3 w-full"
>

{bagTypes.map((b:any)=>

<option
key={b.bag_type}
value={b.bag_type}
>

{b.bag_type}

</option>

)}

</select>

</div>

<div>

<label className="text-sm text-slate-500">
Bag Name
</label>

<select
value={editData.bag_name || ''}
onChange={e=>
setEditData({
...editData,
bag_name:e.target.value
})
}
className="border rounded-xl p-3 w-full"
>

{bagNames.map((b:any)=>

<option
key={b.bag_name}
value={b.bag_name}
>

{b.bag_name}

</option>

)}

</select>

</div>

<div>

<label className="text-sm text-slate-500">
Mesh
</label>

<select
value={editData.mesh || ''}
onChange={e=>
setEditData({
...editData,
mesh:e.target.value
})
}
className="border rounded-xl p-3 w-full"
>

<option value="">
Select Mesh
</option>

{meshes.map((m:any)=>

<option
key={m.mesh_name}
value={m.mesh_name}
>

{m.mesh_name}

</option>

)}

</select>

</div>

<div>

<label className="text-sm text-slate-500">
Quantity
</label>

<input
type="number"
value={editData.quantity || ''}
onChange={e=>
setEditData({
...editData,
quantity:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>

<div>

<label className="text-sm text-slate-500">
Dispatch Bags
</label>

<input
type="number"
value={editData.dispatch_bags || ''}
onChange={e=>
setEditData({
...editData,
dispatch_bags:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>

</div>

</div>

<div>

<h3 className="text-lg font-semibold mb-4">
Sales Details
</h3>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<div>

<label className="text-sm text-slate-500">
Sales Rate
</label>

<input
type="number"
value={editData.sales_rate || ''}
onChange={e=>
setEditData({
...editData,
sales_rate:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>

<div>

<label className="text-sm text-slate-500">
Sales Amount
</label>

<input
readOnly
value={editData.sales_amount || ''}
className="border rounded-xl p-3 w-full bg-slate-100"
/>

</div>

</div>

</div>

<div>

<h3 className="text-lg font-semibold mb-4">
Transport Details
</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div>

<label className="text-sm text-slate-500">
Transporter
</label>

<select
value={editData.transporter_name || ''}
onChange={e=>
setEditData({
...editData,
transporter_name:e.target.value
})
}
className="border rounded-xl p-3 w-full"
>

{transporters.map((t:any)=>

<option
key={t.transporter_name}
value={t.transporter_name}
>

{t.transporter_name}

</option>

)}

</select>

</div>

<div>

<label>Vehicle Number</label>

<input
value={editData.vehicle_no || ''}
onChange={e=>
setEditData({
...editData,
vehicle_no:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>

<div>

<label>LR Number</label>

<input
value={editData.lr_number || ''}
onChange={e=>
setEditData({
...editData,
lr_number:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>
</div>
</div>

<div>

<h3 className="text-lg font-semibold mb-4">
Freight Details
</h3>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div>

<label>Freight Type</label>

<select
value={editData.freight_type || ''}
onChange={e=>
setEditData({
...editData,
freight_type:e.target.value
})
}
className="border rounded-xl p-3 w-full"
>

<option value="Advance">
Advance
</option>

<option value="To Be Paid">
To Be Paid
</option>

</select>

</div>
<div>

<label>LR Freight</label>

<input
type="number"
value={editData.lr_freight || ''}
onChange={e=>
setEditData({
...editData,
lr_freight:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>
<div>

<label>Freight PMT</label>

<input
type="number"
value={editData.freight_pmt || ''}
onChange={e=>
setEditData({
...editData,
freight_pmt:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>
<div>

<label>Total Freight</label>

<input
readOnly
value={editData.total_freight || ''}
className="border rounded-xl p-3 w-full bg-slate-100"
/>

</div>

</div>

</div>
<div>

<h3 className="text-lg font-semibold mb-4">
Loading & Payment
</h3>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div>

<label>Loading Amount</label>

<input
type="number"
value={editData.loading_amount || ''}
onChange={e=>
setEditData({
...editData,
loading_amount:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>
<div>

<label className="block mb-2">
Loading Pending
</label>

<input
type="checkbox"
checked={editData.loading_pending || false}
onChange={e=>
setEditData({
...editData,
loading_pending:e.target.checked
})
}
/>

</div>
<div>

<label>Vasuli</label>

<input
type="number"
value={editData.vasuli || ''}
onChange={e=>
setEditData({
...editData,
vasuli:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>
<div>

<label>Remarks</label>

<input
value={editData.remarks || ''}
onChange={e=>
setEditData({
...editData,
remarks:e.target.value
})
}
className="border rounded-xl p-3 w-full"
/>

</div>

</div>

</div>

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
