'use client'

import {
  useEffect,
  useState,
} from 'react'

import toast from 'react-hot-toast'

import {
  supabase,
} from '@/lib/supabase'

export default function ProductionEntryPage() {

  const [
    date,
    setDate,
  ] = useState('')

  const [
    factory,
    setFactory,
  ] = useState('')

  const [
    machine,
    setMachine,
  ] = useState('')

  const [
    labourName,
    setLabourName,
  ] = useState('')

  const [
    shift,
    setShift,
  ] = useState('Day')

  const [
    mesh,
    setMesh,
  ] = useState('')

  const [
    bagType,
    setBagType,
  ] = useState('')

  const [
    bagName,
    setBagName,
  ] = useState('')

  const [
    quantity,
    setQuantity,
  ] = useState(0)

  const [
    rate,
    setRate,
  ] = useState(0)

  const [
    amount,
    setAmount,
  ] = useState(0)

  const [
    factories,
    setFactories,
  ] = useState<any[]>([])

  const [
    machines,
    setMachines,
  ] = useState<any[]>([])

  const [
    meshes,
    setMeshes,
  ] = useState<any[]>([])

  const [
    bagTypes,
    setBagTypes,
  ] = useState<any[]>([])

  const [
    bagNames,
    setBagNames,
  ] = useState<any[]>([])

  const [
    rates,
    setRates,
  ] = useState<any[]>([])

  const [
    entries,
    setEntries,
  ] = useState<any[]>([])

  useEffect(() => {

    const today =
      new Date()
        .toISOString()
        .split('T')[0]

    setDate(today)

    fetchMasterData()

    fetchEntries()

  }, [])

  useEffect(() => {

    const matchedRate =
      rates.find(
        (r) =>
          r.mesh === mesh &&
          r.bag_type === bagType
      )

    if (matchedRate) {

      setRate(
        matchedRate.rate
      )

    } else {

      setRate(0)
    }

  }, [
    mesh,
    bagType,
    rates,
  ])

  useEffect(() => {

    setAmount(
      quantity * rate
    )

  }, [
    quantity,
    rate,
  ])

  async function fetchEntries() {

    const {
      data,
    } = await supabase
      .from('production_entries')
      .select('labour_name')

    setEntries(data || [])
  }

  async function fetchMasterData() {

    const factoriesRes =
      await supabase
        .from('factory_master')
        .select('*')

    const machinesRes =
      await supabase
        .from('machine_master')
        .select('*')

    const meshesRes =
      await supabase
        .from('mesh_master')
        .select('*')

    const bagTypesRes =
      await supabase
        .from('bag_type_master')
        .select('*')

    const bagNamesRes =
      await supabase
        .from('bag_name_master')
        .select('*')

    const ratesRes =
      await supabase
        .from('rate_master')
        .select('*')

    setFactories(
      factoriesRes.data || []
    )

    setMachines(
      machinesRes.data || []
    )

    setMeshes(
      meshesRes.data || []
    )

    setBagTypes(
      bagTypesRes.data || []
    )

    setBagNames(
      bagNamesRes.data || []
    )

    setRates(
      ratesRes.data || []
    )
  }

  async function saveEntry() {

    if (
      !factory ||
      !machine ||
      !labourName ||
      !mesh ||
      !bagType ||
      !bagName ||
      !quantity
    ) {

      toast.error(
        'Please fill all fields'
      )

      return
    }

    const {
      error,
    } = await supabase
      .from('production_entries')
      .insert([{

        date,
        factory,
        machine,
        labour_name:
          labourName,
        shift,
        mesh,
        bag_type:
          bagType,
        bag_name:
          bagName,
        quantity,
        rate,
        amount,

      }])

    if (error) {

      toast.error(
        'Failed to save entry'
      )

      return
    }

    toast.success(
      'Entry saved successfully'
    )

    setLabourName('')
    setQuantity(0)
    setAmount(0)

    fetchEntries()
  }

  return (

    <div className="p-4 md:p-6">

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 max-w-4xl">

        <p className="text-slate-500 text-sm mb-1">
          Production Management
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Production Entry
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* DATE */}

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />

          {/* FACTORY */}

          <select
            value={factory}
            onChange={(e) =>
              setFactory(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >

            <option value="">
              Select Factory
            </option>

            {factories.map(
              (factory) => (

                <option
                  key={factory.id}
                  value={
                    factory.factory_name
                  }
                >
                  {
                    factory.factory_name
                  }
                </option>
              )
            )}

          </select>

          {/* MACHINE */}

          <select
            value={machine}
            onChange={(e) =>
              setMachine(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >

            <option value="">
              Select Machine
            </option>

            {machines.map(
              (machine) => (

                <option
                  key={machine.id}
                  value={
                    machine.machine_name
                  }
                >
                  {
                    machine.machine_name
                  }
                </option>
              )
            )}

          </select>

          {/* LABOUR */}

          <div>

            <input
              type="text"
              list="labours"
              autoComplete='off'
              placeholder="Labour Name"
              value={labourName}
              onChange={(e) =>
                setLabourName(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />

            <datalist id="labours">

              {[

                ...new Set(

                  entries
                    .map(
                      (e) =>
                        e.labour_name
                    )
                    .filter(Boolean)

                ),

              ].map((name) => (

                <option
                  key={name}
                  value={name}
                />

              ))}

            </datalist>

          </div>

          {/* SHIFT */}

          <select
            value={shift}
            onChange={(e) =>
              setShift(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >

            <option>
              Day
            </option>

            <option>
              Night
            </option>

          </select>

          {/* MESH */}

          <select
            value={mesh}
            onChange={(e) =>
              setMesh(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >

            <option value="">
              Select Mesh
            </option>

            {meshes.map(
              (mesh) => (

                <option
                  key={mesh.id}
                  value={
                    mesh.mesh_name
                  }
                >
                  {
                    mesh.mesh_name
                  }
                </option>
              )
            )}

          </select>

          {/* BAG TYPE */}

          <select
            value={bagType}
            onChange={(e) =>
              setBagType(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >

            <option value="">
              Select Bag Type
            </option>

            {bagTypes.map(
              (bagType) => (

                <option
                  key={bagType.id}
                  value={
                    bagType.bag_type
                  }
                >
                  {
                    bagType.bag_type
                  }
                </option>
              )
            )}

          </select>

          {/* BAG NAME */}

          <select
            value={bagName}
            onChange={(e) =>
              setBagName(
                e.target.value
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >

            <option value="">
              Select Bag Name
            </option>

            {bagNames.map(
              (bag) => (

                <option
                  key={bag.id}
                  value={
                    bag.bag_name
                  }
                >
                  {
                    bag.bag_name
                  }
                </option>
              )
            )}

          </select>

          {/* QUANTITY */}

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Number(
                  e.target.value
                )
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />

          {/* RATE */}

          <input
            type="number"
            value={rate}
            readOnly
            className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 outline-none"
          />

          {/* AMOUNT */}

          <input
            type="number"
            value={amount}
            readOnly
            className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 outline-none"
          />

        </div>

        <button
          onClick={saveEntry}
          className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-medium transition"
        >

          Save Entry

        </button>

      </div>

    </div>
  )
}