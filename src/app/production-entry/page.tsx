'use client'

import {
  useEffect,
  useState,
} from 'react'

import toast from 'react-hot-toast'

import { supabase } from '@/lib/supabase'

export default function ProductionEntryPage() {

  // MASTER DATA

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

  // FORM

  const [formData, setFormData] =
    useState({

      production_date:
        new Date()
          .toISOString()
          .split('T')[0],

      factory: '',
      machine: '',
      labour_name: '',
      shift: 'Day',

      mesh: '',
      bag_type: '',
      bag_name: '',

      quantity: '',

      rate: 0,
      amount: 0,
    })

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    fetchMasterData()
  }, [])

  // FETCH DATA

  const fetchMasterData = async () => {

    const [
      factoriesRes,
      machinesRes,
      meshesRes,
      bagTypesRes,
      bagNamesRes,
      ratesRes,
    ] = await Promise.all([

      supabase
        .from('factory_master')
        .select('*'),

      supabase
        .from('machine_master')
        .select('*'),

      supabase
        .from('mesh_master')
        .select('*'),

      supabase
        .from('bag_type_master')
        .select('*'),

      supabase
        .from('bag_name_master')
        .select('*'),

      supabase
        .from('rate_master')
        .select('*'),

    ])

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

  // FILTERED MACHINES

  const filteredMachines =
    machines.filter(
      (machine) =>
        machine.factory ===
        formData.factory
    )

  // AUTO RATE

  useEffect(() => {

    const matchedRate =
      rates.find(
        (rate) =>

          rate.mesh ===
            formData.mesh &&

          rate.bag_type ===
            formData.bag_type
      )

    if (matchedRate) {

      const amount =
        Number(formData.quantity || 0) *
        Number(matchedRate.rate)

      setFormData((prev) => ({
        ...prev,
        rate:
          matchedRate.rate,
        amount,
      }))

    }

  }, [
    formData.mesh,
    formData.bag_type,
    formData.quantity,
    rates,
  ])

  // INPUT CHANGE

  const handleChange = (
    field: string,
    value: any
  ) => {

    setFormData((prev) => ({

      ...prev,

      [field]: value,

    }))
  }

  // SUBMIT

  const handleSubmit = async (
    e: any
  ) => {

    e.preventDefault()

    setLoading(true)

    const { error } =
      await supabase
        .from('production_entries')
        .insert([formData])

    setLoading(false)

    if (!error) {

      toast.success(
        'Production entry added'
      )

      setFormData({

        production_date:
          new Date()
            .toISOString()
            .split('T')[0],

        factory: '',
        machine: '',
        labour_name: '',
        shift: 'Day',

        mesh: '',
        bag_type: '',
        bag_name: '',

        quantity: '',

        rate: 0,
        amount: 0,
      })
    }
  }

  return (

    <main className="min-h-screen bg-slate-100 p-4 md:p-6">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-slate-500 text-sm">
            Production Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Production Entry
          </h1>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* DATE */}

            <input
              type="date"
              value={
                formData.production_date
              }
              onChange={(e) =>
                handleChange(
                  'production_date',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            />

            {/* FACTORY */}

            <select
              value={formData.factory}
              onChange={(e) =>
                handleChange(
                  'factory',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            >

              <option value="">
                Select Factory
              </option>

              {factories.map((factory) => (

                <option
                  key={factory.id}
                  value={factory.name}
                >
                  {factory.name}
                </option>

              ))}

            </select>

            {/* MACHINE */}

            <select
              value={formData.machine}
              onChange={(e) =>
                handleChange(
                  'machine',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            >

              <option value="">
                Select Machine
              </option>

              {filteredMachines.map((machine) => (

                <option
                  key={machine.id}
                  value={machine.name}
                >
                  {machine.name}
                </option>

              ))}

            </select>

            {/* LABOUR */}

            <input
              type="text"
              placeholder="Labour Name"
              value={
                formData.labour_name
              }
              onChange={(e) =>
                handleChange(
                  'labour_name',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            />

            {/* SHIFT */}

            <select
              value={formData.shift}
              onChange={(e) =>
                handleChange(
                  'shift',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            >

              <option value="Day">
                Day
              </option>

              <option value="Night">
                Night
              </option>

            </select>

            {/* MESH */}

            <select
              value={formData.mesh}
              onChange={(e) =>
                handleChange(
                  'mesh',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            >

              <option value="">
                Select Mesh
              </option>

              {meshes.map((mesh) => (

                <option
                  key={mesh.id}
                  value={mesh.name}
                >
                  {mesh.name}
                </option>

              ))}

            </select>

            {/* BAG TYPE */}

            <select
              value={formData.bag_type}
              onChange={(e) =>
                handleChange(
                  'bag_type',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            >

              <option value="">
                Select Bag Type
              </option>

              {bagTypes.map((bagType) => (

                <option
                  key={bagType.id}
                  value={bagType.name}
                >
                  {bagType.name}
                </option>

              ))}

            </select>

            {/* BAG NAME */}

            <select
              value={formData.bag_name}
              onChange={(e) =>
                handleChange(
                  'bag_name',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            >

              <option value="">
                Select Bag Name
              </option>

              {bagNames.map((bagName) => (

                <option
                  key={bagName.id}
                  value={bagName.name}
                >
                  {bagName.name}
                </option>

              ))}

            </select>

            {/* QUANTITY */}

            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) =>
                handleChange(
                  'quantity',
                  e.target.value
                )
              }
              className="border border-slate-200 p-4 rounded-2xl"
            />

            {/* RATE */}

            <input
              type="number"
              value={formData.rate}
              readOnly
              className="bg-slate-100 border border-slate-200 p-4 rounded-2xl"
            />

            {/* AMOUNT */}

            <input
              type="number"
              value={formData.amount}
              readOnly
              className="bg-slate-100 border border-slate-200 p-4 rounded-2xl"
            />

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 bg-slate-800 text-white px-6 py-4 rounded-2xl font-semibold"
          >

            {loading
              ? 'Saving...'
              : 'Save Entry'}

          </button>

        </form>

      </div>

    </main>
  )
}