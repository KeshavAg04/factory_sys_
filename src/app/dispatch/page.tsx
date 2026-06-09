'use client'

import {
  useEffect,
  useState,
  useRef,
} from 'react'

import { supabase } from '@/lib/supabase'
import RoleGuard from '@/components/RoleGuard'

export default function DispatchPage() {

  const [date,setDate]=
    useState('')

  const [customer,setCustomer]=
    useState('')

  const [customers,setCustomers]=
    useState<string[]>([])

  const [factory,setFactory]=
    useState('')

  const [bagType,setBagType]=
    useState('')

  const [bagName,setBagName]=
    useState('')

  const [mesh,setMesh]=
    useState('')

  const [quantity,setQuantity]=
    useState('')

    const [dispatchBags,setDispatchBags] =
    useState('')

    const [salesRate,setSalesRate] =
useState('')

const [salesAmount,setSalesAmount] =
useState(0)

  const [vehicleNo,setVehicleNo]=
    useState('')

    const [invoiceNumber,setInvoiceNumber] =
    useState('')
    
    const [transporterName,setTransporterName] =
    useState('')
    
    const [lrNumber,setLrNumber] =
    useState('')
    
    const [lrFreight,setLrFreight] =
    useState('')
    
    const [freightType,setFreightType] =
    useState('Advance')
    
    const [freightPmt,setFreightPmt] =
    useState('')
    
    const [totalFreight,setTotalFreight] =
    useState(0)
    
    const [loadingAmount,setLoadingAmount] =
    useState('')

    const [loadingRate,setLoadingRate] =
useState('90')
    
    const [loadingPending,setLoadingPending] =
    useState(false)
    
    const [vasuli,setVasuli] =
useState(0)
    
    const [userFactory,setUserFactory] =
    useState('')

    const [transporters,setTransporters] =
useState<any[]>([])

  const [remarks,setRemarks]=
    useState('')

  const [availableStock,setAvailableStock]=
    useState(0)

  const [factories,setFactories]=
    useState<any[]>([])

  const [bagNames,setBagNames]=
    useState<any[]>([])

  const [bagTypes,setBagTypes]=
    useState<any[]>([])

  const [meshes,setMeshes]=
    useState<string[]>([])

  const formRef=
    useRef<HTMLFormElement>(null)

  useEffect(()=>{

    const factory =
localStorage.getItem(
'userFactory'
) || ''

setUserFactory(factory)

if(factory){

setFactory(factory)

}

    setTodayDate()

    fetchMasters()

    loadTransporters()

  },[])

  useEffect(()=>{

    if(
      factory &&
      bagType &&
      bagName &&
      mesh
    ){

      calculateAvailableStock()

    }

  },[
    factory,
    bagType,
    bagName,
    mesh
  ])

  useEffect(()=>{

    loadMeshesForBag()

  },[
    bagName
  ])

  function setTodayDate(){

    const today=
      new Date()

    const yyyy=
      today.getFullYear()

    const mm=
      String(
        today.getMonth()+1
      ).padStart(
        2,
        '0'
      )

    const dd=
      String(
        today.getDate()
      ).padStart(
        2,
        '0'
      )

    setDate(
      `${yyyy}-${mm}-${dd}`
    )

  }

  useEffect(()=>{

    const qty =
    Number(quantity || 0)
    
    const freight =
    Number(freightPmt || 0)
    
    const lr =
    Number(lrFreight || 0)
    
    setTotalFreight(
    qty * freight
    )
    
    setVasuli(
    (lr - freight) * qty
    )
    
    },[
    quantity,
    freightPmt,
    lrFreight
    ])

    useEffect(()=>{

      const amount =
      
      Number(quantity || 0)
      
      *
      
      Number(loadingRate || 0)
      
      setLoadingAmount(
      amount.toFixed(1)
      )
      
      },[
      dispatchBags,
      loadingRate
      ])

      useEffect(()=>{

        const amount =
        
        Number(quantity || 0)
        
        *
        
        Number(salesRate || 0)
        
        setSalesAmount(
        amount
        )
        
        },[
        quantity,
        salesRate
        ])

  async function fetchMasters(){

    const factoriesRes=
      await supabase
      .from(
        'factory_master'
      )
      .select('*')

    const bagNameRes=
      await supabase
      .from(
        'bag_name_master'
      )
      .select('*')

    const bagTypeRes=
      await supabase
      .from(
        'rate_master'
      )
      .select(
        'bag_type'
      )

    const customerRes=
      await supabase
      .from(
        'dispatch_entries'
      )
      .select(
        'customer_name'
      )

    setFactories(
      factoriesRes.data||[]
    )

    setBagNames(
      bagNameRes.data||[]
    )

    setBagTypes([
      ...new Set(
        (
          bagTypeRes.data||
          []
        ).map(
          (item:any)=>
            item.bag_type
        )
      )
    ])

    setCustomers([
      ...new Set(
        (
          customerRes.data||
          []
        )
        .map(
          (item:any)=>
            item.customer_name
        )
        .filter(Boolean)
      )
    ])

  }

  async function loadMeshesForBag(){

    if(!bagName){

      setMeshes([])

      return
    }

    const {data}=
      await supabase
      .from(
        'production_entries'
      )
      .select(
        'mesh'
      )
      .eq(
        'bag_name',
        bagName
      )

    const uniqueMeshes=[
      ...new Set(
        (
          data||[]
        ).map(
          (item:any)=>
            item.mesh
        )
      )
    ]

    setMeshes(
      uniqueMeshes as string[]
    )

  }

  async function calculateAvailableStock(){

    const productionRes=
      await supabase
      .from(
        'production_entries'
      )
      .select(
        'quantity'
      )
      .eq(
        'factory',
        factory
      )
      .eq(
        'bag_type',
        bagType
      )
      .eq(
        'bag_name',
        bagName
      )
      .eq(
        'mesh',
        mesh
      )

      const dispatchRes=
      await supabase
      .from(
      'dispatch_entries'
      )
      .select(
      'dispatch_bags'
      )
      .eq(
        'factory',
        factory
      )
      .eq(
        'bag_type',
        bagType
      )
      .eq(
        'bag_name',
        bagName
      )
      .eq(
        'mesh',
        mesh
      )

    const produced=
      (
        productionRes.data||
        []
      ).reduce(
        (
          sum:any,
          row:any
        )=>
          sum+
          Number(
            row.quantity||0
          ),
        0
      )

      const dispatched=
      (
      dispatchRes.data||
      []
      ).reduce(
      (
      sum:any,
      row:any
      )=>
      sum+
      Number(
      row.dispatch_bags||0
      ),
      0
      )

    setAvailableStock(
      produced-
      dispatched
    )

  }

  async function loadTransporters(){

    const {data} =
    await supabase
    .from('transporter_master')
    .select('*')
    .order(
    'transporter_name'
    )
    
    setTransporters(
    data || []
    )
    
    }

  async function saveDispatch(
    e?:any
  ){

    if(e){

      e.preventDefault()

    }

    if(
      !factory ||
      !customer ||
      !bagType ||
      !bagName ||
      !mesh ||
      !quantity ||
      !dispatchBags
      ){

      alert(
        'Please fill all fields'
      )

      return
    }

    const qty=
      Number(quantity)
      if(
        Number(dispatchBags) >
        availableStock
        ){
        
        const proceed =
        window.confirm(
        `Warning
        
        Available Finished Bags: ${availableStock}
        
        Requested Dispatch Bags: ${dispatchBags}
        
        ERP stock may be negative because of pre-ERP inventory.
        
        Continue?`
        )
        
        if(!proceed){
        
        return
        
        }
        
        }
    const payload = {

      dispatch_date:date,
      
      customer_name:customer,
      
      factory,
      
      invoice_number:
      invoiceNumber,
      
      transporter_name:
      transporterName,
      
      bag_type:bagType,
      
      bag_name:bagName,
      
      mesh,
      
      quantity:qty,

      sales_rate:
Number(
salesRate || 0
),

sales_amount:
Number(
salesAmount || 0
),

dispatch_bags:
Number(dispatchBags),
      
      vehicle_no:vehicleNo,
      
      lr_number:lrNumber,
      
      lr_freight:
      Number(
      lrFreight || 0
      ),
      
      freight_type:
      freightType,
      
      freight_pmt:
      Number(
      freightPmt || 0
      ),
      
      total_freight:
      Number(
      totalFreight || 0
      ),
      
      loading_amount:
      Number(
      loadingAmount || 0
      ),

      loading_rate:
Number(
loadingRate || 90
),
      
      loading_pending:
      loadingPending,
      
      vasuli:
      Number(
      vasuli || 0
      ),
      
      remarks
      
      }

      if(transporterName){

        await supabase
        .from(
        'transporter_master'
        )
        .upsert(
        {
        transporter_name:
        transporterName
        },
        {
        onConflict:
        'transporter_name'
        }
        )
        
        }

  
      const {error}=
        await supabase
        .from(
          'dispatch_entries'
        )
        .insert([
          payload
        ])
  
      if(error){
  
        console.log(error)
  
        alert(
          'Failed to save dispatch'
        )
  
        return
  
      }
  
      alert(
        'Dispatch Saved'
      )
  
      setCustomer('')
  
      setBagType('')
  
      setBagName('')
  
      setMesh('')
  
      setQuantity('')

      setSalesRate('')
setSalesAmount(0)

      setDispatchBags('')

      setLoadingRate('90')
  
      setVehicleNo('')
  
      setRemarks('')
  
      setAvailableStock(0)
  
      fetchMasters()
  
    }
  
    return (
      <RoleGuard
allowedRoles={[
'Admin',
'accounts'
]}
>
  
      <div className="min-h-screen flex justify-center px-4 py-8">
  
        <div className="w-full max-w-4xl">
  
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
  
            <div className="mb-8">
  
              <p className="text-slate-500 text-sm">
                Dispatch Management
              </p>
  
              <h1 className="text-4xl font-bold text-slate-900 mt-2">
                Dispatch Entry
              </h1>
  
            </div>
  
            <form
              ref={formRef}
              onSubmit={saveDispatch}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
  
              <input
                type="date"
                value={date}
                onChange={(e)=>
                  setDate(
                    e.target.value
                  )
                }
                className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              />
  
              <input
                list="customers"
                value={customer}
                onChange={(e)=>
                  setCustomer(
                    e.target.value
                  )
                }
                placeholder="Customer Name"
                className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              />
  
              <datalist id="customers">
  
                {customers.map(
                  (item)=>(
                    <option
                      key={item}
                      value={item}
                    />
                  )
                )}
  
              </datalist>

              <input
value={invoiceNumber}
onChange={(e)=>
setInvoiceNumber(
e.target.value
)
}
placeholder="Invoice Number"
className="h-14 rounded-2xl border border-slate-200 px-4"
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
                className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              >
  
                <option value="">
                  Select Factory
                </option>
  
                {factories.map(
                  (item)=>(
                    <option
                      key={item.id}
                      value={
                        item.factory_name
                      }
                    >
                      {
                        item.factory_name
                      }
                    </option>
                  )
                )}
  
              </select>
  
              <select
                value={bagType}
                onChange={(e)=>
                  setBagType(
                    e.target.value
                  )
                }
                className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              >
  
                <option value="">
                  Select Bag Type
                </option>
  
                {bagTypes.map(
                  (item)=>(
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
  
              </select>
  
              <select
                value={bagName}
                onChange={(e)=>
                  setBagName(
                    e.target.value
                  )
                }
                className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              >
  
                <option value="">
                  Select Bag Name
                </option>
  
                {bagNames.map(
                  (item)=>(
                    <option
                      key={item.id}
                      value={
                        item.bag_name
                      }
                    >
                      {
                        item.bag_name
                      }
                    </option>
                  )
                )}
  
              </select>
  
              <select
                value={mesh}
                onChange={(e)=>
                  setMesh(
                    e.target.value
                  )
                }
                className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              >
  
                <option value="">
                  Select Mesh
                </option>
  
                {meshes.map(
                  (item)=>(
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
  
              </select>
  
              <div className="md:col-span-2">
  
                <div className="bg-slate-100 border rounded-2xl p-4">
  
                  <p className="text-slate-500 text-sm">
                  Available Finished Bags
                  </p>
  
                  <h2 className="text-3xl font-bold text-slate-900">
                    {availableStock}
                  </h2>
  
                </div>
  
              </div>
  
              <input
                type="number"
                step="0.001"
                value={quantity}
                onChange={(e)=>
                  setQuantity(
                    e.target.value
                  )
                }
                placeholder="Dispatch Quantity"
                className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              />

<input
type="number"
value={salesRate}
onChange={(e)=>
setSalesRate(
e.target.value
)
}
placeholder="Sales Rate PMT"
className="
h-14
rounded-2xl
border
border-slate-200
px-4
outline-none
focus:ring-2
focus:ring-slate-400
"
/>

<input
value={salesAmount}
readOnly
placeholder="Sales Amount"
className="
h-14
rounded-2xl
bg-slate-100
border
border-slate-200
px-4
"
/>

<input
type="number"
value={dispatchBags}
onChange={(e)=>
setDispatchBags(
e.target.value
)
}
placeholder="No. of Bags Dispatched"
className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
/>
  
              <input
                value={vehicleNo}
                onChange={(e)=>
                  setVehicleNo(
                    e.target.value
                  )
                }
                placeholder="Vehicle Number"
                className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              />

<input
list="transporter-list"
value={transporterName}
onChange={(e)=>
setTransporterName(
e.target.value
)
}
placeholder="Transporter Name"
className="
h-14
rounded-2xl
border
border-slate-200
px-4
outline-none
focus:ring-2
focus:ring-slate-400
"
/>

<datalist id="transporter-list">

{
transporters.map(
(item:any)=>(

<option
key={item.id}
value={
item.transporter_name
}
/>

)
)

}

</datalist>

<input
value={lrNumber}
onChange={(e)=>
setLrNumber(
e.target.value
)
}
placeholder="LR Number"
className="h-14 rounded-2xl border border-slate-200 px-4"
/>

<input
type="number"
value={lrFreight}
onChange={(e)=>
setLrFreight(
e.target.value
)
}
placeholder="LR Freight"
className="h-14 rounded-2xl border border-slate-200 px-4"
/>

<select
value={freightType}
onChange={(e)=>
setFreightType(
e.target.value
)
}
className="h-14 rounded-2xl border border-slate-200 px-4"
>

<option>
Advance
</option>

<option>
To be Paid
</option>

</select>

<input
type="number"
value={freightPmt}
onChange={(e)=>
setFreightPmt(
e.target.value
)
}
placeholder="Freight PMT"
className="h-14 rounded-2xl border border-slate-200 px-4"
/>

<input
value={totalFreight}
readOnly
placeholder="Total Freight"
className="h-14 rounded-2xl bg-slate-100 border border-slate-200 px-4"
/>

<input
type="number"
value={loadingRate}
onChange={(e)=>
setLoadingRate(
e.target.value
)
}
placeholder="Loading Rate per MT (Default: ₹90)"
className="h-14 rounded-2xl border border-slate-200 px-4"
/>

<input
value={loadingAmount}
readOnly
placeholder="Loading Amount"
className="
h-14
rounded-2xl
bg-slate-100
border
border-slate-200
px-4
"
/>

<select
value={
loadingPending
? 'Yes'
: 'No'
}
onChange={(e)=>
setLoadingPending(
e.target.value ===
'Yes'
)
}
className="
h-14
rounded-2xl
border
border-slate-200
px-4
"
>

<option value="No">
Loading Cleared
</option>

<option value="Yes">
Loading Pending
</option>

</select>

<input
value={vasuli}
readOnly
placeholder="Vasuli"
className="
h-14
rounded-2xl
bg-slate-100
border
border-slate-200
px-4
"
/>
  
              <textarea
                value={remarks}
                onChange={(e)=>
                  setRemarks(
                    e.target.value
                  )
                }
                placeholder="Remarks"
                className="md:col-span-2 rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-slate-400 min-h-[100px]"
              />
  
              <div className="md:col-span-2 flex justify-center pt-2">
  
                <button
                  type="submit"
                  className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Save Dispatch
                </button>
  
              </div>
  
            </form>
  
          </div>
  
        </div>
  
      </div>
      </RoleGuard>
  
    )
  
  }