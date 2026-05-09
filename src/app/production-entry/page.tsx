'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Bag {
  id: string
  bag_type: string
  bag_name: string
  mesh: string
  rate: number
}

interface Labour {
  id: string
  labour_name: string
}

interface Machine {
  id: string
  machine_name: string
}

interface Factory {
  id: string
  factory_name: string
}

export default function Home() {
  const [bags, setBags] = useState<Bag[]>([])
  const [labours, setLabours] = useState<Labour[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [factories, setFactories] = useState<Factory[]>([])

  const [formData, setFormData] = useState({
    production_date: '',
    factory: '',
    labour_name: '',
    machine: '',
    shift: '',
    bag_name: '',
    quantity: '',
    bag_type: '',
    mesh: '',
    rate: '',
  })

  const [loading, setLoading] = useState(false)

  const amount =
    Number(formData.quantity || 0) *
    Number(formData.rate || 0)

  useEffect(() => {
    fetchBags()
    fetchLabours()
    fetchMachines()
    fetchFactories()
  }, [])

  const fetchBags = async () => {
    const { data } = await supabase
      .from('bag_master')
      .select('*')

    if (data) setBags(data)
  }

  const fetchLabours = async () => {
    const { data } = await supabase
      .from('labour_master')
      .select('*')

    if (data) setLabours(data)
  }

  const fetchMachines = async () => {
    const { data } = await supabase
      .from('machine_master')
      .select('*')

    if (data) setMachines(data)
  }

  const fetchFactories = async () => {
    const { data } = await supabase
      .from('factory_master')
      .select('*')

    if (data) setFactories(data)
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target

    if (name === 'bag_name') {
      const selectedBag = bags.find(
        (bag) => bag.bag_name === value
      )

      if (selectedBag) {
        setFormData({
          ...formData,
          bag_name: selectedBag.bag_name,
          bag_type: selectedBag.bag_type,
          mesh: selectedBag.mesh,
          rate: selectedBag.rate.toString(),
        })

        return
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    })
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
          production_date:
            formData.production_date,
          factory: formData.factory,
          labour_name: formData.labour_name,
          machine: formData.machine,
          shift: formData.shift,
          mesh: formData.mesh,
          bag_type: formData.bag_type,
          bag_name: formData.bag_name,
          quantity: Number(formData.quantity),
          rate: Number(formData.rate),
          amount: amount,
        },
      ])

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Production entry added successfully!')

    setFormData({
      production_date: '',
      factory: '',
      labour_name: '',
      machine: '',
      shift: '',
      bag_name: '',
      quantity: '',
      bag_type: '',
      mesh: '',
      rate: '',
    })
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">
          Production Entry
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="date"
            name="production_date"
            value={formData.production_date}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />

          <select
            name="factory"
            value={formData.factory}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
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
            name="labour_name"
            value={formData.labour_name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >
            <option value="">
              Select Labour
            </option>

            {labours.map((labour) => (
              <option
                key={labour.id}
                value={labour.labour_name}
              >
                {labour.labour_name}
              </option>
            ))}
          </select>

          <select
            name="machine"
            value={formData.machine}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >
            <option value="">
              Select Machine
            </option>

            {machines.map((machine) => (
              <option
                key={machine.id}
                value={machine.machine_name}
              >
                {machine.machine_name}
              </option>
            ))}
          </select>

          <select
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >
            <option value="">
              Select Shift
            </option>
            <option value="Day">Day</option>
            <option value="Night">Night</option>
          </select>

          <select
            name="bag_name"
            value={formData.bag_name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >
            <option value="">
              Select Bag Name
            </option>

            {bags.map((bag) => (
              <option
                key={bag.id}
                value={bag.bag_name}
              >
                {bag.bag_name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={formData.bag_type}
            placeholder="Bag Type"
            className="w-full border p-3 rounded-lg bg-gray-100"
            readOnly
          />

          <input
            type="text"
            value={formData.mesh}
            placeholder="Mesh"
            className="w-full border p-3 rounded-lg bg-gray-100"
            readOnly
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="number"
            value={formData.rate}
            placeholder="Rate"
            className="w-full border p-3 rounded-lg bg-gray-100"
            readOnly
          />

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-lg font-semibold">
              Amount: ₹{amount}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg"
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