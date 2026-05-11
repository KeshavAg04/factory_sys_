'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProductionEntryPage() {

  const [loading, setLoading] = useState(false)

  const [factories, setFactories] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [labours, setLabours] = useState<any[]>([])
  const [rates, setRates] = useState<any[]>([])
  const [bagNames, setBagNames] = useState<any[]>([])

  const [formData, setFormData] = useState({
    production_date: '',
    factory: '',
    labour_name: '',
    machine: '',
    shift: '',
    mesh: '',
    bag_type: '',
    bag_name: '',
    quantity: '',
    rate: '',
    amount: '',
  })

  useEffect(() => {

    fetchMasters()

    const today = new Date()
      .toISOString()
      .split('T')[0]

    setFormData((prev) => ({
      ...prev,
      production_date: today,
    }))

  }, [])

  const fetchMasters = async () => {

    const { data: factoryData } =
      await supabase
        .from('factory_master')
        .select('*')

    const { data: machineData } =
      await supabase
        .from('machine_master')
        .select('*')

    const { data: labourData } =
      await supabase
        .from('labour_master')
        .select('*')

    const { data: rateData } =
      await supabase
        .from('rate_master')
        .select('*')

    const { data: bagNameData } =
      await supabase
        .from('bag_name_master')
        .select('*')

    setFactories(factoryData || [])
    setMachines(machineData || [])
    setLabours(labourData || [])
    setRates(rateData || [])
    setBagNames(bagNameData || [])
  }

  const filteredMachines =
    machines.filter(
      (machine) =>
        machine.factory ===
        formData.factory
    )

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) => {

    const {
      name,
      value,
    } = e.target

    let updatedData = {
      ...formData,
      [name]: value,
    }

    const selectedMesh =
      name === 'mesh'
        ? value
        : updatedData.mesh

    const selectedBagType =
      name === 'bag_type'
        ? value
        : updatedData.bag_type

    const matchedRate =
      rates.find(
        (rate) =>
          rate.mesh === selectedMesh &&
          rate.bag_type === selectedBagType
      )

    if (matchedRate) {

      updatedData.rate =
        matchedRate.rate.toString()

      updatedData.amount = (
        Number(updatedData.quantity || 0) *
        Number(matchedRate.rate)
      ).toString()
    }

    if (name === 'quantity') {

      updatedData.amount = (
        Number(value || 0) *
        Number(updatedData.rate || 0)
      ).toString()
    }

    setFormData(updatedData)
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault()

    setLoading(true)

    const { error } = await supabase
      .from('production_entries')
      .insert([
        {
          ...formData,
          quantity: Number(formData.quantity),
          rate: Number(formData.rate),
          amount: Number(formData.amount),
        },
      ])

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Entry saved successfully')

    const today = new Date()
      .toISOString()
      .split('T')[0]

    setFormData({
      production_date: today,
      factory: '',
      labour_name: '',
      machine: '',
      shift: '',
      mesh: '',
      bag_type: '',
      bag_name: '',
      quantity: '',
      rate: '',
      amount: '',
    })
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">

          <p className="text-gray-500 text-sm">
            Production Management
          </p>

          <h1 className="text-4xl font-bold mt-2 text-black">
            Add Production Entry
          </h1>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC DETAILS */}

          <div className="bg-white rounded-2xl shadow-md p-6 text-black">

            <h2 className="text-xl font-semibold mb-4">
              Basic Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="date"
                name="production_date"
                value={formData.production_date}
                onChange={handleChange}
                className="border p-4 rounded-xl"
                required
              />

              <select
                name="factory"
                value={formData.factory}
                onChange={handleChange}
                className="border p-4 rounded-xl"
                required
              >

                <option value="">
                  Select Factory
                </option>

                {factories.map((factory) => (

                  <option
                    key={factory.id}
                    value={factory.factory_name}
                  >
                    {factory.factory_name}
                  </option>

                ))}

              </select>

              <select
                name="machine"
                value={formData.machine}
                onChange={handleChange}
                className="border p-4 rounded-xl"
                required
              >

                <option value="">
                  Select Machine
                </option>

                {filteredMachines.map((machine) => (

                  <option
                    key={machine.id}
                    value={machine.machine_name}
                  >
                    {machine.machine_name}
                  </option>

                ))}

              </select>

              <input
                list="labours"
                name="labour_name"
                value={formData.labour_name}
                onChange={handleChange}
                placeholder="Labour Name"
                className="border p-4 rounded-xl"
                required
              />

              <datalist id="labours">

                {labours.map((labour) => (

                  <option
                    key={labour.id}
                    value={labour.labour_name}
                  />

                ))}

              </datalist>

              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="border p-4 rounded-xl"
                required
              >

                <option value="">
                  Select Shift
                </option>

                <option value="Day">
                  Day
                </option>

                <option value="Night">
                  Night
                </option>

              </select>

            </div>

          </div>

          {/* BAG DETAILS */}

          <div className="bg-white rounded-2xl shadow-md p-6 text-black">

            <h2 className="text-xl font-semibold mb-4">
              Bag Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <select
                name="mesh"
                value={formData.mesh}
                onChange={handleChange}
                className="border p-4 rounded-xl"
                required
              >

                <option value="">
                  Select Mesh
                </option>

                <option value="150#">
                  150#
                </option>

                <option value="200#">
                  200#
                </option>

                <option value="240#">
                  240#
                </option>

                <option value="250#">
                  250#
                </option>

                <option value="300#">
                  300#
                </option>

                <option value="325#">
                  325#
                </option>

              </select>

              <select
                name="bag_type"
                value={formData.bag_type}
                onChange={handleChange}
                className="border p-4 rounded-xl"
                required
              >

                <option value="">
                  Select Bag Type
                </option>

                <option value="50kg">
                  50kg
                </option>

                <option value="Jumbo Bag (1250kg)">
                  Jumbo Bag (1250kg)
                </option>

                <option value="Jumbo Bag (1350kg)">
                  Jumbo Bag (1350kg)
                </option>

                <option value="Jumbo Bag (1400kg)">
                  Jumbo Bag (1400kg)
                </option>

              </select>

              <input
                list="bagNames"
                name="bag_name"
                value={formData.bag_name}
                onChange={handleChange}
                placeholder="Bag Name"
                className="border p-4 rounded-xl"
                required
              />

              <datalist id="bagNames">

                {bagNames.map((bag) => (

                  <option
                    key={bag.id}
                    value={bag.bag_name}
                  />

                ))}

              </datalist>

              <input
                type="number"
                name="rate"
                value={formData.rate}
                readOnly
                placeholder="Rate"
                className="border p-4 rounded-xl bg-gray-100"
              />

            </div>

          </div>

          {/* PRODUCTION */}

          <div className="bg-white rounded-2xl shadow-md p-6 text-black">

            <h2 className="text-xl font-semibold mb-4">
              Production Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                className="border p-4 rounded-xl"
                required
              />

              <div className="bg-black text-white rounded-2xl p-6">

                <p className="text-gray-300">
                  Total Amount
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  ₹
                  {Number(
                    formData.amount || 0
                  ).toFixed(2)}
                </h2>

              </div>

            </div>

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-5 rounded-2xl text-lg font-semibold"
          >

            {loading
              ? 'Saving...'
              : 'Save Production Entry'}

          </button>

        </form>

      </div>

    </main>
  )
}