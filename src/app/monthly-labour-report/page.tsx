'use client'

import {
useEffect,
useMemo,
useState
} from 'react'

import * as XLSX
from 'xlsx'

import RoleGuard
from '@/components/RoleGuard'

import { supabase }
from '@/lib/supabase'

export default function MonthlyLabourReportPage(){

const [entries,setEntries] =
useState<any[]>([])

const [factories,setFactories] =
useState<any[]>([])

const [factory,setFactory] =
useState('')

const [userFactory,setUserFactory] =
useState('')

const currentDate =
new Date()

const [month,setMonth] =
useState(
String(
currentDate.getMonth()+1
).padStart(2,'0')
)

const [year,setYear] =
useState(
String(
currentDate.getFullYear()
)
)

useEffect(()=>{

loadUserFactory()

loadFactories()

},[])

useEffect(()=>{

    loadEntries()
    
    },[])

async function loadUserFactory(){

const value =
localStorage.getItem(
'userFactory'
) || ''

setUserFactory(value)

if(value){

setFactory(value)

}

}

async function loadFactories(){

const {data} =
await supabase
.from('factory_master')
.select('factory_name')
.order(
'factory_name',
{
ascending:true
}
)

setFactories(
data || []
)

}

async function loadEntries(){

    const {data,error} =
    await supabase
    .from('production_entries')
    .select('*')
    .order(
    'production_date',
    {
    ascending:false
    }
    )
    
    if(error){
    
    console.log(error)
    
    return
    
    }
    
    setEntries(
    data || []
    )
    
    }


    const filtered =
useMemo(()=>entries.filter(e=>{

const entryDate =
new Date(
e.production_date
)

const selectedDate =
new Date(
Number(year),
Number(month)-1,
1
)

if(
entryDate.getMonth() !== selectedDate.getMonth() ||
entryDate.getFullYear() !== selectedDate.getFullYear()
){
return false
}

const selectedFactory =
userFactory || factory

if(
selectedFactory &&
e.factory !== selectedFactory
){
return false
}

return true

}),[
entries,
factory,
userFactory,
month,
year
])


const reportData =
useMemo(()=>{

const grouped:any = {}

filtered.forEach(
    (entry:any)=>{

const key =

`${entry.labour_name}__${entry.bag_type}__${entry.rate}`

if(
!grouped[key]
){

grouped[key] = {

labour_name:
entry.labour_name,

bag_type:
entry.bag_type,

rate:
Number(
entry.rate || 0
),

quantity:0,

amount:0,

meshes:
new Set()

}

}

grouped[key]
.quantity +=
Number(
entry.quantity || 0
)

grouped[key]
.amount +=
Number(
entry.amount || 0
)

grouped[key]
.meshes.add(
entry.mesh
)

}
)

return Object.values(
grouped
).map(
(item:any)=>({

...item,

meshes:
Array.from(
item.meshes
)
.sort()
.join(', ')

})
)
.sort(
(a:any,b:any)=>

b.amount -
a.amount
)

},[
filtered
])
const totalAmount =
filtered.reduce(
(sum,e)=>
sum +
Number(
e.amount || 0
),
0
)

const labourGroups =
useMemo(()=>{

const groups:any = {}

reportData.forEach(
(row:any)=>{

if(
!groups[
row.labour_name
]
){

groups[
row.labour_name
] = []

}

groups[
row.labour_name
].push(row)

}
)

return groups

},[
reportData
])

const totalQuantity =
filtered.reduce(
(sum,e)=>
sum +
Number(
e.quantity || 0
),
0
)

const totalLabours =

new Set(

reportData.map(
(row:any)=>
row.labour_name
)

).size

function exportExcel(){

    const rows:any[] = []
    
    rows.push([
    'MONTHLY LABOUR REPORT'
    ])
    
    rows.push([
    `Factory : ${factory || userFactory}`
    ])
    
    rows.push([
    `Month : ${month}`
    ])
    
    rows.push([
    `Year : ${year}`
    ])
    
    rows.push([])
    
    Object.entries(
    labourGroups
    ).forEach(
    ([labour,data]:any)=>{
    
    rows.push([
    labour
    ])
    
    rows.push([
    'Bag Type',
    'Meshes',
    'Rate',
    'Quantity',
    'Amount'
    ])
    
    data.forEach(
    (row:any)=>{
    
    rows.push([
    
    row.bag_type,
    
    row.meshes,
    
    row.rate,
    
    row.quantity,
    
    row.amount
    
    ])
    
    }
    )
    
    rows.push([
    
    'TOTAL',
    
    '',
    
    '',
    
    data.reduce(
    (a:any,b:any)=>
    a+b.quantity,
    0
    ),
    
    data.reduce(
    (a:any,b:any)=>
    a+b.amount,
    0
    )
    
    ])
    
    rows.push([])
    
    }
    )
    
    const ws =
    XLSX.utils.aoa_to_sheet(
    rows
    )
    
    const wb =
    XLSX.utils.book_new()
    
    XLSX.utils.book_append_sheet(
    wb,
    ws,
    'Labour Report'
    )
    
    XLSX.writeFile(
    
    wb,
    
    `Labour_Report_${month}_${year}.xlsx`
    
    )
    
    }

return (

<RoleGuard
allowedRoles={[
'Admin',
'production'
]}
>

<div className="min-h-screen p-4 md:p-6">

<div className="max-w-7xl mx-auto">

<div className="mb-10">

<p className="text-slate-500 text-sm">
Production Management
</p>

<div className="flex justify-between items-end mb-4">

<div>

<h1 className="text-4xl font-bold text-slate-900 mt-2">
Monthly Labour Report
</h1>

</div>

<button
onClick={
exportExcel
}
className="
px-6
py-3
bg-green-600
text-white
rounded-2xl
hover:bg-green-700
"
>

Export Excel

</button>

</div>

<div className="bg-white rounded-3xl border border-slate-200 p-8 mb-10 shadow-sm">

<div className="grid grid-cols-1 md:grid-cols-[120px_250px_250px] gap-8">

</div>

{
Object.entries(
labourGroups
).map(
([labour,rows]:any)=>(

<div
key={labour}
className="
bg-white
rounded-3xl
border
border-slate-200
overflow-hidden
mb-8
shadow-sm
"
>

<div className="p-5 bg-slate-50">

<h2 className="text-2xl font-bold">
{labour}
</h2>

</div>

<table className="w-full">

<thead>

<tr>

<th className="p-4 text-left">
Bag Type
</th>

<th className="p-4 text-left">
Meshes
</th>

<th className="p-4 text-right">
Rate
</th>

<th className="p-4 text-right">
Qty
</th>

<th className="p-4 text-right">
Amount
</th>

</tr>

</thead>

<tbody>

{
rows.map(
(row:any,index:number)=>(

<tr
key={index}
className="
border-t
border-slate-100
"
>

<td className="p-4">
{row.bag_type}
</td>

<td className="p-4">
{row.meshes}
</td>

<td className="p-4 text-right">
₹{row.rate}
</td>

<td className="p-4 text-right">
{
row.quantity
.toLocaleString()
}
</td>

<td className="p-4 text-right font-semibold">
₹{
row.amount
.toLocaleString()
}
</td>

</tr>

)
)
}

<tr className="bg-slate-50 font-bold">

<td
colSpan={3}
className="p-4"
>
TOTAL
</td>

<td className="p-4 text-right">

{
rows.reduce(
(a:any,b:any)=>

a+b.quantity,

0
).toLocaleString()
}

</td>

<td className="p-4 text-right">

₹{
rows.reduce(
(a:any,b:any)=>

a+b.amount,

0
).toLocaleString()
}

</td>

</tr>

</tbody>

</table>

</div>

)
)
}



<select
value={month}
onChange={(e)=>
setMonth(
e.target.value
)
}
className="w-[90px] border border-slate-200 rounded-2xl p-3"
>

{
Array.from(
{length:12},
(_,i)=>(
<option
key={i+1}
value={String(i+1).padStart(2,'0')}
>
{String(i+1).padStart(2,'0')}
</option>
)
)
}

</select>

<input
type="number"
value={year}
onChange={(e)=>
setYear(
e.target.value
)
}
className="w-[180px] border border-slate-200 rounded-2xl p-3"
/>

<select
value={factory}
onChange={(e)=>
setFactory(
e.target.value
)
}
disabled={
userFactory !== ''
}
className="w-[220px] 
border
border-slate-200
rounded-2xl
p-3
disabled:bg-slate-100
"
>

<option value="">
Select Factory
</option>

{
factories.map(
(item:any)=>(
<option
key={item.factory_name}
value={item.factory_name}
>
{item.factory_name}
</option>
)
)
}

</select>

</div>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

<div className="bg-white rounded-3xl border border-slate-200 p-6">

<p className="text-slate-500">
Total Labour Amount
</p>

<h1 className="text-3xl font-bold">
₹{
totalAmount.toLocaleString()
}
</h1>

</div>

<div className="bg-white rounded-3xl border border-slate-200 p-6">

<p className="text-slate-500">
Total Bags
</p>

<h1 className="text-3xl font-bold">
{
totalQuantity.toLocaleString()
}
</h1>

</div>

<div className="bg-white rounded-3xl border border-slate-200 p-6">

<p className="text-slate-500">
Total Labours
</p>

<h1 className="text-3xl font-bold">
{
totalLabours
}
</h1>

</div>

</div>


</div>

</div>

</RoleGuard>

)

}