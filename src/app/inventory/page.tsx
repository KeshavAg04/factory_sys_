'use client'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase'

export default function InventoryPage(){

const [factories,setFactories] =
useState<string[]>([])

const [selectedFactory,setSelectedFactory] =
useState('All Factories')

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

const [bagNames,setBagNames] =
useState<any[]>([])

const [closingData,setClosingData] =
useState<any[]>([])

const [userFactory,setUserFactory] =
useState('')

useEffect(()=>{

    const factory =
    localStorage.getItem(
    'userFactory'
    ) || ''
    
    setUserFactory(factory)
    
    if(factory){
    
    setSelectedFactory(
    factory
    )
    
    }

loadData()

},[])

async function loadData(){

    const [
        factoryRes,
        bagNameRes,
        openingRes,
        inwardRes,
        transferRes,
        productionRes,
        dispatchRes,
        closingRes
        ] = await Promise.all([

supabase
.from('factory_master')
.select('factory_name'),

supabase
.from('bag_name_master')
.select('*'),

supabase
.from('opening_stock')
.select('*'),

supabase
.from('empty_bag_inward')
.select('*'),

supabase
.from('factory_transfer')
.select('*'),

supabase
.from('production_entries')
.select('*'),

supabase
.from('dispatch_entries')
.select('*'),

supabase
.from('inventory_closing')
.select('*')

])

setFactories(
[
'All Factories',
...(factoryRes.data?.map(
f=>f.factory_name
) || [])
]
)

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

const previousMonth =
new Date()

previousMonth.setMonth(
previousMonth.getMonth()-1
)

const closingMonth =
previousMonth.getMonth()+1

const closingYear =
previousMonth.getFullYear()

setClosingData(
    closingRes.data || []
    )

}

const previousMonth =
new Date()

previousMonth.setMonth(
previousMonth.getMonth()-1
)

const closingMonth =
previousMonth.getMonth()+1

const closingYear =
previousMonth.getFullYear()

const inventoryData =
useMemo(()=>{

const result:any = {}

bagNames.forEach(bag=>{

    const closingRow =
closingData.find(
(item:any)=>

item.bag_name ===
bag.bag_name

&&

(
selectedFactory ===
'All Factories'

||

item.factory ===
selectedFactory
)

&&

item.month ===
closingMonth

&&

item.year ===
closingYear
)

const openingRow =
openingStock.find(
item =>
item.bag_name ===
bag.bag_name
)
    
    result[
    bag.bag_name
    ] = {
    
    bag_name:
    bag.bag_name,
    
    minimum_stock:
    Number(
    openingRow?.minimum_stock || 0
    ),
    
    opening:

closingRow

?

Number(
closingRow.empty_stock || 0
)

:

Number(
openingRow?.opening_quantity || 0
),
    
    inward:0,
    
    transferIn:0,
    
    transferOut:0,
    
    consumed:0,
    
    balance:0,
    
    openingFinished:

    Number(
    closingRow
    ?.finished_stock || 0
    ),
    
    produced:0,
    
    dispatched:0,
    
    finishedBalance:0
    
    }
    
    });
(Object.values(result) as any []).forEach(
    (item:any)=>{
    
    const bagName =
    item.bag_name
    
    const inward =
    inwardEntries.filter(
    entry=>{
    
    if(
    selectedFactory !==
    'All Factories'
    ){
    
    return (
    entry.bag_name === bagName &&
    entry.factory === selectedFactory
    )
    
    }
    
    return (
    entry.bag_name === bagName
    )
    
    }
    )
    
    item.inward =
    inward.reduce(
    (sum:number,row:any)=>
    sum +
    Number(
    row.quantity || 0
    ),
    0
    )
    
    const transferIn =
    transfers.filter(
    transfer=>{
    
    if(
    selectedFactory !==
    'All Factories'
    ){
    
    return (
    transfer.bag_name === bagName &&
    transfer.to_factory === selectedFactory
    )
    
    }
    
    return (
    transfer.bag_name === bagName
    )
    
    }
    )
    
    item.transferIn =
    transferIn.reduce(
    (sum:number,row:any)=>
    sum +
    Number(
    row.quantity || 0
    ),
    0
    )
    
    const transferOut =
    transfers.filter(
    transfer=>{
    
    if(
    selectedFactory !==
    'All Factories'
    ){
    
    return (
    transfer.bag_name === bagName &&
    transfer.from_factory === selectedFactory
    )
    
    }
    
    return (
    transfer.bag_name === bagName
    )
    
    }
    )
    
    item.transferOut =
    transferOut.reduce(
    (sum:number,row:any)=>
    sum +
    Number(
    row.quantity || 0
    ),
    0
    )
    
    const production =
    productionEntries.filter(
    entry=>{
    
    if(
    selectedFactory !==
    'All Factories'
    ){
    
    return (
    entry.bag_name === bagName &&
    entry.factory === selectedFactory
    )
    
    }
    
    return (
    entry.bag_name === bagName
    )
    
    }
    )
    
    item.consumed =
    production.reduce(
    (sum:number,row:any)=>
    sum +
    Number(
    row.quantity || 0
    ),
    0
    )
    
    item.produced =
    item.consumed
    
    const dispatch =
    dispatchEntries.filter(
    entry=>{
    
    if(
    selectedFactory !==
    'All Factories'
    ){
    
    return (
    entry.bag_name === bagName &&
    entry.factory === selectedFactory
    )
    
    }
    
    return (
    entry.bag_name === bagName
    )
    
    }
    )
    
    item.dispatched =
dispatch.reduce(
(sum:number,row:any)=>
sum +
Number(
row.dispatch_bags || 0
),
0
)
    
    item.balance =
    
    item.opening +
    item.inward +
    item.transferIn -
    item.transferOut -
    item.consumed
    
    item.finishedBalance =

item.openingFinished +

item.produced -

item.dispatched
    
    }
    )
    
    return Object.values(result) as any []
    
    },[
    bagNames,
    openingStock,
    inwardEntries,
    transfers,
    productionEntries,
    dispatchEntries,
    closingData,
    selectedFactory
    ])
    
    const totalEmptyStock =
    inventoryData.reduce(
    (sum:any,row:any)=>
    sum +
    row.balance,
    0
    )
    
    const totalFinishedStock =
    inventoryData.reduce(
    (sum:any,row:any)=>
    sum +
    row.finishedBalance,
    0
    )
    
    
    return (

        <div className="p-4 md:p-6 space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between gap-4">
        
        <div>
        
        <p className="text-slate-500">
        Inventory Management
        </p>
        
        <h1 className="text-4xl font-bold">
        Inventory Dashboard
        </h1>
        
        </div>
        
        <select
value={selectedFactory}
onChange={(e)=>
setSelectedFactory(
e.target.value
)
}
disabled={
userFactory !== ''
}
className="
border
rounded-xl
p-3
bg-white
disabled:bg-slate-100
disabled:cursor-not-allowed
"
>
        
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-6 rounded-3xl">
        
        <p className="text-slate-500">
        Empty Bags Stock
        </p>
        
        <h1 className="text-3xl font-bold">
        {totalEmptyStock.toLocaleString()}
        </h1>
        
        </div>
        
        <div className="bg-white p-6 rounded-3xl">
        
        <p className="text-slate-500">
        Finished Goods
        </p>
        
        <h1 className="text-3xl font-bold">
        {totalFinishedStock.toLocaleString()}
        </h1>
        
        </div>
        <div className="bg-white p-6 rounded-3xl">

<p className="text-slate-500">
Monthly Production
</p>

<h1 className="text-3xl font-bold">
{
productionEntries
.filter(row=>{

const date =
new Date(
row.production_date
)

const now =
new Date()

return (
date.getMonth() ===
now.getMonth()
&&
date.getFullYear() ===
now.getFullYear()
)

})
.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)
.toLocaleString()
}
</h1>

</div>
<div className="bg-white p-6 rounded-3xl">

<p className="text-slate-500">
Monthly Dispatch
</p>

<h1 className="text-3xl font-bold">
{
dispatchEntries
.filter(row=>{

const date =
new Date(
row.dispatch_date
)

const now =
new Date()

return (
date.getMonth() ===
now.getMonth()
&&
date.getFullYear() ===
now.getFullYear()
)

})
.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)
.toLocaleString()
}
</h1>

