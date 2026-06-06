'use client'

import {
useEffect,
useMemo,
useState
} from 'react'

import RoleGuard
from '@/components/RoleGuard'

import { supabase }
from '@/lib/supabase'

export default function InventoryClosingPage(){

const [factory,setFactory] =
useState('')

const [userFactory,setUserFactory] =
useState('')

const [factories,setFactories] =
useState<any[]>([])

const [bagNames,setBagNames] =
useState<any[]>([]

)

const [openingStock,setOpeningStock] =
useState<any[]>([])

const [inwardEntries,setInwardEntries] =
useState<any[]>([])

const [transfers,setTransfers] =
useState<any[]>([])

const [productionEntries,setProductionEntries] =
useState<any[]>([])

const [dispatchEntries,setDispatchEntries] =
useState<any[]>([])

const [saving,setSaving] =
useState(false)

const currentDate =
new Date()

const [month,setMonth] =
useState(
currentDate.getMonth()+1
)

const [year,setYear] =
useState(
currentDate.getFullYear()
)

useEffect(()=>{

loadUserFactory()

loadFactories()

loadData()

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
'factory_name'
)

setFactories(
data || []
)

}

async function loadData(){

const bagNameRes =
await supabase
.from('bag_name_master')
.select('*')

const openingRes =
await supabase
.from('opening_stock')
.select('*')

const inwardRes =
await supabase
.from('empty_bag_inward')
.select('*')

const transferRes =
await supabase
.from('factory_transfer')
.select('*')

const productionRes =
await supabase
.from('production_entries')
.select('*')

const dispatchRes =
await supabase
.from('dispatch_entries')
.select('*')

setBagNames(
bagNameRes.data || []
)

setOpeningStock(
openingRes.data || []
)

setInwardEntries(
inwardRes.data || []
)

setTransfers(
transferRes.data || []
)

setProductionEntries(
productionRes.data || []
)

setDispatchEntries(
dispatchRes.data || []
)

}
const closingData =
useMemo(()=>{

const result:any[] = []

bagNames.forEach(
(bag:any)=>{

const bagName =
bag.bag_name

const openingRow =
openingStock.find(
(item:any)=>
item.bag_name ===
bagName
)

const opening =
Number(
openingRow?.opening_quantity || 0
)

const inward =
inwardEntries
.filter(
(item:any)=>

item.bag_name === bagName &&

(
!factory ||
item.factory === factory
)
)
.reduce(
(sum:number,row:any)=>

sum +
Number(
row.dispatch_bags || 0
),
0
)

const transferIn =
transfers
.filter(
(item:any)=>

item.bag_name === bagName &&

(
!factory ||
item.to_factory === factory
)
)
.reduce(
(sum:number,row:any)=>

sum +
Number(
row.quantity || 0
),
0
)

const transferOut =
transfers
.filter(
(item:any)=>

item.bag_name === bagName &&

(
!factory ||
item.from_factory === factory
)
)
.reduce(
(sum:number,row:any)=>

sum +
Number(
row.quantity || 0
),
0
)

const consumed =
productionEntries
.filter(
(item:any)=>

item.bag_name === bagName &&

(
!factory ||
item.factory === factory
)
)
.reduce(
(sum:number,row:any)=>

sum +
Number(
row.quantity || 0
),
0
)

const produced =
consumed

const dispatched =
dispatchEntries
.filter(
(item:any)=>

item.bag_name === bagName &&

(
!factory ||
item.factory === factory
)
)
.reduce(
(sum:number,row:any)=>

sum +
Number(
row.quantity || 0
),
0
)

const emptyStock =

opening +
inward +
transferIn -
transferOut -
consumed

const finishedStock =

produced -
dispatched

result.push({

bag_name:
bagName,

empty_stock:
emptyStock,

finished_stock:
finishedStock

})

}
)

return result

},[
bagNames,
openingStock,
inwardEntries,
transfers,
productionEntries,
dispatchEntries,
factory
])

async function generateClosing(){

    if(saving){
    return
    }
    
    setSaving(true)
    
    if(!factory){
    
    alert(
    'Select Factory'
    )
    
    setSaving(false)
    
    return
    
    }
    
    const {error:deleteError} =
    await supabase
    .from(
    'inventory_closing'
    )
    .delete()
    .eq(
    'factory',
    factory
    )
    .eq(
    'month',
    month
    )
    .eq(
    'year',
    year
    )
    
    if(deleteError){
    
    console.log(deleteError)
    
    alert(
    'Failed to clear old closing'
    )
    
    setSaving(false)
    
    return
    
    }
    
    const payload =
    
    closingData.map(
    (row:any)=>({
    
    factory,
    
    month,
    
    year,
    
    bag_name:
    row.bag_name,
    
    empty_stock:
    row.empty_stock,
    
    finished_stock:
    row.finished_stock
    
    })
    )
    
    const {error} =
    await supabase
    .from(
    'inventory_closing'
    )
    .insert(
    payload
    )
    
    if(error){
    
    console.log(error)
    
    alert(
    'Closing failed'
    )
    
    setSaving(false)
    
    return
    
    }
    
    alert(
    'Inventory Closing Generated'
    )
    
    setSaving(false)
    
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
    
    <div className="mb-6">
    
    <p className="text-slate-500 text-sm">
    Inventory Management
    </p>
    
    <h1 className="text-4xl font-bold text-slate-900 mt-2">
    Inventory Closing
    </h1>
    
    </div>
    
    <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-6">
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    <select
    value={month}
    onChange={(e)=>
    setMonth(
    Number(
    e.target.value
    )
    )
    }
    className="border border-slate-200 rounded-2xl p-3"
    >
    
    {
    Array.from(
    {length:12},
    (_,i)=>(
    <option
    key={i+1}
    value={i+1}
    >
    {i+1}
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
    Number(
    e.target.value
    )
    )
    }
    className="border border-slate-200 rounded-2xl p-3"
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
    className="
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
    key={
    item.factory_name
    }
    value={
    item.factory_name
    }
    >
    {
    item.factory_name
    }
    </option>
    )
    )
    }
    
    </select>
    
    </div>
    
    <div className="mt-6">
    
    <button
