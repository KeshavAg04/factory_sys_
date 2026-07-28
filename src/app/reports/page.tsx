'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'
import {
groupByFinancialYearAndMonth
} from '@/lib/financialYear'
import RoleGuard
from '@/components/RoleGuard'

export default function ReportsPage(){
const [entries,setEntries]=useState<any[]>([])
const [mode,setMode]=useState<'detailed'|'summary'>('detailed')
const [summaryBy,setSummaryBy]=useState('bag_name')
const [search,setSearch]=useState('')
const [factory,setFactory]=useState('')
const [machine,setMachine]=useState('')
const [labour,setLabour]=useState('')
const [shift,setShift]=useState('')
const [mesh,setMesh]=useState('')
const [bagType,setBagType]=useState('')
const [bagName,setBagName]=useState('')
const [fromDate,setFromDate]=useState('')
const [toDate,setToDate]=useState('')
const [period,setPeriod]=useState('month')
const [userFactory,setUserFactory] =
useState('')
const [expandedFinancialYears,setExpandedFinancialYears] =
useState<Record<string,boolean>>({})

useEffect(()=>{

  const factory =
  localStorage.getItem(
  'userFactory'
  ) || ''
  
  setUserFactory(factory)
  
  loadEntries(factory)
  
  },[])

  async function loadEntries(
    factoryFilter=''
    ){
 const {data,error}=await supabase
 .from('production_entries')
 .select('*')
 .order('production_date',{ascending:false})

 if(error){console.log(error);return}
 const filteredData =

factoryFilter

? (data || []).filter(
row =>
row.factory ===
factoryFilter
)

: (
data || []
)

setEntries(
filteredData
)
}

function tons(type:string,qty:number){
 if(!type) return 0
 const t=type.toLowerCase()
 if(t.includes('1400')) return qty*1.4
 if(t.includes('1350')) return qty*1.35
 if(t.includes('1250')) return qty*1.25
 if(t.includes('50kg')||t.includes('50 kg')||t==='50kg') return qty*.05
 return 0
}

const values=(key:string)=>[...new Set(entries.map(e=>e[key]).filter(Boolean))]

const filtered=useMemo(()=>entries.filter(e=>{

    const entryDate =
    new Date(e.production_date)
   
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
   
    if(search && !JSON.stringify(e).toLowerCase().includes(search.toLowerCase())) return false
    if(factory && e.factory!==factory) return false
    if(machine && e.machine!==machine) return false
    if(labour && !(e.labour_name||'').toLowerCase().includes(labour.toLowerCase())) return false
    if(shift && e.shift!==shift) return false
    if(mesh && e.mesh!==mesh) return false
    if(bagType && e.bag_type!==bagType) return false
    if(bagName && e.bag_name!==bagName) return false
   
    if(period==='custom'){
   
     if(fromDate && e.production_date<fromDate) return false
     if(toDate && e.production_date>toDate) return false
   
    }
   
    return true
   
   }),[
    entries,
    search,
    factory,
    machine,
    labour,
    shift,
    mesh,
    bagType,
    bagName,
    fromDate,
    toDate,
    period
   ])

const totalQty=filtered.reduce((a,b)=>a+Number(b.quantity||0),0)
const totalAmount=filtered.reduce((a,b)=>a+Number(b.amount||0),0)
const totalTons=filtered.reduce((a,b)=>a+tons(b.bag_type,Number(b.quantity||0)),0)
const totalEntries = filtered.length

const financialYearGroups =
useMemo(
()=>groupByFinancialYearAndMonth(
filtered,
(entry:any)=>entry.production_date
),
[
filtered
]
)

function isFinancialYearExpanded(
key:string
){
return expandedFinancialYears[key] ?? true
}

const summary=Object.values(filtered.reduce((acc:any,e)=>{
 let key=''
 switch(summaryBy){
 case 'bag_type': key=e.bag_type; break
 case 'bag_type_name': key=`${e.bag_type}-${e.bag_name}`; break
 case 'bag_mesh': key=`${e.bag_type} (${e.mesh})`; break
 case 'labour': key=e.labour_name; break
 case 'machine': key=e.machine; break
 case 'factory': key=e.factory; break
 case 'shift': key=e.shift; break
 case 'mesh': key=e.mesh; break
 default:key=e.bag_name
 }
 if(!acc[key]) acc[key]={name:key,qty:0,tons:0,amount:0}
 acc[key].qty+=Number(e.quantity||0)
 acc[key].tons+=tons(e.bag_type,Number(e.quantity||0))
 acc[key].amount+=Number(e.amount||0)
 return acc
},{}))

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
    'Report'
    )
    
    let fileName=name
    
    // add summary mode name
    
    if(
    mode==='summary'
    ){
    
    fileName+=
    `-${summaryBy}`
    
    }
    
    // add labour
    
    if(labour){
    
    fileName+=
    `-${labour}`
    
    }
    
    // add factory
    
    if(factory){
    
    fileName+=
    `-${factory}`
    
    }
    
    // add machine
    
    if(machine){
    
    fileName+=
    `-${machine}`
    
    }
    
    // add dates
    
    if(fromDate){
    
    fileName+=
    `-${fromDate}`
    
    }
    
    if(toDate){
    
    fileName+=
    `-to-${toDate}`
    
    }
    
    fileName=
    fileName
    .replaceAll(
    ' ',
    '-'
    )
    
    XLSX.writeFile(
    wb,
    `${fileName}.xlsx`
    )
    
    }

