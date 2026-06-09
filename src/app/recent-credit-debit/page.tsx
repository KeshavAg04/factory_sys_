'use client'

import {
useEffect,
useMemo,
useState
} from 'react'

import {
supabase
} from '@/lib/supabase'

import toast from 'react-hot-toast'

import RoleGuard
from '@/components/RoleGuard'

export default function RecentCreditDebitPage(){

const [entries,setEntries] =
useState<any[]>([])

const [loading,setLoading] =
useState(true)

const [search,setSearch] =
useState('')

const [customerFilter,setCustomerFilter] =
useState('')

const [typeFilter,setTypeFilter] =
useState('')

const [fromDate,setFromDate] =
useState('')

const [toDate,setToDate] =
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
.from(
'sales_adjustments'
)
.select('*')
.order(
'adjustment_date',
{
ascending:false
}
)

if(!error){

setEntries(
data || []
)

}

setLoading(false)

}

const customers =

[
...new Set(

entries
.map(
e=>e.customer_name
)
.filter(Boolean)

)

]

const filteredEntries =
useMemo(()=>{

return entries.filter(entry=>{

const matchesCustomer =

!customerFilter ||

entry.customer_name ===
customerFilter

const matchesType =

!typeFilter ||

entry.adjustment_type ===
typeFilter

const matchesFromDate =

!fromDate ||

entry.adjustment_date >=
fromDate

const matchesToDate =

!toDate ||

entry.adjustment_date <=
toDate

const searchValue =
search.toLowerCase()

const matchesSearch =

!search ||

entry.note_number
?.toLowerCase()
.includes(searchValue)

||

entry.customer_name
?.toLowerCase()
.includes(searchValue)

||

entry.invoice_number
?.toLowerCase()
.includes(searchValue)

||

entry.reason
?.toLowerCase()
.includes(searchValue)

return (

matchesCustomer &&
matchesType &&
matchesFromDate &&
matchesToDate &&
matchesSearch

)

})

},[
entries,
customerFilter,
typeFilter,
fromDate,
toDate,
search
])

