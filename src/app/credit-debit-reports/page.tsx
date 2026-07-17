'use client'

import {
useEffect,
useMemo,
useState
} from 'react'

import * as XLSX from 'xlsx'

import {
supabase
} from '@/lib/supabase'

import RoleGuard
from '@/components/RoleGuard'

export default function CreditDebitReportsPage(){

const [entries,setEntries] =
useState<any[]>([])

const [search,setSearch] =
useState('')

const [customer,setCustomer] =
useState('')

const [type,setType] =
useState('')

const [fromDate,setFromDate] =
useState('')

const [toDate,setToDate] =
useState('')

const [period,setPeriod] =
useState('month')

const [userFactory,setUserFactory] =
useState('')

useEffect(()=>{

const factory =
localStorage.getItem(
'userFactory'
) || ''

setUserFactory(
factory
)

loadEntries(
factory
)

},[])

async function loadEntries(
factoryFilter = userFactory
){

let allowedInvoices:string[] = []

if(factoryFilter){

const {data:dispatchData} =
await supabase
.from(
'dispatch_entries'
)
.select(
'invoice_number'
)
.eq(
'factory',
factoryFilter
)

allowedInvoices =
[
...new Set(
(dispatchData || [])
.map(
(entry:any)=>
entry.invoice_number
)
.filter(Boolean)
)
] as string[]

}

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

if(error){

console.log(error)

return

}

setEntries(
factoryFilter
? (data || [])
.filter(
(entry:any)=>
allowedInvoices.includes(
entry.invoice_number
)
)
: data || []
)

}

const values =
(key:string)=>

[
...new Set(
entries
.map(
e=>e[key]
)
.filter(Boolean)
)
]

const filtered =
useMemo(
()=>entries.filter(e=>{

const entryDate =
new Date(
e.adjustment_date
)

const now =
new Date()

if(period==='month'){

 if(
 entryDate.getMonth()!==now.getMonth() ||
 entryDate.getFullYear()!==now.getFullYear()
 ){
  return false
 }

}

if(period==='lastMonth'){

 const lastMonth =
 new Date()

 lastMonth.setMonth(
 now.getMonth()-1
 )

 if(
 entryDate.getMonth()!==lastMonth.getMonth() ||
 entryDate.getFullYear()!==lastMonth.getFullYear()
 ){
  return false
 }

}

if(
search &&
!JSON.stringify(e)
.toLowerCase()
.includes(
search.toLowerCase()
)
)
return false

if(
customer &&
e.customer_name !== customer
)
return false

if(
type &&
e.adjustment_type !== type
)
return false

if(period==='custom'){

if(
fromDate &&
e.adjustment_date < fromDate
)
return false

if(
toDate &&
e.adjustment_date > toDate
)
return false

}

return true

}),
[
entries,
search,
customer,
type,
fromDate,
toDate,
period
]
)

const totalCreditNotes =
filtered
.filter(
e =>
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
filtered
.filter(
e =>
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

const totalEntries =
filtered.length

function exportExcel(
    data:any[],
    name:string
    ){
    
    const ws =
    XLSX.utils.json_to_sheet(
    data
    )
    
    const wb =
    XLSX.utils.book_new()
    
    XLSX.utils.book_append_sheet(
    wb,
    ws,
    'Credit Debit Report'
    )
    
    let fileName =
    name
    
    if(customer){
    
    fileName +=
    `-${customer}`
    
    }
    
    if(type){
    
    fileName +=
    `-${type}`
    
    }
    
    if(fromDate){
    
    fileName +=
    `-${fromDate}`
    
    }
    
    if(toDate){
    
    fileName +=
    `-to-${toDate}`
    
    }
    
    fileName =
    fileName.replaceAll(
    ' ',
    '-'
    )
    
    XLSX.writeFile(
    wb,
    `${fileName}.xlsx`
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
    
    <div className='p-4 md:p-6 space-y-6'>
    
    <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
    
    <div>
    
    <p className='text-slate-500'>
    Dispatch Management
    </p>
    
    <h1 className='text-4xl font-bold'>
    Credit / Debit Reports
    </h1>
    
    </div>

    <div className='flex gap-3'>

    <button
    onClick={()=>
    setPeriod('month')
    }
    className={`px-5 py-3 rounded-xl transition ${
    period==='month'
    ?'bg-blue-600 text-white'
    :'bg-white border'
    }`}
    >
    This Month
    </button>

    <button
    onClick={()=>
    setPeriod('lastMonth')
    }
    className={`px-5 py-3 rounded-xl transition ${
    period==='lastMonth'
    ?'bg-blue-600 text-white'
    :'bg-white border'
    }`}
    >
    Last Month
    </button>

    <button
    onClick={()=>
    setPeriod('custom')
    }
    className={`px-5 py-3 rounded-xl transition ${
    period==='custom'
    ?'bg-blue-600 text-white'
    :'bg-white border'
    }`}
    >
    Custom Range
    </button>

    </div>
    
    </div>
    
    <div className='bg-white rounded-3xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-3'>
    
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
    value={customer}
    onChange={e=>
    setCustomer(
    e.target.value
    )
    }
    className='border rounded-xl p-3'
    >
    
    <option value=''>
    All Customers
    </option>
    
    {values(
    'customer_name'
    ).map(
    (v:any)=>(
    <option
    key={v}
    >
    {v}
    </option>
    )
    )}
    
    </select>
    
    <select
    value={type}
    onChange={e=>
    setType(
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
    
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
    
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
    
    <div className='bg-white p-6 rounded-3xl'>
    
    <p>
    Total Entries
    </p>
    
    <h1 className='text-3xl font-bold'>
    {totalEntries}
    </h1>
    
    </div>
    
    </div>
    
    <div className='flex justify-end'>
    
    <button
    onClick={()=>
    exportExcel(
    filtered,
    'credit-debit-report'
    )
    }
    className='bg-slate-900 text-white px-5 py-3 rounded-xl'
    >
    Export Excel
    </button>
    
    </div>

    <div className='bg-white rounded-3xl overflow-x-auto'>

<table className='min-w-[1200px] w-full text-sm'>

<thead className='bg-slate-100'>

<tr className='text-left'>

<th className='p-4'>
Note No
</th>

<th className='p-4'>
Date
</th>

<th className='p-4'>
Customer
</th>

<th className='p-4'>
Invoice No
</th>

<th className='p-4'>
Type
</th>

<th className='p-4'>
Amount
</th>

<th className='p-4'>
Reason
</th>

<th className='p-4'>
Remarks
</th>

</tr>

</thead>

<tbody>

{filtered.map(
(e:any)=>(

<tr
key={e.id}
className='border-b'
>

<td className='p-4 font-semibold'>
{e.note_number}
</td>

<td className='p-4'>
{e.adjustment_date}
</td>

<td className='p-4'>
{e.customer_name}
</td>

<td className='p-4'>
{e.invoice_number}
</td>

<td className='p-4'>
{e.adjustment_type}
</td>

<td className='p-4 font-semibold'>
₹{Number(
e.amount || 0
).toLocaleString()}
</td>

<td className='p-4'>
{e.reason}
</td>

<td className='p-4'>
{e.remarks}
</td>

</tr>

))
}

</tbody>

</table>

</div>

</div>

</RoleGuard>

)

}