return <div className='p-4 md:p-6 space-y-6'>
<RoleGuard
allowedRoles={[
'Admin',
'production'
]}
>
<div className='flex flex-col md:flex-row justify-between gap-4'>
<div><p className='text-slate-500'>Production Management</p><h1 className='text-4xl font-bold'>Reports</h1></div>
<div className='space-y-3'>

  <div className='flex gap-3'>

    <button
      onClick={()=>setMode('detailed')}
      className={`px-5 py-3 rounded-xl transition ${
        mode==='detailed'
        ?'bg-slate-900 text-white'
        :'bg-white border'
      }`}
    >
      Detailed
    </button>

    <button
      onClick={()=>setMode('summary')}
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
      onClick={()=>setPeriod('month')}
      className={`px-5 py-3 rounded-xl transition ${
        period==='month'
        ?'bg-blue-600 text-white'
        :'bg-white border'
      }`}
    >
      This Month
    </button>

    <button
      onClick={()=>setPeriod('lastMonth')}
      className={`px-5 py-3 rounded-xl transition ${
        period==='lastMonth'
        ?'bg-blue-600 text-white'
        :'bg-white border'
      }`}
    >
      Last Month
    </button>

    <button
      onClick={()=>setPeriod('custom')}
      className={`px-5 py-3 rounded-xl transition ${
        period==='custom'
        ?'bg-blue-600 text-white'
        :'bg-white border'
      }`}
    >
      Custom Range
    </button>

  </div>

</div></div>

<div className='bg-white rounded-3xl p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
<input placeholder='Search' value={search} onChange={e=>setSearch(e.target.value)} className='border rounded-xl p-3'/>
<input list='labours' placeholder='Labour' value={labour} onChange={e=>setLabour(e.target.value)} className='border rounded-xl p-3'/>
<datalist id='labours'>{values('labour_name').map((v:any)=><option key={v} value={v}/> )}</datalist>
<select
value={
userFactory ||
factory
}
onChange={e=>setFactory(e.target.value)}
disabled={
userFactory !== ''
}
className='border rounded-xl p-3 disabled:bg-slate-100'
><option value=''>All Factories</option>{values('factory').map((v:any)=><option key={v}>{v}</option>)}</select>
<select value={machine} onChange={e=>setMachine(e.target.value)} className='border rounded-xl p-3'><option value=''>All Machines</option>{values('machine').map((v:any)=><option key={v}>{v}</option>)}</select>
<select value={shift} onChange={e=>setShift(e.target.value)} className='border rounded-xl p-3'><option value=''>All Shifts</option><option>Day</option><option>Night</option></select>
<select value={mesh} onChange={e=>setMesh(e.target.value)} className='border rounded-xl p-3'><option value=''>All Mesh</option>{values('mesh').map((v:any)=><option key={v}>{v}</option>)}</select>
<select value={bagType} onChange={e=>setBagType(e.target.value)} className='border rounded-xl p-3'><option value=''>All Bag Types</option>{values('bag_type').map((v:any)=><option key={v}>{v}</option>)}</select>
<select value={bagName} onChange={e=>setBagName(e.target.value)} className='border rounded-xl p-3'><option value=''>All Bag Names</option>{values('bag_name').map((v:any)=><option key={v}>{v}</option>)}</select>
<input type='date' value={fromDate} onChange={e=>setFromDate(e.target.value)} className='border rounded-xl p-3'/>
<input type='date' value={toDate} onChange={e=>setToDate(e.target.value)} className='border rounded-xl p-3'/>
</div>

