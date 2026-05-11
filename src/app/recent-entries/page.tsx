'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Entry {
  id: string
  production_date: string
  factory: string
  labour_name: string
  machine: string
  shift: string
  mesh: string
  bag_type: string
  bag_name: string
  quantity: number
  rate: number
  amount: number
}

export default function RecentEntriesPage() {

  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  const [bags, setBags] = useState<any[]>([])
  const [labours, setLabours] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [factories, setFactories] = useState<any[]>([])

  const [editingEntry, setEditingEntry] =
    useState<Entry | null>(null)

  const [editDate, setEditDate] =
    useState('')

  const [editFactory, setEditFactory] =
    useState('')

  const [editLabour, setEditLabour] =
    useState('')

  const [editMachine, setEditMachine] =
    useState('')

  const [editShift, setEditShift] =
    useState('')

  const [editMesh, setEditMesh] =
    useState('')

  const [editBagType, setEditBagType] =
    useState('')

  const [editBagName, setEditBagName] =
    useState('')

  const [editQuantity, setEditQuantity] =
    useState('')

  const [editRate, setEditRate] =
    useState('')

  useEffect(() => {

    fetchEntries()

    fetchMasters()

  }, [])

  const fetchMasters = async () => {

    const { data: bagsData } =
      await supabase
        .from('bag_master')
        .select('*')

    const { data: labourData } =
      await supabase
        .from('labour_master')
        .select('*')

    const { data: machineData } =
      await supabase
        .from('machine_master')
        .select('*')

    const { data: factoryData } =
      await supabase
        .from('factory_master')
        .select('*')

    setBags(bagsData || [])
    setLabours(labourData || [])
    setMachines(machineData || [])
    setFactories(factoryData || [])
  }

  const fetchEntries = async () => {

    const { data, error } = await supabase
      .from('production_entries')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(15)

    if (error) {
      console.log(error)
      return
    }

    setEntries(data || [])
    setLoading(false)
  }

  const deleteEntry = async (
    id: string
  ) => {

    const confirmDelete = confirm(
      'Delete this entry?'
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from('production_entries')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchEntries()
  }

  const updateEntry = async () => {

    if (!editingEntry) return

    const quantity =
      Number(editQuantity)

    const rate =
      Number(editRate)

    const amount =
      quantity * rate

    const { error } = await supabase
      .from('production_entries')
      .update({
        production_date: editDate,
        factory: editFactory,
        labour_name: editLabour,
        machine: editMachine,
        shift: editShift,
        mesh: editMesh,
        bag_type: editBagType,
        bag_name: editBagName,
        quantity,
        rate,
        amount,
      })
      .eq('id', editingEntry.id)

    if (error) {
      alert(error.message)
      return
    }

    setEditingEntry(null)

    fetchEntries()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">

          <p className="text-gray-500 text-sm">
            Production Management
          </p>

          <h1 className="text-4xl font-bold mt-2 text-black">
            Recent Entries
          </h1>

        </div>

        {/* CONTENT */}

        {loading ? (

          <div className="bg-white rounded-2xl p-6 shadow-md text-black">
            Loading...
          </div>

        ) : (

          <div className="space-y-4">

            {entries.map((entry) => (

              <div
                key={entry.id}
                className="bg-white rounded-2xl shadow-md p-6 text-black"
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <h2 className="text-2xl font-bold">
                      {entry.bag_name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {entry.production_date}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">

                      <div>
                        <span className="font-semibold">
                          Factory:
                        </span>{' '}
                        {entry.factory}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Labour:
                        </span>{' '}
                        {entry.labour_name}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Machine:
                        </span>{' '}
                        {entry.machine}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Shift:
                        </span>{' '}
                        {entry.shift}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Mesh:
                        </span>{' '}
                        {entry.mesh}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Bag Type:
                        </span>{' '}
                        {entry.bag_type}
                      </div>

                    </div>

                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3">

                    <div>

                      <p className="text-gray-500 text-sm">
                        Quantity
                      </p>

                      <h2 className="text-3xl font-bold">
                        {entry.quantity}
                      </h2>

                    </div>

                    <div>

                      <p className="text-gray-500 text-sm">
                        Amount
                      </p>

                      <h2 className="text-2xl font-bold">
                        ₹{entry.amount}
                      </h2>

                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() => {

                          setEditingEntry(entry)

                          setEditDate(
                            entry.production_date || ''
                          )

                          setEditFactory(
                            entry.factory || ''
                          )

                          setEditLabour(
                            entry.labour_name || ''
                          )

                          setEditMachine(
                            entry.machine || ''
                          )

                          setEditShift(
                            entry.shift || ''
                          )

                          setEditMesh(
                            entry.mesh || ''
                          )

                          setEditBagType(
                            entry.bag_type || ''
                          )

                          setEditBagName(
                            entry.bag_name || ''
                          )

                          setEditQuantity(
                            entry.quantity?.toString() || ''
                          )

                          setEditRate(
                            entry.rate?.toString() || ''
                          )
                        }}
                        className="bg-black text-white px-4 py-2 rounded-xl"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteEntry(entry.id)
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-xl"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

        {/* EDIT MODAL */}

        {editingEntry && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">

            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl text-black">

              <h2 className="text-2xl font-bold mb-6">
                Edit Entry
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  type="date"
                  value={editDate}
                  onChange={(e) =>
                    setEditDate(e.target.value)
                  }
                  className="border p-4 rounded-xl"
                />

                <input
                  list="factories"
                  value={editFactory}
                  onChange={(e) =>
                    setEditFactory(e.target.value)
                  }
                  placeholder="Factory"
                  className="border p-4 rounded-xl"
                />

                <datalist id="factories">
                  {factories.map((factory) => (
                    <option
                      key={factory.id}
                      value={factory.factory_name}
                    />
                  ))}
                </datalist>

                <input
                  list="labours"
                  value={editLabour}
                  onChange={(e) =>
                    setEditLabour(e.target.value)
                  }
                  placeholder="Labour"
                  className="border p-4 rounded-xl"
                />

                <datalist id="labours">
                  {labours.map((labour) => (
                    <option
                      key={labour.id}
                      value={labour.labour_name}
                    />
                  ))}
                </datalist>

                <input
                  list="machines"
                  value={editMachine}
                  onChange={(e) =>
                    setEditMachine(e.target.value)
                  }
                  placeholder="Machine"
                  className="border p-4 rounded-xl"
                />

                <datalist id="machines">
                  {machines.map((machine) => (
                    <option
                      key={machine.id}
                      value={machine.machine_name}
                    />
                  ))}
                </datalist>

                <select
                  value={editShift}
                  onChange={(e) =>
                    setEditShift(e.target.value)
                  }
                  className="border p-4 rounded-xl"
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

                <input
                  value={editMesh}
                  onChange={(e) =>
                    setEditMesh(e.target.value)
                  }
                  placeholder="Mesh"
                  className="border p-4 rounded-xl"
                />

                <input
                  list="bagTypes"
                  value={editBagType}
                  onChange={(e) =>
                    setEditBagType(e.target.value)
                  }
                  placeholder="Bag Type"
                  className="border p-4 rounded-xl"
                />

                <datalist id="bagTypes">
                  {bags.map((bag) => (
                    <option
                      key={bag.id}
                      value={bag.bag_type}
                    />
                  ))}
                </datalist>

                <input
                  list="bagNames"
                  value={editBagName}
                  onChange={(e) =>
                    setEditBagName(e.target.value)
                  }
                  placeholder="Bag Name"
                  className="border p-4 rounded-xl"
                />

                <datalist id="bagNames">
                  {bags.map((bag) => (
                    <option
                      key={bag.id}
                      value={bag.bag_name}
                    />
                  ))}
                </datalist>

                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) =>
                    setEditQuantity(e.target.value)
                  }
                  placeholder="Quantity"
                  className="border p-4 rounded-xl"
                />

                <input
                  type="number"
                  value={editRate}
                  onChange={(e) =>
                    setEditRate(e.target.value)
                  }
                  placeholder="Rate"
                  className="border p-4 rounded-xl"
                />

              </div>

              <div className="mt-6 bg-gray-100 rounded-2xl p-6">

                <p className="text-gray-500">
                  Calculated Amount
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  ₹
                  {(Number(editQuantity || 0) *
                    Number(editRate || 0)).toFixed(2)}
                </h2>

              </div>

              <div className="flex gap-4 mt-6">

                <button
                  onClick={updateEntry}
                  className="flex-1 bg-black text-white p-4 rounded-xl"
                >
                  Save Changes
                </button>

                <button
                  onClick={() =>
                    setEditingEntry(null)
                  }
                  className="flex-1 bg-gray-300 p-4 rounded-xl"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>
  )
}