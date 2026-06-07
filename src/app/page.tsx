'use client'

import {
  useEffect,
  useMemo,
  useState
} from 'react'

import { useRouter }
from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {

  const router =
  useRouter()

  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState('month')

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [dispatchEntries,setDispatchEntries] =
useState<any[]>([])

const [openingStock,setOpeningStock] =
useState<any[]>([])

const [inwardEntries,setInwardEntries] =
useState<any[]>([])
const [userFactory,setUserFactory] =
useState('')
  

  useEffect(() => {

    checkAuth()
  
  }, [])
  
  async function checkAuth(){
  
    const {
      data: { user }
    } =
    await supabase.auth.getUser()
  
    if(!user){
  
      router.push(
        '/login'
      )
  
      return
  
    }
  
    const factory =
localStorage.getItem(
'userFactory'
) || ''

setUserFactory(factory)

loadData(factory)
  
  }

  async function loadData(
factoryFilter = ''
) {

    const [
      productionRes,
      dispatchRes,
      openingRes,
      inwardRes
      ] = await Promise.all([
      
      supabase
      .from('production_entries')
      .select('*')
      .order('production_date',{
      ascending:true
      }),
      
      supabase
      .from('dispatch_entries')
      .select('*'),
      
      supabase
      .from('opening_quantity')
      .select('*'),
      
      supabase
      .from('empty_bag_inward')
      .select('*')
      
      ])

      const productionData =

factoryFilter

? (productionRes.data || [])
.filter(
row =>
row.factory ===
factoryFilter
)

: (
productionRes.data || []
)

setEntries(
productionData
)

        
        
const dispatchData =

factoryFilter

? (dispatchRes.data || [])
.filter(
row =>
row.factory ===
factoryFilter
)

: (
dispatchRes.data || []
)

setDispatchEntries(
dispatchData
)
        
        setOpeningStock(
        openingRes.data || []
        )
        
        const inwardData =

factoryFilter

? (inwardRes.data || [])
.filter(
row =>
row.factory ===
factoryFilter
)

: (
inwardRes.data || []
)

setInwardEntries(
inwardData
)
      }

  function calculateTons(
    bagType: string,
    quantity: number
  ) {

    const type =
      bagType?.toLowerCase() || ''

    if (type.includes('1400'))
      return quantity * 1.4

    if (type.includes('1350'))
      return quantity * 1.35

    if (type.includes('1250'))
      return quantity * 1.25

    if (
      type.includes('50kg') ||
      type.includes('50 kg')
    )
      return quantity * 0.05

    return 0
  }

  const filteredEntries = useMemo(() => {

    let filtered = [...entries]
  
    if (filter === 'month') {
  
      const now = new Date()
  
      const currentMonth =
        now.getMonth()
  
      const currentYear =
        now.getFullYear()
  
      filtered = filtered.filter(
        item => {
  
          const date =
            new Date(
              item.production_date
            )
  
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          )
  
        }
      )
  
    }
  
    if (filter === 'custom') {
  
      if (fromDate) {
  
        filtered =
          filtered.filter(
            item =>
              item.production_date >=
              fromDate
          )
  
      }
  
      if (toDate) {
  
        filtered =
          filtered.filter(
            item =>
              item.production_date <=
              toDate
          )
  
      }
  
    }
  
    return filtered
  
  }, [
    entries,
    filter,
    fromDate,
    toDate
  ])

  const totalTons =
    filteredEntries.reduce(
      (sum, item) =>
        sum +
        calculateTons(
          item.bag_type,
          Number(item.quantity || 0)
        ),
      0
    )

  const totalBags =
    filteredEntries.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),
      0
    )

  const totalAmount =
    filteredEntries.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    )

  const activeMachines =
    [
      ...new Set(
        filteredEntries.map(
          item => item.machine
        )
      )
    ].length

  const activeLabour =
    [
      ...new Set(
        filteredEntries.map(
          item =>
            item.labour_name
        )
      )
    ].length

  const totalEntries =
    filteredEntries.length

    const totalDispatchQty =

dispatchEntries.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)



    const currentEmptyStock =

openingStock.reduce(
(sum,row)=>
sum +
Number(
row.opening_quantity || 0
),
0
)

+

inwardEntries.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)

-

entries.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)

const currentFinishedStock =

entries.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)

-

dispatchEntries.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)

const lowStockItems =

openingStock.filter(
stock=>{

const opening =
Number(
stock.opening_quantity || 0
)

const inward =
inwardEntries
.filter(
i=>
i.bag_name ===
stock.bag_name
)
.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)

const produced =
entries
.filter(
i=>
i.bag_name ===
stock.bag_name
)
.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)

const balance =

opening +
inward -
produced

