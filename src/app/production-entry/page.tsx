'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { supabase } from '@/lib/supabase'
import {
  findProductionRate,
  getProductionRate,
} from '@/lib/productionRate'

import RoleGuard
from '@/components/RoleGuard'

export default function ProductionEntryPage() {

  const [date, setDate] =
    useState('')

  const [factory, setFactory] =
    useState('')

  const [machine, setMachine] =
    useState('')

  const [labour, setLabour] =
    useState('')

  const [shift, setShift] =
    useState('Day')

  const [mesh, setMesh] =
    useState('')

  const [bagType, setBagType] =
    useState('')

  const [bagName, setBagName] =
    useState('')

  const [quantity, setQuantity] =
    useState('')

  const [rate, setRate] =
    useState(0)

  const [amount, setAmount] =
    useState(0)

  const [factories, setFactories] =
    useState<any[]>([])

  const [machines, setMachines] =
    useState<any[]>([])

  const [meshes, setMeshes] =
    useState<any[]>([])

  const [bagTypes, setBagTypes] =
    useState<any[]>([])

  const [bagNames, setBagNames] =
    useState<any[]>([])

  const [rates, setRates] =
    useState<any[]>([])

  const [labours, setLabours] =
    useState<string[]>([])
  
    const [userFactory,setUserFactory] =
    useState('')

  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {

    fetchMasters()

    setTodayDate()

  }, [])

  useEffect(() => {

    const foundRate =
      findProductionRate(
        rates,
        mesh,
        bagType
      )

    if (foundRate !== null) {

      setRate(
        foundRate
      )

      setAmount(
        Number(quantity || 0) *
          foundRate
      )

    } else {

      setRate(0)

      setAmount(0)
    }

    const factory =
localStorage.getItem(
'userFactory'
) || ''

setUserFactory(factory)

if(factory){
setFactory(factory)
}

  }, [
    quantity,
    bagType,
    mesh,
    rates,
  ])

  function setTodayDate() {

    const today = new Date()

    const yyyy =
      today.getFullYear()

    const mm = String(
      today.getMonth() + 1
    ).padStart(2, '0')

    const dd = String(
      today.getDate()
    ).padStart(2, '0')

    setDate(
      `${yyyy}-${mm}-${dd}`
    )
  }

  async function fetchMasters() {

    const factoriesRes =
      await supabase
        .from('factory_master')
        .select('*')

    const machinesRes =
      await supabase
        .from('machine_master')
        .select('*')

    const meshRes =
      await supabase
        .from('rate_master')
        .select('mesh')

    const bagTypeRes =
      await supabase
        .from('rate_master')
        .select('bag_type')

    const bagNameRes =
      await supabase
        .from('bag_name_master')
        .select('*')

    const rateRes =
      await supabase
        .from('rate_master')
        .select('*')

    const labourRes =
      await supabase
        .from(
          'production_entries'
        )
        .select('labour_name')

    setFactories(
      factoriesRes.data || []
    )

    setMachines(
      machinesRes.data || []
    )

    setMeshes([
      ...new Set(
        (meshRes.data || []).map(
          (item: any) =>
            item.mesh
        )
      ),
    ])

    setBagTypes([
      ...new Set(
        (
          bagTypeRes.data ||
          []
        ).map(
          (item: any) =>
            item.bag_type
        )
      ),
    ])

    setBagNames(
      bagNameRes.data || []
    )

    setRates(rateRes.data || [])

    setLabours([
      ...new Set(
        (
          labourRes.data ||
          []
        )
          .map(
            (item: any) =>
              item.labour_name
          )
          .filter(Boolean)
      ),
    ])
  }

  function normalizeShift(
    shift:string
  ){
  
  const value=
  shift
  .toLowerCase()
  .trim()
  
  if(
  value==="दिन" ||
  value==="दीन" ||
  value==="दिन की पाली" ||
  value==="day"
  ){
  return "Day"
  }
  
  if(
  value==="रात" ||
  value==="रात्रि" ||
  value==="नाइट" ||
  value==="night"
  ){
  return "Night"
  }
  
  return shift
  }

  async function saveEntry(
    e?: any
  ) {

    if (e) {

      e.preventDefault()
    }

    if (
      !factory ||
      !machine ||
      !labour ||
      !mesh ||
      !bagType ||
      !bagName ||
      !quantity
    ) {

      alert(
        'Please fill all fields'
      )

      return
    }

    const currentRate =
      await getProductionRate(
        supabase,
        mesh,
        bagType
      )

    if (currentRate === null) {

      alert(
        'Rate not found for selected Mesh & Bag Type'
      )

      return
    }

    const payload = {

      production_date: date,
    
      labour_name: labour,
    
      factory,
      machine,
      shift:
      normalizeShift(shift),
    
      mesh,
    
      bag_type: bagType,
    
      bag_name: bagName,
    
      quantity:
        Number(quantity),
    
      rate:
        currentRate,
    
      amount:
        Number(quantity) *
        currentRate,
    
    }

    console.log(
      'SAVE PAYLOAD',
      payload
      )

    const {
      error,
    } = await supabase
      .from(
        'production_entries'
      )
      .insert([payload])

    if (error) {

      console.log('SAVE ERROR',error)

      alert(
        'Failed to save entry'
      )

      return
    }

    alert('Entry saved')

    setLabour('')

    setMesh('')

    setBagType('')

    setBagName('')

    setQuantity('')

    setRate(0)

    setAmount(0)

    fetchMasters()
  }

  return (
    <RoleGuard
      allowedRoles={[
        'Admin',
        'production'
      ]}
      >

      
      <div className="min-h-screen flex justify-center px-4 py-8">

      <div className="w-full max-w-4xl">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">

          <div className="mb-8">

            <p className="text-slate-500 text-sm">
              Production Management
            </p>

            <h1 className="text-4xl font-bold text-slate-900 mt-2">
              Production Entry
            </h1>

          </div>

          <form
            ref={formRef}
            onSubmit={saveEntry}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              />

<select
value={factory}
onChange={(e) => {
  setFactory(e.target.value)
  setMachine('')
}}
disabled={
userFactory !== ''
}
className="
h-14
rounded-2xl
border
border-slate-200
px-4
outline-none
focus:ring-2
focus:ring-slate-400
disabled:bg-slate-100
"
>

              <option value="">
                Select Factory
              </option>

              {factories.map(
                (item) => (
                  
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
  value={machine}
  onChange={(e) =>
    setMachine(
      e.target.value
    )
  }
  className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
>

  <option value="">
    Select Machine
  </option>

  {machines
    .filter(
      (item) =>
        !factory ||
      item.factory ===
      factory
    )
    .map((item) => (
      
      <option
      key={item.id}
      value={
        item.machine_name
      }
      >
        {
          item.machine_name
        }
      </option>

))}

</select>

            <input
              list="labours"
              value={labour}
              onChange={(e) =>
                setLabour(
                  e.target.value
                )
              }
              placeholder="Labour Name"
              className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              />

            <datalist id="labours">

              {labours.map(
                (item) => (
                  
                  <option
                  key={item}
                  value={item}
                  />
                  
                )
              )}

            </datalist>

            <select
              value={shift}
              onChange={(e) =>
                setShift(
                  e.target.value
                )
              }
              className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              >

              <option>
                Day
              </option>

              <option>
                Night
              </option>

            </select>

            <select
              value={mesh}
              onChange={(e) =>
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
                (item) => (
                  
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
              value={bagType}
              onChange={(e) =>
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
                (item) => (
                  
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
              onChange={(e) =>
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
                (item) => (

                  <option
                  key={item.id}
                  value={
                    item.bag_name
                  }
                  >
                    {item.bag_name}
                  </option>

)
)}

            </select>

            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="Quantity"
              className="h-14 rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-slate-400"
              />

              <input
                type="number"
                value={rate}
                readOnly
                placeholder="Rate"
                className="h-14 rounded-2xl bg-slate-100 border border-slate-200 px-4 outline-none"
                />

            <input
              type="number"
              value={amount}
              readOnly
              placeholder="Amount"
              className="h-14 rounded-2xl bg-slate-100 border border-slate-200 px-4 outline-none"
              />

            <div className="md:col-span-2 flex justify-center pt-2">

              <button
                type="submit"
                className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                Save Entry
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  </RoleGuard>
  )
}