async function deleteEntry(
    id:string
    ){
    
    const typed =
    prompt(
    'Type DELETE to remove this entry'
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
    'sales_adjustments'
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
    'Entry deleted'
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
    'sales_adjustments'
    )
    .update(
    updateData
    )
    .eq(
    'id',
    editingId
    )
    
    if(error){
    
    toast.error(
    'Update failed'
    )
    
    return
    
    }
    
    toast.success(
    'Updated'
    )
    
    setEditingId(null)
    
    fetchEntries()
    
    }
    
    const totalCreditNotes =
    filteredEntries
    .filter(
    e=>
    e.adjustment_type ===
    'Credit Note'
    )
    .reduce(
    (sum,e)=>
    sum +
    Number(
    e.amount || 0
    ),
    0
    )
    
    const totalDebitNotes =
    filteredEntries
    .filter(
    e=>
    e.adjustment_type ===
    'Debit Note'
    )
    .reduce(
    (sum,e)=>
    sum +
    Number(
    e.amount || 0
    ),
    0
    )
    
    const netAdjustment =
    totalDebitNotes -
    totalCreditNotes
    
    if(loading){
    
    return (
    
    <div className='p-10'>
    Loading...
    </div>
    
    )
    
    }

    return (

        <RoleGuard
        allowedRoles={[
        'Admin',
        'accounts'
        ]}
        >
        
        <div className='p-4 md:p-6 space-y-6'>
        
        <div>
        
        <p className='text-slate-500'>
        Dispatch Management
        </p>
        
        <h1 className='text-4xl font-bold'>
        Recent Credit / Debit Notes
        </h1>
        
        </div>
        
        <div className='bg-white rounded-3xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3'>
        
        <input
        placeholder='Search'
        value={search}
        onChange={e=>
        setSearch(
        e.target.value
        )
        }
        className='border rounded-xl p-3'
        />
        
        <select
        value={customerFilter}
        onChange={e=>
        setCustomerFilter(
        e.target.value
        )
        }
        className='border rounded-xl p-3'
        >
        
        <option value=''>
        All Customers
        </option>
        
        {customers.map(
        customer=>(
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
        value={typeFilter}
        onChange={e=>
        setTypeFilter(
        e.target.value
        )
        }
        className='border rounded-xl p-3'
        >
        
        <option value=''>
        All Types
        </option>
        
        <option>
        Credit Note
        </option>
        
        <option>
        Debit Note
        </option>
        
        </select>
        
        <input
        type='date'
        value={fromDate}
        onChange={e=>
        setFromDate(
        e.target.value
        )
        }
        className='border rounded-xl p-3'
        />
        
        <input
        type='date'
        value={toDate}
        onChange={e=>
        setToDate(
        e.target.value
        )
        }
        className='border rounded-xl p-3'
        />
        
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        
        <div className='bg-white p-6 rounded-3xl'>
        
        <p>
        Credit Notes
        </p>
        
        <h1 className='text-3xl font-bold text-red-600'>
        ₹{totalCreditNotes.toLocaleString()}
        </h1>
        
        </div>
        
        <div className='bg-white p-6 rounded-3xl'>
        
        <p>
        Debit Notes
        </p>
        
        <h1 className='text-3xl font-bold text-green-600'>
        ₹{totalDebitNotes.toLocaleString()}
        </h1>
        
        </div>
        
        <div className='bg-white p-6 rounded-3xl'>
        
        <p>
        Net Adjustment
        </p>
        
        <h1 className='text-3xl font-bold'>
        ₹{netAdjustment.toLocaleString()}
        </h1>
        
        </div>
        
        </div>
        
        <div className='bg-white rounded-3xl overflow-x-auto'>
        
        <table className='min-w-[1400px] w-full text-sm'>
        
        <thead className='bg-slate-100'>
        
        <tr>
        
        <th className='p-4 text-left'>Note No</th>
        <th className='p-4 text-left'>Date</th>
        <th className='p-4 text-left'>Customer</th>
        <th className='p-4 text-left'>Invoice</th>
        <th className='p-4 text-left'>Type</th>
        <th className='p-4 text-left'>Amount</th>
        <th className='p-4 text-left'>Reason</th>
        <th className='p-4 text-left'>Remarks</th>
        <th className='p-4 text-left'>Actions</th>
        
        </tr>
        
        </thead>
        
        <tbody>
        
        {filteredEntries.map(
        entry=>(
        
        <tr
        key={entry.id}
        className='border-b'
        >
        
        <td className='p-4'>{entry.note_number}</td>
        <td className='p-4'>{entry.adjustment_date}</td>
        <td className='p-4'>{entry.customer_name}</td>
        <td className='p-4'>{entry.invoice_number}</td>
        <td className='p-4'>{entry.adjustment_type}</td>
        <td className='p-4'>₹{Number(entry.amount || 0).toLocaleString()}</td>
        <td className='p-4'>{entry.reason}</td>
        <td className='p-4'>{entry.remarks}</td>
        
        <td className='p-4 flex gap-2'>
        
        <button
        onClick={()=>
        startEdit(
        entry
        )
        }
        className='bg-slate-800 text-white px-3 py-2 rounded-xl'
        >
        Edit
        </button>
        
        <button
        onClick={()=>
        deleteEntry(
        entry.id
        )
        }
        className='bg-red-500 text-white px-3 py-2 rounded-xl'
        >
        Delete
        </button>
        
        </td>
        
        </tr>
        
        ))
        }
        
        </tbody>
        
        </table>
        
        </div>

        {editingId && (

<div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>

<div className='bg-white rounded-3xl p-6 w-full max-w-3xl'>

<h2 className='text-2xl font-bold mb-4'>
Edit Credit / Debit Note
</h2>

<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

<div>

<p className='text-sm text-slate-500 mb-1'>
Note Number
</p>

<input
value={editData.note_number || ''}
readOnly
className='border rounded-xl p-3 bg-slate-100 w-full'
/>

</div>

<div>

<p className='text-sm text-slate-500 mb-1'>
Date
</p>

<input
type='date'
value={editData.adjustment_date || ''}
onChange={e=>
setEditData({
...editData,
adjustment_date:
e.target.value
})
}
className='border rounded-xl p-3 w-full'
/>

</div>

<div>

<p className='text-sm text-slate-500 mb-1'>
Customer
</p>

<input
value={editData.customer_name || ''}
onChange={e=>
setEditData({
...editData,
customer_name:
e.target.value
})
}
className='border rounded-xl p-3 w-full'
/>

</div>

<div>

<p className='text-sm text-slate-500 mb-1'>
Invoice Number
</p>

<input
value={editData.invoice_number || ''}
onChange={e=>
setEditData({
...editData,
invoice_number:
e.target.value
})
}
className='border rounded-xl p-3 w-full'
/>

</div>

<div>

<p className='text-sm text-slate-500 mb-1'>
Type
</p>

<select
value={editData.adjustment_type || ''}
onChange={e=>
setEditData({
...editData,
adjustment_type:
e.target.value
})
}
className='border rounded-xl p-3 w-full'
>

<option>
Credit Note
</option>

<option>
Debit Note
</option>

</select>

</div>

<div>

<p className='text-sm text-slate-500 mb-1'>
Amount
</p>

<input
type='number'
value={editData.amount || ''}
onChange={e=>
setEditData({
...editData,
amount:
e.target.value
})
}
className='border rounded-xl p-3 w-full'
/>

</div>

<div className='md:col-span-2'>

<p className='text-sm text-slate-500 mb-1'>
Reason
</p>

<input
value={editData.reason || ''}
onChange={e=>
setEditData({
...editData,
reason:
e.target.value
})
}
className='border rounded-xl p-3 w-full'
/>

</div>

<div className='md:col-span-2'>

<p className='text-sm text-slate-500 mb-1'>
Remarks
</p>

<textarea
value={editData.remarks || ''}
onChange={e=>
setEditData({
...editData,
remarks:
e.target.value
})
}
rows={4}
className='border rounded-xl p-3 w-full'
/>

</div>

</div>

<div className='flex gap-3 mt-6'>

<button
onClick={saveEdit}
className='bg-slate-900 text-white px-5 py-3 rounded-xl'
>
Save
</button>

<button
onClick={()=>
setEditingId(null)
}
className='bg-slate-200 px-5 py-3 rounded-xl'
>
Cancel
</button>

</div>

</div>

</div>

)}
        
        </div>
        
        </RoleGuard>
        
        )
        
        }