onClick={
generateClosing
}
disabled={saving}
className="
px-8
py-3
bg-slate-900
text-white
rounded-2xl
hover:bg-slate-800
disabled:bg-slate-400
disabled:cursor-not-allowed
"
>

{
saving
? 'Generating...'
: 'Generate Closing'
}

</button>
    
    </div>
    
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

<div className="bg-white rounded-3xl border border-slate-200 p-6">

<p className="text-slate-500">
Total Empty Stock
</p>

<h1 className="text-3xl font-bold">

{
closingData
.reduce(
(sum:any,row:any)=>

sum +
Number(
row.empty_stock || 0
),

0
)
.toLocaleString()
}

</h1>

</div>

<div className="bg-white rounded-3xl border border-slate-200 p-6">

<p className="text-slate-500">
Total Finished Stock
</p>

<h1 className="text-3xl font-bold">

{
closingData
.reduce(
(sum:any,row:any)=>

sum +
Number(
row.finished_stock || 0
),

0
)
.toLocaleString()
}

</h1>

</div>

</div>
    
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
    
    <div className="p-6 border-b border-slate-200">
    
    <h2 className="text-2xl font-semibold">
    Closing Preview
    </h2>
    
    </div>
    
    <div className="overflow-x-auto">
    
    <table className="w-full">
    
    <thead className="bg-slate-50">
    
    <tr>
    
    <th className="p-4 text-left">
    Bag Name
    </th>
    
    <th className="p-4 text-right">
    Empty Stock
    </th>
    
    <th className="p-4 text-right">
    Finished Stock
    </th>
    
    </tr>
    
    </thead>
    
    <tbody>
    
    {
    closingData.map(
    (row:any,index:number)=>(
    
    <tr
    key={index}
    className="border-t border-slate-100"
    >
    
    <td className="p-4">
    {row.bag_name}
    </td>
    
    <td className="p-4 text-right">
    {
    Number(
    row.empty_stock
    ).toLocaleString()
    }
    </td>
    
    <td className="p-4 text-right">
    {
    Number(
    row.finished_stock
    ).toLocaleString()
    }
    </td>
    
    </tr>
    
    )
    )
    }
    
    </tbody>
    
    </table>
    
    </div>
    
    </div>
    
    </div>
    
    </div>
    
    </RoleGuard>
    
    )
    
    }