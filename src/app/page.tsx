'use client'

import {
  useEffect,
  useMemo,
  useState
} from 'react'

import { useRouter }
from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  groupByFinancialYearAndMonth,
} from '@/lib/financialYear'

export default function DashboardPage() {

  const router =
  useRouter()

  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState('month')

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [dispatchEntries,setDispatchEntries] =
useState<any[]>([])

const [userFactory,setUserFactory] =
useState('')

const [expandedProductionFY,setExpandedProductionFY] =
useState<Record<string,boolean>>({})

const [expandedDispatchFY,setExpandedDispatchFY] =
useState<Record<string,boolean>>({})
  

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


  async function loadData(
factoryFilter = ''
) {

    const [
      productionRes,
      dispatchRes,
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
)}

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


  const filteredDispatchEntries = useMemo(() => {

    let filtered = [...dispatchEntries]
  
    if (filter === 'month') {
  
      const now = new Date()
  
      filtered = filtered.filter(item => {
  
        const date = new Date(
          item.dispatch_date
        )
  
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )
  
      })
  
    }
  
    if (filter === 'custom') {
  
      if (fromDate) {
  
        filtered = filtered.filter(
          item =>
            item.dispatch_date >= fromDate
        )
  
      }
  
      if (toDate) {
  
        filtered = filtered.filter(
          item =>
            item.dispatch_date <= toDate
        )
  
      }
  
    }
  
    return filtered
  
  }, [
    dispatchEntries,
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


    const totalDispatchQty =

filteredDispatchEntries.reduce(
(sum,row)=>
sum +
Number(
row.quantity || 0
),
0
)


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

const productionFinancialYears =
useMemo(
()=>
groupByFinancialYearAndMonth(
monthlyTrend as any[],
(item:any)=>
`${item.month}-01`
),
[
monthlyTrend
]
)

const dispatchFinancialYears =
useMemo(
()=>
groupByFinancialYearAndMonth(
monthlyDispatchTrend as any[],
(item:any)=>
`${item.month}-01`
),
[
monthlyDispatchTrend
]
)

function isProductionFYExpanded(
key:string
){
return expandedProductionFY[key] ?? true
}

function isDispatchFYExpanded(
key:string
){
return expandedDispatchFY[key] ?? true
}

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

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

        <Card
          title='Goods Produced'
          value={`${totalTons.toFixed(2)} Ton`}
        />


        <Card 
          title='Goods Dispatched' 
          value={`${Number(totalDispatchQty).toFixed(2)} Ton`}
        />


      </div>

      {/* MONTHLY TREND */}

      <div className='bg-white rounded-3xl border p-6 shadow-sm'>

        <h2 className='text-2xl font-semibold mb-8'>
          Monthly Production Trend
        </h2>

        <div className='space-y-4'>

          {
            productionFinancialYears.map(
              (fy:any) => {

                const fyTotal =
                  fy.months.reduce(
                    (sum:any,month:any)=>
                    sum +
                    month.items.reduce(
                      (monthSum:any,item:any)=>
                      monthSum +
                      Number(item.tons || 0),
                      0
                    ),
                    0
                  )

                const expanded =
                  isProductionFYExpanded(
                    fy.key
                  )

                return (

                  <div
                    key={fy.key}
                    className='border border-slate-200 rounded-2xl overflow-hidden bg-slate-50'
                  >

                    <button
                      onClick={()=>
                        setExpandedProductionFY(
                          prev=>({
                            ...prev,
                            [fy.key]:
                            !expanded
                          })
                        )
                      }
                      className='w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-slate-100 hover:bg-slate-200'
                    >

                      <span className='text-lg font-bold text-slate-900'>
                        {expanded ? 'v' : '>'} {fy.label}
                      </span>

                      <span className='text-sm font-semibold text-slate-600'>
                        {fyTotal.toFixed(2)} Ton
                      </span>

                    </button>

                    {expanded && (

                      <div className='flex items-end gap-5 min-h-[340px] px-5 pb-6 pt-8 overflow-x-auto bg-white'>

                        {
                          fy.months.map(
                            (month:any) => {

                              const item =
                                month.items[0]

                              return (

                                <div
                                  key={month.key}
                                  className='flex flex-col items-center justify-end min-w-[120px]'
                                >

                                  <div className='text-xs font-semibold text-slate-700 mb-2 h-6 leading-6'>
                                    {item.tons.toFixed(1)}
                                  </div>

                                  <div
                                    className='w-full rounded-t-xl bg-blue-300 hover:bg-blue-400 transition'
                                    style={{
                                      height:
                                      `${Math.max(
                                      (item.tons / maxProductionValue) * 210,
                                      30
                                      )}px`
                                    }}
                                  />

                                  <p className='text-sm mt-3 text-slate-600 text-center leading-5 min-h-10'>
                                    {month.label}
                                  </p>

                                </div>
                              )
                            }
                          )
                        }

                      </div>

                    )}

                  </div>
                )
              }
            )
          }

        </div>

      </div>


      <div className='bg-white rounded-3xl border p-6 shadow-sm'>

  <h2 className='text-2xl font-semibold mb-8'>
    Monthly Dispatch Trend
  </h2>

  <div className='space-y-4'>

    {
      dispatchFinancialYears.map(
        (fy:any)=>{

          const fyTotal =
            fy.months.reduce(
              (sum:any,month:any)=>
              sum +
              month.items.reduce(
                (monthSum:any,item:any)=>
                monthSum +
                Number(item.qty || 0),
                0
              ),
              0
            )

          const expanded =
            isDispatchFYExpanded(
              fy.key
            )

          return (

            <div
              key={fy.key}
              className='border border-slate-200 rounded-2xl overflow-hidden bg-slate-50'
            >

              <button
                onClick={()=>
                  setExpandedDispatchFY(
                    prev=>({
                      ...prev,
                      [fy.key]:
                      !expanded
                    })
                  )
                }
                className='w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-slate-100 hover:bg-slate-200'
              >

                <span className='text-lg font-bold text-slate-900'>
                  {expanded ? 'v' : '>'} {fy.label}
                </span>

                <span className='text-sm font-semibold text-slate-600'>
                  {Number(fyTotal).toFixed(2)} Ton
                </span>

              </button>

              {expanded && (

                <div className='flex items-end gap-5 min-h-[340px] px-5 pb-6 pt-8 overflow-x-auto bg-white'>

                  {
                    fy.months.map(
                      (month:any)=>{

                        const item =
                          month.items[0]

                        return (

                          <div
                            key={month.key}
                            className='flex flex-col items-center justify-end min-w-[120px]'
                          >

                            <p className='text-xs font-semibold text-slate-700 mb-2 h-6 leading-6'>
                              {Number(item.qty).toFixed(2)}
                            </p>

                            <div
                              className='w-full rounded-t-xl bg-green-300 hover:bg-green-400 transition'
                              style={{
                                height:
                                `${Math.max(
                                (item.qty / maxDispatchValue) * 210,
                                30
                                )}px`
                              }}
                            />

                            <p className='text-sm mt-3 text-slate-600 text-center leading-5 min-h-10'>
                              {month.label}
                            </p>

                          </div>
                        )
                      }
                    )
                  }

                </div>

              )}

            </div>
          )
        }
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