<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
<div className='bg-white p-6 rounded-3xl'><p>Total Bags</p><h1 className='text-3xl font-bold'>{totalQty.toLocaleString('en-IN')}</h1></div>
<div className='bg-white p-6 rounded-3xl'><p>Goods Produced</p><h1 className='text-3xl font-bold'>{totalTons.toFixed(2)} T</h1></div>
<div className='bg-white p-6 rounded-3xl'><p>Total Amount</p><h1 className='text-3xl font-bold'>₹{totalAmount.toLocaleString('en-IN')}</h1></div>
<div className='bg-white p-6 rounded-3xl'>
  <p>Production Entries</p>

  <h1 className='text-3xl font-bold'>
    {totalEntries}
  </h1>
</div>
</div>

<div className='flex flex-col md:flex-row justify-between gap-3'>
{mode==='summary' && <select value={summaryBy} onChange={e=>setSummaryBy(e.target.value)} className='border rounded-xl p-3'><option value='bag_name'>Bag Name</option><option value='bag_type'>Bag Type</option><option value='bag_type_name'>Bag+Name</option><option value='bag_mesh'>Bag+Mesh</option><option value='labour'>Labour</option><option value='machine'>Machine</option>{!userFactory && (

<option value='factory'>
Factory
</option>

)}<option value='shift'>Shift</option><option value='mesh'>Mesh</option></select>}
<button onClick={()=>exportExcel(mode==='detailed'?filtered:summary,mode)} className='bg-slate-900 text-white px-5 py-3 rounded-xl'>Export Excel</button>
</div>

{mode==='summary' && <div className='bg-white rounded-3xl p-4 md:p-6 overflow-x-auto'><table className='min-w-[900px] w-full text-sm'><thead className='bg-slate-100'><tr className='text-left'><th className='p-4'>Category</th><th className='p-4'>Bags</th><th className='p-4'>Goods(T)</th><th className='p-4'>Amount</th></tr></thead><tbody>{summary.map((r:any)=><tr key={r.name} className='border-b'><td className='p-4'>{r.name}</td><td className='p-4'>{r.qty.toLocaleString('en-IN')}</td><td className='p-4'>{r.tons.toFixed(2)}</td><td className='p-4'>₹{r.amount.toLocaleString('en-IN')}</td></tr>)}</tbody></table></div>}

{mode==='detailed' && <div className='bg-white rounded-3xl overflow-x-auto'><table className='min-w-[1200px] w-full text-sm'><thead className='bg-slate-100'><tr className='text-left'><th className='p-4'>Date</th><th className='p-4'>Factory</th><th className='p-4'>Machine</th><th className='p-4'>Labour</th><th className='p-4'>Shift</th><th className='p-4'>Mesh</th><th className='p-4'>Bag</th><th className='p-4'>Qty</th><th className='p-4'>Goods(T)</th><th className='p-4'>Rate</th><th className='p-4'>Amount</th></tr></thead><tbody>{financialYearGroups.map((fy:any)=>{const expanded=isFinancialYearExpanded(fy.key);return <Fragment key={fy.key}><tr className='bg-slate-200'><td colSpan={11} className='p-4'><button onClick={()=>setExpandedFinancialYears(prev=>({...prev,[fy.key]:!expanded}))} className='font-bold text-slate-900'>{expanded?'v':'>'} {fy.label}</button></td></tr>{expanded && fy.months.map((month:any)=><Fragment key={month.key}><tr className='bg-slate-50'><td colSpan={11} className='p-4 font-semibold text-slate-700'>{month.label}</td></tr>{month.items.map((e:any)=><tr key={e.id} className='border-b'><td className='p-4'>{e.production_date}</td><td className='p-4'>{e.factory}</td><td className='p-4'>{e.machine}</td><td className='p-4'>{e.labour_name}</td><td className='p-4'>{e.shift}</td><td className='p-4'>{e.mesh}</td><td className='p-4'>{e.bag_name}</td><td className='p-4'>{Number(e.quantity || 0).toLocaleString('en-IN')}</td><td className='p-4'>{tons(e.bag_type,Number(e.quantity)).toFixed(2)}</td><td className='p-4'>₹{Number(e.rate || 0).toLocaleString('en-IN')}</td><td className='p-4'>₹{Number(e.amount || 0).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</td></tr>)}</Fragment>)}</Fragment>})}</tbody></table></div>}
</RoleGuard>
</div>

}

