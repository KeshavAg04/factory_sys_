'use client'

import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

export default function ReportsPage(){

const [entries,setEntries]=useState<any[]>([])

const [mode,setMode]=
useState<'detailed'|'summary'>(
'detailed'
)

const [summaryBy,setSummaryBy]=
useState('bag_name')

const [search,setSearch]=useState('')
const [factory,setFactory]=useState('')
const [machine,setMachine]=useState('')
const [labour,setLabour]=useState('')
const [shift,setShift]=useState('')
const [mesh,setMesh]=useState('')
const [bagType,setBagType]=useState('')
const [bagName,setBagName]=useState('')

useEffect(()=>{
loadEntries()
},[])

async function loadEntries(){

const {data,error}=await supabase
.from('production_entries')
.select('*')
.order(
'production_date',
{ascending:false}
)

if(error){

console.log(
'REPORT ERROR',
error
)

return
}

setEntries(data||[])

}

function tons(
type:string,
qty:number
){

if(!type)return 0

const t=
type.toLowerCase()

// IMPORTANT: bigger values first

if(
t.includes('1400')
)
return qty*1.4

if(
t.includes('1350')
)
return qty*1.35

if(
t.includes('1250')
)
return qty*1.25

if(
t.includes('50kg')
||
t==='50kg'
||
t.includes('50 kg')
)
return qty*.05

return 0

}

const filtered=
useMemo(()=>{

return entries.filter(e=>{

if(
search &&
!JSON.stringify(e)
.toLowerCase()
.includes(
search
.toLowerCase()
)
)
return false

if(
factory &&
e.factory!==factory
)
return false

if(
machine &&
e.machine!==machine
)
return false

if(
labour &&
!(
e.labour_name||''
)
.toLowerCase()
.includes(
labour
.toLowerCase()
)
)
return false

if(
shift &&
e.shift!==shift
)
return false

if(
mesh &&
e.mesh!==mesh
)
return false

if(
bagType &&
e.bag_type
!==bagType
)
return false

if(
bagName &&
e.bag_name
!==bagName
)
return false

return true

})

},[
entries,
search,
factory,
machine,
labour,
shift,
mesh,
bagType,
bagName
])

const totalQty=
filtered.reduce(
(a,b)=>
a+
Number(
b.quantity||0
)
,0
)

const totalAmount=
filtered.reduce(
(a,b)=>
a+
Number(
b.amount||0
)
,0
)

const totalTons=
filtered.reduce(
(a,b)=>

a+
tons(
b.bag_type,
Number(
b.quantity||0
)
)

,0
)

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

const summary=
Object.values(

filtered.reduce(
(acc:any,e)=>{

let key=''

switch(
summaryBy
){

case 'bag_type':

key=
e.bag_type

break


case
'bag_type_name':

key=
`${e.bag_type}
-
${e.bag_name}`

break


case
'bag_mesh':

key=
`${e.bag_type}
-
${e.mesh}`

break


case
'labour':

key=
e.labour_name

break


case
'machine':

key=
e.machine

break


case
'factory':

key=
e.factory

break


case
'shift':

key=
e.shift

break


case
'mesh':

key=
e.mesh

break


default:

key=
e.bag_name

}


if(
!acc[key]
){

acc[key]={

name:key,

qty:0,

tons:0,

amount:0

}

}

acc[key]
.qty+=
Number(
e.quantity||0
)

acc[key]
.tons+=
tons(
e.bag_type,
Number(
e.quantity||0
)
)

acc[key]
.amount+=
Number(
e.amount||0
)

return acc

},{}

)

)

function exportDetailed(){

const data=
filtered.map(
e=>({

Date:
e.production_date,

Factory:
e.factory,

Machine:
e.machine,

Labour:
e.labour_name,

Shift:
e.shift,

Mesh:
e.mesh,

BagType:
e.bag_type,

BagName:
e.bag_name,

Quantity:
e.quantity,

Goods:
tons(
e.bag_type,
Number(
e.quantity
)
),

Rate:
e.rate,

Amount:
e.amount

})
)

const ws=
XLSX.utils
.json_to_sheet(
data
)

const wb=
XLSX.utils
.book_new()

XLSX.utils
.book_append_sheet(
wb,
ws,
'Detailed'
)

XLSX.writeFile(
wb,
'detailed-report.xlsx'
)

}

function exportSummary(){

const ws=
XLSX.utils
.json_to_sheet(
summary
)

const wb=
XLSX.utils
.book_new()

XLSX.utils
.book_append_sheet(
wb,
ws,
'Summary'
)

XLSX.writeFile(
wb,
'summary-report.xlsx'
)

}

return(

<div className='p-6 space-y-6'>

<div className='flex justify-between'>

<div>

<p className='text-slate-500'>
Production Management
</p>

<h1 className='text-5xl font-bold'>
Reports
</h1>

</div>

<div className='flex gap-3'>

<button
onClick={()=>
setMode(
'detailed'
)
}
className='px-5 py-3 rounded-xl border'
>
Detailed
</button>

<button
onClick={()=>
setMode(
'summary'
)
}
className='px-5 py-3 rounded-xl border'
>
Summary
</button>

</div>

</div>


<div className='bg-white rounded-3xl p-6 grid md:grid-cols-4 gap-4'>

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

<input
list='labours'
placeholder='Labour'
value={labour}
onChange={e=>
setLabour(
e.target.value
)
}
className='border rounded-xl p-3'
/>

<datalist id='labours'>

{
values(
'labour_name'
)
.map(
(v:any)=>

<option
key={v}
value={v}
/>
)
}

</datalist>


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

{
values(
'factory'
)
.map(
(v:any)=>

<option
key={v}>
{v}
</option>
)
}

</select>



<select
value={machine}
onChange={e=>
setMachine(
e.target.value
)
}
className='border rounded-xl p-3'
>

<option value=''>
All Machines
</option>

{
values(
'machine'
)
.map(
(v:any)=>

<option key={v}>
{v}
</option>
)
}

</select>


<select
value={shift}
onChange={e=>
setShift(
e.target.value
)
}
className='border rounded-xl p-3'
>

<option value=''>
All Shifts
</option>

<option>
Day
</option>

<option>
Night
</option>

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

{
values(
'mesh'
)
.map(
(v:any)=>

<option key={v}>
{v}
</option>
)
}

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

{
values(
'bag_type'
)
.map(
(v:any)=>

<option key={v}>
{v}
</option>
)
}

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

{
values(
'bag_name'
)
.map(
(v:any)=>

<option key={v}>
{v}
</option>
)
}

</select>

</div>


<div className='grid md:grid-cols-3 gap-4'>

<div className='bg-white p-6 rounded-3xl'>
<p>Total Bags</p>
<h1 className='text-4xl font-bold'>
{totalQty}
</h1>
</div>

<div className='bg-white p-6 rounded-3xl'>
<p>Goods Produced</p>
<h1 className='text-4xl font-bold'>
{totalTons.toFixed(2)} T
</h1>
</div>

<div className='bg-white p-6 rounded-3xl'>
<p>Total Amount</p>
<h1 className='text-4xl font-bold'>
₹{totalAmount}
</h1>
</div>

</div>


<div className='flex justify-between'>

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

<option value='bag_name'>
Bag Name
</option>

<option value='bag_type'>
Bag Type
</option>

<option value='bag_type_name'>
Bag+Name
</option>

<option value='bag_mesh'>
Bag+Mesh
</option>

<option value='labour'>
Labour
</option>

<option value='machine'>
Machine
</option>

<option value='factory'>
Factory
</option>

<option value='shift'>
Shift
</option>

<option value='mesh'>
Mesh
</option>

</select>

}

<button
onClick={
mode==='detailed'
?
exportDetailed
:
exportSummary
}
className='bg-slate-900 text-white px-5 py-3 rounded-xl'
>

Export Excel

</button>

</div>


{mode==='summary'&&(

<div className='bg-white rounded-3xl p-6 overflow-auto'>

<table className='w-full'>

<thead>

<tr>

<th>Category</th>
<th>Bags</th>
<th>Goods(T)</th>
<th>Amount</th>

</tr>

</thead>

<tbody>

{
summary.map(
(r:any)=>

<tr key={r.name}>

<td>{r.name}</td>

<td>{r.qty}</td>

<td>
{r.tons.toFixed(2)}
</td>

<td>
₹{r.amount}
</td>

</tr>
)
}

</tbody>

</table>

</div>

)}


{mode==='detailed'&&(

<div className='bg-white rounded-3xl overflow-auto'>

<table className='w-full'>

<thead>

<tr>

<th>Date</th>
<th>Factory</th>
<th>Machine</th>
<th>Labour</th>
<th>Shift</th>
<th>Mesh</th>
<th>Bag</th>
<th>Qty</th>
<th>Goods(T)</th>
<th>Rate</th>
<th>Amount</th>

</tr>

</thead>

<tbody>

{
filtered.map(
e=>

<tr key={e.id}>

<td>
{e.production_date}
</td>

<td>
{e.factory}
</td>

<td>
{e.machine}
</td>

<td>
{e.labour_name}
</td>

<td>
{e.shift}
</td>

<td>
{e.mesh}
</td>

<td>
{e.bag_name}
</td>

<td>
{e.quantity}
</td>

<td>
{
tons(
e.bag_type,
Number(
e.quantity
)
)
.toFixed(2)
}
</td>

<td>
₹{e.rate}
</td>

<td>
₹{e.amount}
</td>

</tr>
)
}

</tbody>

</table>

</div>

)}

</div>

)

}