return (
balance <
Number(
stock.minimum_stock || 0
)
)

}).length

  // MONTHLY CHART
  // NOT DAILY

  const monthlyTrend =
    Object.values(

      entries.reduce(
        (acc: any, item) => {

          const date =
            new Date(
              item.production_date
            )

          const monthKey =
            `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, '0')}`

          if (!acc[monthKey]) {

            acc[monthKey] = {
              month: monthKey,
              tons: 0
            }
          }

          acc[monthKey].tons +=
            calculateTons(
              item.bag_type,
              Number(
                item.quantity || 0
              )
            )

          return acc

        },
        {}
      )

    )

    const monthlyDispatchTrend =
Object.values(

dispatchEntries.reduce(
(acc:any,item)=>{

const date =
new Date(
item.dispatch_date
)

const monthKey =
`${date.getFullYear()}-${String(
date.getMonth()+1
).padStart(2,'0')}`

if(!acc[monthKey]){

acc[monthKey]={
month:monthKey,
qty:0
}

}

acc[monthKey].qty +=
Number(
item.quantity || 0
)

return acc

},
{}
)

)

const maxProductionValue =
Math.max(
...monthlyTrend.map(
(item:any)=>
item.tons
),
1
)

const maxDispatchValue =
Math.max(
...monthlyDispatchTrend.map(
(item:any)=>
item.qty
),
1
)

  const bagWise =
    Object.values(

      filteredEntries.reduce(
        (acc: any, item) => {

          const key =
            item.bag_name ||
            'Unknown'

          if (!acc[key]) {

            acc[key] = {
              bag: key,
              bags: 0,
              tons: 0
            }
          }

          acc[key].bags +=
            Number(
              item.quantity || 0
            )

          acc[key].tons +=
            calculateTons(
              item.bag_type,
              Number(
                item.quantity || 0
              )
            )

          return acc

        },
        {}
      )

    )

  const machineWise =
    Object.values(

      filteredEntries.reduce(
        (acc: any, item) => {

          const key =
            `${item.factory}-${item.machine}`

          if (!acc[key]) {

            acc[key] = {
              factory:
                item.factory,

              machine:
                item.machine,

              bags: 0,
              tons: 0
            }
          }

          acc[key].bags +=
            Number(
              item.quantity || 0
            )

          acc[key].tons +=
            calculateTons(
              item.bag_type,
              Number(
                item.quantity || 0
              )
            )

          return acc

        },
        {}
      )

    )

  const labourWise =
    Object.values(

      filteredEntries.reduce(
        (acc: any, item) => {

          const key =
            item.labour_name

          if (!acc[key]) {

            acc[key] = {
              labour: key,
              bags: 0,
              tons: 0
            }
          }

          acc[key].bags +=
            Number(
              item.quantity || 0
            )

          acc[key].tons +=
            calculateTons(
              item.bag_type,
              Number(
                item.quantity || 0
              )
            )

          return acc

        },
        {}
      )

    )

  return (

    <div className='p-4 md:p-6 space-y-6'>

      {/* HEADER */}

      <div className='flex flex-col lg:flex-row justify-between gap-4'>

        <div>
          <p className='text-slate-500'>
            Production Management
          </p>

          <h1 className='text-4xl font-bold text-slate-900'>
            KM Factory
          </h1>
        </div>

        <div className='flex gap-3'>

          <button
            onClick={() =>
              setFilter('month')
            }
            className={`px-6 py-3 rounded-xl border font-medium transition ${filter === 'month'
                ? 'bg-slate-900 text-white'
                : 'bg-white'
              }`}
          >
            This Month
          </button>

          <button
            onClick={() =>
              setFilter('custom')
            }
            className={`px-6 py-3 rounded-xl border font-medium transition ${filter === 'custom'
                ? 'bg-slate-900 text-white'
                : 'bg-white'
              }`}
          >
            Custom
          </button>

        </div>

      </div>

      {/* CUSTOM DATES */}

      {
        filter === 'custom' && (

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

            <input
              type='date'
              value={fromDate}
              onChange={e =>
                setFromDate(
                  e.target.value
                )
              }
              className='border rounded-xl p-4 bg-white'
            />

            <input
              type='date'
              value={toDate}
              onChange={e =>
                setToDate(
                  e.target.value
                )
              }
              className='border rounded-xl p-4 bg-white'
            />

          </div>

        )
      }

      {/* KPI CARDS */}

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>

        <Card
          title='Goods Produced'
          value={`${totalTons.toFixed(2)} T`}
        />

        <Card
          title='Total Bags'
          value={totalBags}
        />

        <Card
          title='Empty Stock'
          value={currentEmptyStock}
        />

        <Card
          title='Finished Stock'
          value={Number(currentFinishedStock).toFixed(2)}
        />

        <Card 
          title='Dispatch Qty' 
          value={Number(totalDispatchQty).toFixed(2)}
        />


      </div>

      {/* MONTHLY TREND */}

      <div className='bg-white rounded-3xl border p-6 shadow-sm'>

        <h2 className='text-2xl font-semibold mb-8'>
          Monthly Production Trend
        </h2>

        <div className='flex items-end gap-4 h-[320px] pt-12 overflow-x-auto'>

          {
            monthlyTrend.map(
              (item: any) => (

                <div
  key={item.month}
  className='flex flex-col items-center min-w-[80px]'
>

<div
className='text-xs font-semibold text-slate-700 mb-2 h-5'
>
{item.tons.toFixed(1)}
</div>

  <div
    className='w-full rounded-t-xl bg-blue-300 hover:bg-blue-400 transition'
    style={{
      height:
`${Math.max(
(item.tons / maxProductionValue) * 250,
30
)}px`
    }}
  />

  <p className='text-sm mt-3 text-slate-600'>
    {item.month}
  </p>

</div>

              )
            )
          }

        </div>

      </div>


      <div className='bg-white rounded-3xl border p-6 shadow-sm'>

  <h2 className='text-2xl font-semibold mb-8'>
    Monthly Dispatch Trend
  </h2>

  <div className='flex items-end gap-4 h-[320px] overflow-x-auto'>

    {
      monthlyDispatchTrend.map(
        (item:any)=>(
          
          <div
  key={item.month}
  className='flex flex-col items-center min-w-[80px]'
>

  <p className='text-xs font-semibold text-slate-700 mb-2'>
    {Number(item.qty).toFixed(2)}
  </p>

  <div
    className='w-full rounded-t-xl bg-green-300 hover:bg-green-400 transition'
    style={{
      height:
`${Math.max(
(item.qty / maxDispatchValue) * 250,
30
)}px`
    }}
  />

  <p className='text-sm mt-3 text-slate-600'>
    {item.month}
  </p>

</div>

        )
      )
    }

  </div>

</div>



      {/* TABLES */}

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>

        {/* BAG WISE */}

        <TableCard
          title='Bag-wise Production'
          headers={[
            'Bag',
            'Bags',
            'Goods(T)'
          ]}
          rows={
            bagWise.map(
              (item: any) => [
                item.bag,
                item.bags,
                item.tons.toFixed(2)
              ]
            )
          }
        />

        {/* MACHINE */}

        <TableCard
          title='Factory + Machine Performance'
          headers={[
            'Factory',
            'Machine',
            'Bags',
            'Goods(T)'
          ]}
          rows={
            machineWise.map(
              (item: any) => [
                item.factory,
                item.machine,
                item.bags,
                item.tons.toFixed(2)
              ]
            )
          }
        />

        {/* LABOUR */}

        <TableCard
          title='Labour Performance'
          headers={[
            'Labour',
            'Bags',
            'Goods(T)'
          ]}
          rows={
            labourWise.map(
              (item: any) => [
                item.labour,
                item.bags,
                item.tons.toFixed(2)
              ]
            )
          }
        />

      </div>

    </div>
  )
}