</div>
        
        </div>
        
        <div className="bg-white rounded-3xl p-6">
        
        <h2 className="text-2xl font-bold mb-4">
        Low Stock Alerts
        </h2>
        
        <div className="space-y-3">
        
        {inventoryData
        .filter(
        (item:any)=>
        item.balance <
        item.minimum_stock
        )
        .map(
        (item:any)=>(
        <div
        key={item.bag_name}
        className="border border-red-200 bg-red-50 rounded-xl p-4"
        >
        
        <p className="font-semibold text-red-700">
        
        ⚠ {item.bag_name}
        
        </p>
        
        <p className="text-sm text-red-600">
        
        Balance:
        {' '}
        {item.balance}
        
        {' | '}
        
        Minimum:
        {' '}
        {item.minimum_stock}
        
        </p>
        
        </div>
        )
        )}
        
        {inventoryData.filter(
        (item:any)=>
        item.balance <
        item.minimum_stock
        ).length === 0 && (
        
        <p className="text-green-600">
        No Low Stock Items
        </p>
        
        )}
        
        </div>
        
        </div>
        
        <div className="bg-white rounded-3xl overflow-x-auto">
        
        <div className="p-6">
        
        <h2 className="text-2xl font-bold">
        Empty Bags Inventory
        </h2>
        
        </div>
        
        <table className="min-w-[1200px] w-full text-sm">
        
        <thead className="bg-slate-100">
        
        <tr>
        
        <th className="p-4 text-left">
        Bag Name
        </th>
        
        <th className="p-4 text-left">
        Opening
        </th>
        
        <th className="p-4 text-left">
        Inward
        </th>
        
        <th className="p-4 text-left">
        Transfer In
        </th>
        
        <th className="p-4 text-left">
        Transfer Out
        </th>
        
        <th className="p-4 text-left">
        Consumed
        </th>
        
        <th className="p-4 text-left">
        Balance
        </th>
        
        <th className="p-4 text-left">
        Min Stock
        </th>

        <th className="p-4 text-left">
        Status
        </th>
        
        </tr>
        
        </thead>
        
        <tbody>
        
        {inventoryData
.filter(
(item:any)=>

item.opening > 0 ||
item.inward > 0 ||
item.transferIn > 0 ||
item.transferOut > 0 ||
item.consumed > 0
)
.map(
        (item:any)=>(
        
        <tr
        key={item.bag_name}
        className="border-b"
        >
        
        <td className="p-4">
        {item.bag_name}
        </td>
        
        <td className="p-4">
        {item.opening}
        </td>
        
        <td className="p-4">
        {item.inward}
        </td>
        
        <td className="p-4">
        {item.transferIn}
        </td>
        
        <td className="p-4">
        {item.transferOut}
        </td>
        
        <td className="p-4">
        {item.consumed}
        </td>
        
        <td className="p-4 font-semibold">
        {item.balance}
        </td>
        
        <td className="p-4">
        {item.minimum_stock}
        </td>

        <td className="p-4">

        {item.balance <
        item.minimum_stock ? (

            <span className="text-red-600 font-semibold">
            LOW
            </span>

        ) : (

            <span className="text-green-600 font-semibold">
            OK
            </span>

        )}

        </td>
        
        </tr>
        
        )
        )}
        
        </tbody>
        
        </table>
        
        </div>
        
        <div className="bg-white rounded-3xl overflow-x-auto">
        
        <div className="p-6">
        
        <h2 className="text-2xl font-bold">
        Finished Goods Inventory
        </h2>
        
        </div>
        
        <table className="min-w-[900px] w-full text-sm">
        
        <thead className="bg-slate-100">
        
        <tr>
        
        <th className="p-4 text-left">
        Bag Name
        </th>

        <th className="p-4 text-left">
Opening Finished
</th>
        
        <th className="p-4 text-left">
        Produced
        </th>
        
        <th className="p-4 text-left">
        Dispatched Bags
        </th>
        
        <th className="p-4 text-left">
        Balance
        </th>
        
        </tr>
        
        </thead>
        
        <tbody>
        
        {inventoryData
.filter(
(item:any)=>

item.produced > 0 ||
item.dispatched > 0 ||
item.finishedBalance > 0
)
.map(
        (item:any)=>(
        
        <tr
        key={item.bag_name}
        className="border-b"
        >
        
        <td className="p-4">
        {item.bag_name}
        </td>

        <td className="p-4">
{item.openingFinished}
</td>
        
        <td className="p-4">
        {item.produced}
        </td>
        
        <td className="p-4">
        {item.dispatched}
        </td>
        
        <td className="p-4 font-semibold">
        {item.finishedBalance}
        </td>
        
        </tr>
        
        )
        )}
        
        </tbody>
        
        </table>
        
        </div>
        
        </div>
        
        )
        
        }