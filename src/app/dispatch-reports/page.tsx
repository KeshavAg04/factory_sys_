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
import RoleGuard from '@/components/RoleGuard'

export default function DispatchReportsPage(){

const [entries,setEntries]=
useState<any[]>([])

const [mode,setMode]=
useState<'detailed'|'summary'>(
'detailed'
)

const [summaryBy,setSummaryBy]=
useState('customer')

const [search,setSearch]=
useState('')

const [customer,setCustomer]=
useState('')

const [factory,setFactory]=
useState('')

const [bagType,setBagType]=
useState('')

const [bagName,setBagName]=
useState('')

const [mesh,setMesh]=
useState('')

const [vehicle,setVehicle]=
useState('')

const [fromDate,setFromDate]=
useState('')

const [toDate,setToDate]=
useState('')

const [period,setPeriod]=
useState('month')

const [loadingStatus,setLoadingStatus] =
useState('')

const [adjustments,setAdjustments] =
useState<any[]>([])

useEffect(()=>{

loadEntries()

},[])

async function loadEntries(){

    const [
    dispatchRes,
    adjustmentRes
    ] = await Promise.all([
    
    supabase
    .from('dispatch_entries')
    .select('*')
    .order(
    'dispatch_date',
    {
    ascending:false
    }
    ),
    
    supabase
    .from('sales_adjustments')
    .select('*')
    
    ])
    
    if(dispatchRes.error){
    
    console.log(
    dispatchRes.error
    )
    
    return
    
    }
    
    setEntries(
    dispatchRes.data || []
    )
    
    setAdjustments(
    adjustmentRes.data || []
    )
    
    }

const values=
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

const filtered=
useMemo(
()=>entries.filter(e=>{
    const entryDate =
new Date(
e.dispatch_date
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
e.customer_name!==customer
)
return false

if(
factory &&
e.factory!==factory
)
return false

if(
bagType &&
e.bag_type!==bagType
)
return false

if(
bagName &&
e.bag_name!==bagName
)
return false

if(
mesh &&
e.mesh!==mesh
)
return false

if(
vehicle &&
e.vehicle_no!==vehicle
)
return false

if(
    loadingStatus === 'pending' &&
    !e.loading_pending
    )
    return false
    
    if(
    loadingStatus === 'cleared' &&
    e.loading_pending
    )
    return false

if(period==='custom'){

    if(
    fromDate &&
    e.dispatch_date<fromDate
    )
    return false
   
    if(
    toDate &&
    e.dispatch_date>toDate
    )
    return false
   
   }

return true

}),
[
    entries,
    search,
    customer,
    factory,
    bagType,
    bagName,
    mesh,
    loadingStatus,
    fromDate,
    toDate,
    period
    ]
)

const filteredAdjustments =
adjustments.filter(a=>{

const adjustmentDate =
new Date(
a.adjustment_date
)

const now =
new Date()

if(period === 'month'){

if(
adjustmentDate.getMonth() !== now.getMonth() ||
adjustmentDate.getFullYear() !== now.getFullYear()
){
return false
}

}

if(period === 'lastMonth'){

const lastMonth =
new Date()

lastMonth.setMonth(
now.getMonth() - 1
)

if(
adjustmentDate.getMonth() !== lastMonth.getMonth() ||
adjustmentDate.getFullYear() !== lastMonth.getFullYear()
){
return false
}

}

if(
customer &&
a.customer_name !== customer
){
return false
}

if(period === 'custom'){

if(
fromDate &&
a.adjustment_date < fromDate
){
return false
}

if(
toDate &&
a.adjustment_date > toDate
){
return false
}

}

return true

})

const totalQty=
filtered.reduce(
(a,b)=>
a+
Number(
b.quantity||0
),
0
)

const totalEntries=
filtered.length

const totalCustomers=
new Set(
filtered.map(
e=>e.customer_name
)
).size

const totalFreight =
filtered.reduce(
(sum,e)=>
sum +
Number(
e.total_freight || 0
),
0
)

const totalLoadingAmount =
filtered.reduce(
(sum,e)=>
sum +
Number(
e.loading_amount || 0
),
0
)

const totalLoadingPending =
filtered.filter(
e => e.loading_pending
).length

const totalVasuli =
filtered.reduce(
(sum,e)=>
sum +
Number(
e.vasuli || 0
),
0
)

const totalDispatchBags =
filtered.reduce(
(sum,e)=>

sum +
Number(
e.dispatch_bags || 0
),

0
)

const totalCreditNotes =
filteredAdjustments
.filter(
a =>
a.adjustment_type ===
'Credit Note'
)
.reduce(
(sum,a)=>
sum +
Number(
a.amount || 0
),
0
)

const totalDebitNotes =
filteredAdjustments
.filter(
a =>
a.adjustment_type ===
'Debit Note'
)
.reduce(
(sum,a)=>
sum +
Number(
a.amount || 0
),
0
)

const netAdjustment =
totalDebitNotes -
totalCreditNotes

const totalSales =
filtered.reduce(
(sum,e)=>
sum +
Number(
e.sales_amount || 0
),
0
)

const netSales =
totalSales
-
totalCreditNotes
+
totalDebitNotes



const summary=
Object.values(
filtered.reduce(
(acc:any,e)=>{

let key=''

switch(summaryBy){

    case 'factory':
    
    key=e.factory
    
    break
    
    case 'bag_type':
    
    key=e.bag_type
    
    break
    
    case 'bag_name':
    
    key=e.bag_name
    
    break
    
    case 'mesh':
    
    key=e.mesh
    
    break
    
    case 'vehicle':
    
    key=e.vehicle_no
    
    break
    
    case 'transporter':
    
    key=e.transporter_name
    
    break
    
    case 'freight_type':
    
    key=e.freight_type
    
    break
    
    default:
    
    key=e.customer_name
    
    }

if(
!acc[key]
){

    acc[key]={
        name:key,
        qty:0,
        bags:0,
        freight:0,
        vasuli:0
        }

}

acc[key].qty+=
Number(
e.quantity||0
)

acc[key].bags+=
Number(
e.dispatch_bags || 0
)


acc[key].freight+=
Number(
e.total_freight || 0
)

acc[key].vasuli+=
Number(
e.vasuli || 0
)

return acc

},{})
)

function exportExcel(
data:any[],
name:string
){

const ws=
XLSX.utils.json_to_sheet(
data
)

const wb=
XLSX.utils.book_new()

XLSX.utils.book_append_sheet(
wb,
ws,
'Dispatch Report'
)

let fileName=name

if(customer){

fileName+=
`-${customer}`

}

if(factory){

fileName+=
`-${factory}`

}

if(fromDate){

fileName+=
`-${fromDate}`

}

if(toDate){

fileName+=
`-to-${toDate}`

}

fileName=
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
>

    <div className='p-4 md:p-6 space-y-6'>
    
    <div className='flex flex-col md:flex-row justify-between gap-4'>
    
    <div>
    
    <p className='text-slate-500'>
    Production Management
    </p>
    
    <h1 className='text-4xl font-bold'>
    Dispatch Reports
    </h1>
    
    </div>
    
    <div className='space-y-3'>

<div className='flex gap-3'>

<button
onClick={()=>
setMode('detailed')
}
className={`px-5 py-3 rounded-xl transition ${
mode==='detailed'
?'bg-slate-900 text-white'
:'bg-white border'
}`}
>
Detailed
</button>

<button
onClick={()=>
setMode('summary')
}
className={`px-5 py-3 rounded-xl transition ${
mode==='summary'
?'bg-slate-900 text-white'
:'bg-white border'
}`}
>
Summary
</button>

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
    
    </div>
    
    <div className='bg-white rounded-3xl p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3'>
    
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
    value={factory}
    onChange={e=>
    setFactory(
    e.target.value
    )
    }
    className='border rounded-xl p-3'
    >
    <option value=''>
    All Factories
    </option>
    
    {values(
    'factory'
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
    value={bagType}
    onChange={e=>
    setBagType(
    e.target.value
    )
    }
    className='border rounded-xl p-3'
    >
    <option value=''>
    All Bag Types
    </option>
    
    {values(
    'bag_type'
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
    value={bagName}
    onChange={e=>
    setBagName(
    e.target.value
    )
    }
    className='border rounded-xl p-3'
    >
    <option value=''>
    All Bag Names
    </option>
    
    {values(
    'bag_name'
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
    value={mesh}
    onChange={e=>
    setMesh(
    e.target.value
    )
    }
    className='border rounded-xl p-3'
    >
    <option value=''>
    All Mesh
    </option>
    
    {values(
    'mesh'
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
value={loadingStatus}
onChange={e=>
setLoadingStatus(
e.target.value
)
}
className='border rounded-xl p-3'
>

<option value=''>
All Loading Status
</option>

<option value='pending'>
Pending
</option>

<option value='cleared'>
Cleared
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
    
    <h2 className='text-xl font-bold text-slate-800 mb-2'>
Dispatch Overview
</h2>

<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>
    
    <p>
    Total Dispatch Qty
    </p>
    
    <h1 className='text-4xl font-bold mt-2'>
    {totalQty.toFixed(2)}
    </h1>
    
    </div>
    
    <div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>
    
    <p>
    Dispatch Entries
    </p>
    
    <h1 className='text-4xl font-bold mt-2'>
    {totalEntries}
    </h1>
    
    </div>
    
    <div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>
    
    <p>
    Customers Served
    </p>
    
    <h1 className='text-4xl font-bold mt-2'>
    {totalCustomers}
    </h1>
    
    </div>

    <div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Dispatch Bags
</p>

<h1 className='text-4xl font-bold mt-2'>
{totalDispatchBags.toLocaleString()}
</h1>

</div>

</div>

<h2 className='text-lg font-bold mt-8'>
Freight & Loading
</h2>

<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Total Freight
</p>

<h1 className='text-4xl font-bold mt-2'>
₹{totalFreight.toLocaleString()}
</h1>

</div>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Loading Amount
</p>

<h1 className='text-4xl font-bold mt-2'>
₹{totalLoadingAmount.toLocaleString()}
</h1>

</div>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Loading Pending
</p>

<h1 className='text-4xl font-bold mt-2'>
{totalLoadingPending}
</h1>

</div>


<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Total Vasuli
</p>

<h1 className='text-3xl font-bold text-green-700'>
₹{totalVasuli.toLocaleString()}
</h1>

</div>

</div>


<h2 className='text-lg font-bold mt-8'>
Sales Summary
</h2>

<div className='grid grid-cols-1 md:grid-cols-5 gap-4'>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Gross Sales
</p>

<h1 className='text-3xl font-bold text-blue-600'>
₹{totalSales.toLocaleString()}
</h1>

</div>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Credit Notes
</p>

<h1 className='text-3xl font-bold text-red-600'>
₹{totalCreditNotes.toLocaleString()}
</h1>

</div>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Debit Notes
</p>

<h1 className='text-3xl font-bold text-green-600'>
₹{totalDebitNotes.toLocaleString()}
</h1>

</div>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Net Adjustment
</p>

<h1 className='text-4xl font-bold mt-2'>
₹{netAdjustment.toLocaleString()}
</h1>

</div>

<div className='bg-white p-6 rounded-3xl shadow-sm border min-h-[140px] flex flex-col justify-center'>

<p>
Net Sales
</p>

<h1 className='text-3xl font-bold text-purple-700'>
₹{netSales.toLocaleString()}
</h1>

</div>

</div>




    <div className='flex flex-col md:flex-row justify-between gap-3'>
    
    {mode==='summary' &&
    
    <select
    value={summaryBy}
    onChange={e=>
    setSummaryBy(
    e.target.value
    )
    }
    className='border rounded-xl p-3'
    >
    
    <option value='customer'>
    Customer
    </option>
    
    <option value='factory'>
    Factory
    </option>
    
    <option value='bag_type'>
    Bag Type
    </option>
    
    <option value='bag_name'>
    Bag Name
    </option>
    
    <option value='mesh'>
    Mesh
    </option>
    
    <option value='vehicle'>
    Vehicle
    </option>
    <option value='transporter'>
Transporter
</option>

<option value='freight_type'>
Freight Type
</option>
    
    </select>
    
    }
    
    <button
    onClick={()=>
    exportExcel(
    mode==='detailed'
    ?filtered
    :summary,
    'dispatch-report'
    )
    }
    className='bg-slate-900 text-white px-5 py-3 rounded-xl'
    >
    Export Excel
    </button>
    
    </div>
    
    {mode==='summary' &&
    
    <div className='bg-white rounded-3xl p-4 md:p-6 overflow-x-auto'>
    
    <table className='min-w-[700px] w-full text-sm'>
    
    <thead className='bg-slate-100'>
    
    <tr className='text-left'>
    
    <th className='p-4'>
Category
</th>

<th className='p-4'>
Dispatch Qty
</th>

<th className='p-4'>
Dispatch Bags
</th>

<th className='p-4'>
Freight
</th>

<th className='p-4'>
Vasuli
</th>
    
    </tr>
    
    </thead>
    
    <tbody>
    
    {summary.map(
    (r:any)=>
    
    <tr
    key={r.name}
    className='border-b'
    >
    
    <td className='p-4'>
    {r.name}
    </td>
    
    <td className='p-4'>
{Number(r.qty).toFixed(2)}
</td>

<td className='p-4'>
{r.bags}
</td>

<td className='p-4'>
₹{Number(
r.freight || 0
).toLocaleString()}
</td>

<td className='p-4 text-green-700 font-semibold'>
₹{Number(
r.vasuli || 0
).toLocaleString()}
</td>
    
    </tr>
    
    )}
    
    </tbody>
    
    </table>
    
    </div>
    
    }
    
    {mode==='detailed' &&
    
    <div className='bg-white rounded-3xl overflow-x-auto'>
    
    <table className='min-w-[2600px] w-full text-sm'>
    
    <thead className='bg-slate-100'>
    
    <tr className='text-left'>
    
    <th className='p-4'>Date</th>
<th className='p-4'>Invoice</th>
<th className='p-4'>Customer</th>
<th className='p-4'>Factory</th>

<th className='p-4'>Bag Type</th>
<th className='p-4'>Bag Name</th>
<th className='p-4'>Mesh</th>

<th className='p-4'>Qty (Tons)</th>

<th className='p-4'>
Sales Rate
</th>

<th className='p-4'>
Sales Amount
</th>

<th className='p-4'>
Dispatch Bags
</th>

<th className='p-4'>Transporter</th>
<th className='p-4'>Vehicle</th>

<th className='p-4'>LR No</th>
<th className='p-4'>Freight Type</th>
<th className='p-4'>LR Freight</th>

<th className='p-4'>Freight PMT</th>
<th className='p-4'>Total Freight</th>

<th className='p-4'>Loading</th>
<th className='p-4'>Status</th>

<th className='p-4'>Vasuli</th>

<th className='p-4'>Remarks</th>
    
    </tr>
    
    </thead>
    
    <tbody>
    
    {
filtered.map(
(e:any,index:number)=>(

<tr
key={e.id || index}
>
    <td className='p-4'>
{e.dispatch_date}
</td>

<td className='p-4'>
{e.invoice_number}
</td>

<td className='p-4'>
{e.customer_name}
</td>

<td className='p-4'>
{e.factory}
</td>

<td className='p-4'>
{e.bag_type}
</td>

<td className='p-4'>
{e.bag_name}
</td>

<td className='p-4'>
{e.mesh}
</td>

<td className='p-4 font-semibold'>
{Number(e.quantity || 0).toFixed(2)}
</td>

<td className='p-4'>
₹{Number(
e.sales_rate || 0
).toLocaleString()}
</td>

<td className='p-4 font-semibold text-blue-700'>
₹{Number(
e.sales_amount || 0
).toLocaleString()}
</td>

<td className='p-4 font-semibold'>
{e.dispatch_bags}
</td>

<td className='p-4'>
{e.transporter_name}
</td>

<td className='p-4'>
{e.vehicle_no}
</td>

<td className='p-4'>
{e.lr_number}
</td>

<td className='p-4'>
{e.freight_type}
</td>

<td className='p-4'>
₹{Number(
e.lr_freight || 0
).toLocaleString()}
</td>


<td className='p-4'>
₹{Number(
e.freight_pmt || 0
).toLocaleString()}
</td>

<td className='p-4 font-semibold'>
₹{Number(
e.total_freight || 0
).toLocaleString()}
</td>

<td className='p-4'>
₹{Number(
e.loading_amount || 0
).toLocaleString()}
</td>

<td className='p-4'>
{
e.loading_pending
? 'Pending'
: 'Cleared'
}
</td>

<td className='p-4 text-green-700 font-semibold'>
₹{Number(
e.vasuli || 0
).toLocaleString()}
</td>

<td className='p-4'>
{e.remarks}
</td>
    
    </tr>
)
    
    )}
    
    </tbody>
    
    </table>
    
    </div>
    
    }
    
    </div>
    </RoleGuard>
    
    )
    
    }