function Card({
  title,
  value
}: any) {

  return (

    <div className='bg-white border rounded-3xl p-5 shadow-sm'>

      <p className='text-slate-500 text-sm'>
        {title}
      </p>

      <h2 className='text-3xl font-bold mt-2 text-slate-900'>
        {value}
      </h2>

    </div>

  )
}

function TableCard({
  title,
  headers,
  rows
}: any) {

  return (

    <div className='bg-white rounded-3xl border shadow-sm overflow-hidden'>

      <div className='p-5 border-b'>
        <h2 className='text-xl font-semibold'>
          {title}
        </h2>
      </div>

      <div className='overflow-x-auto'>

        <table className='w-full text-sm'>

          <thead className='bg-slate-50'>

            <tr>

              {
                headers.map(
                  (head: string) => (

                    <th
                      key={head}
                      className='text-left p-4 font-semibold'
                    >
                      {head}
                    </th>

                  )
                )
              }

            </tr>

          </thead>

          <tbody>

            {
              rows.map(
                (
                  row: any,
                  index: number
                ) => (

                  <tr
                    key={index}
                    className='border-t'
                  >

                    {
                      row.map(
                        (
                          cell: any,
                          i: number
                        ) => (

                          <td
                            key={i}
                            className='p-4'
                          >
                            {cell}
                          </td>

                        )
                      )
                    }

                  </tr>

                )
              )
            }

          </tbody>

        </table>

      </div>

    </div>

  )
}