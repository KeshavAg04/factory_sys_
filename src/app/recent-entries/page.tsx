'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  findProductionRate,
  getProductionRate,
  RateMasterRow,
} from '@/lib/productionRate'
import toast from 'react-hot-toast'
import RoleGuard
from '@/components/RoleGuard'

export default function RecentEntriesPage() {

  const [entries, setEntries] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [visibleCount, setVisibleCount] =
    useState(25)

  // FILTERS

  const [factoryFilter, setFactoryFilter] =
    useState('')

  const [machineFilter, setMachineFilter] =
    useState('')

  const [labourFilter, setLabourFilter] =
    useState('')

  const [shiftFilter, setShiftFilter] =
    useState('')

  const [dateFilter, setDateFilter] =
    useState('')

  const [search, setSearch] =
    useState('')
  
    const [userFactory,setUserFactory] =
    useState('')


  // EDIT

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [editData, setEditData] =
    useState<any>({})

  const [meshes, setMeshes] =
    useState<string[]>([])

  const [bagTypes, setBagTypes] =
    useState<string[]>([])

  const [bagNames, setBagNames] =
    useState<
      { id: string; bag_name: string }[]
    >([])

  const [rates, setRates] =
    useState<RateMasterRow[]>([])

    const fetchMasters = async () => {

      const [meshRes, bagTypeRes, bagNameRes, rateRes] =
        await Promise.all([
          supabase
            .from('rate_master')
            .select('mesh'),
          supabase
            .from('rate_master')
            .select('bag_type'),
          supabase
            .from('bag_name_master')
            .select('*'),
          supabase
            .from('rate_master')
            .select('*'),
        ])

      setMeshes([
        ...new Set(
          (meshRes.data || []).map(
            (item: { mesh: string }) =>
              item.mesh
          )
        ),
      ])

      setBagTypes([
        ...new Set(
          (bagTypeRes.data || []).map(
            (item: { bag_type: string }) =>
              item.bag_type
          )
        ),
      ])

      setBagNames(
        bagNameRes.data || []
      )

      setRates(
        rateRes.data || []
      )
    }

    const fetchEntries = async (
      factoryFilter = ''
      ) => {

    setLoading(true)

    const { data, error } =
      await supabase
        .from('production_entries')
        .select('*')
        .order('created_at', {
          ascending: false,
        })

        if (!error) {

          const filteredData =
        
            factoryFilter
        
              ? (data || []).filter(
                  row =>
                  row.factory ===
                  factoryFilter
                )
        
              : (data || [])
        
          setEntries(
            filteredData
          )
        
        }

    setLoading(false)
  }

    useEffect(() => {

      const factory =
        localStorage.getItem(
          'userFactory'
        ) || ''

      setUserFactory(factory)

      fetchEntries(factory)

      fetchMasters()

    }, [])

  // FILTER VALUES

  const factories =
    [...new Set(
      entries.map(
        (entry) => entry.factory
      )
    )]

  const machines =
    [...new Set(
      entries.map(
        (entry) => entry.machine
      )
    )]

  const labours =
    [...new Set(
      entries.map(
        (entry) => entry.labour_name
      )
    )]

  // FILTERED ENTRIES

  const filteredEntries =
  useMemo(() => {

    return entries.filter((entry) => {

      const matchesFactory =
        !factoryFilter ||
        entry.factory === factoryFilter

      const matchesMachine =
        !machineFilter ||
        entry.machine === machineFilter

      const matchesLabour =
        !labourFilter ||
        entry.labour_name === labourFilter

      const matchesShift =
        !shiftFilter ||
        entry.shift === shiftFilter

      const matchesDate =
        !dateFilter ||
        entry.production_date === dateFilter

      const matchesSearch =
        !search ||

        entry.bag_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        entry.labour_name
          ?.toLowerCase()
          .includes(search.toLowerCase())

          return (

            matchesFactory &&
            matchesMachine &&
            matchesLabour &&
            matchesShift &&
            matchesDate &&
            matchesSearch
          
          )

    })

  }, [
    entries,
    factoryFilter,
    machineFilter,
    labourFilter,
    shiftFilter,
    dateFilter,
    search
  ])
  // DELETE

  const deleteEntry = async (
    id: string
  ) => {

    const confirmDelete =
      confirm(
        'Delete this entry?'
      )

    if (!confirmDelete) return

    const { error } =
      await supabase
        .from('production_entries')
        .delete()
        .eq('id', id)

    if (!error) {

      toast.success(
        'Entry deleted'
      )

      fetchEntries()
    }
  }

  // EDIT

  const startEdit = (
    entry: any
  ) => {

    setEditingId(entry.id)

    setEditData({
      ...entry,
    })
  }

  const updateEditData = (
    updates: Record<
      string,
      string | number
    >
  ) => {

    const nextData = {
      ...editData,
      ...updates,
    }

    const shouldRecalculate =
      Object.prototype.hasOwnProperty.call(
        updates,
        'quantity'
      ) ||
      Object.prototype.hasOwnProperty.call(
        updates,
        'mesh'
      ) ||
      Object.prototype.hasOwnProperty.call(
        updates,
        'bag_type'
      )

    if (shouldRecalculate) {

      const currentRate =
        findProductionRate(
          rates,
          nextData.mesh,
          nextData.bag_type
        )

      if (currentRate !== null) {

        nextData.rate =
          currentRate

        nextData.amount =
          Number(
            nextData.quantity || 0
          ) * currentRate

      } else {

        nextData.rate = 0

        nextData.amount = 0
      }
    }

    setEditData(nextData)
  }

  const saveEdit = async () => {

    const currentRate =
      await getProductionRate(
        supabase,
        editData.mesh,
        editData.bag_type
      )

    if (currentRate === null) {

      toast.error(
        'Rate not found for selected Mesh & Bag Type'
      )

      return
    }

    const amount =
      Number(editData.quantity || 0) *
      currentRate

    const { error } =
      await supabase
        .from('production_entries')
        .update({
          production_date:
            editData.production_date,
          factory:
            editData.factory,
          machine:
            editData.machine,
          labour_name:
            editData.labour_name,
          shift:
            editData.shift,
          mesh:
            editData.mesh,
          bag_type:
            editData.bag_type,
          bag_name:
            editData.bag_name,
          quantity:
            Number(
              editData.quantity || 0
            ),
          rate:
            currentRate,
          amount,
        })
        .eq('id', editingId)

    if (!error) {

      toast.success(
        'Entry updated'
      )

      setEditingId(null)

      fetchEntries(userFactory)
    }
  }

  if (loading) {

    return (
      <main className="min-h-screen flex items-center justify-center text-slate-500 text-lg">
        Loading entries...
      </main>
    )
  }

  return (

    <RoleGuard
allowedRoles={[
'Admin',
'production'
]}
>


    <main className="min-h-screen bg-slate-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">

          <p className="text-slate-500 text-sm">
            Production Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Recent Entries
          </h1>

        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">

          <select
  value={
    userFactory ||
    factoryFilter
  }
  onChange={(e) =>
    setFactoryFilter(
      e.target.value
    )
  }
  disabled={
    userFactory !== ''
  }
              className="border border-slate-200 p-3 rounded-2xl"
              >

              <option value="">
                All Factories
              </option>

              {factories.map((factory) => (
                
                <option
                key={factory}
                value={factory}
                >
                  {factory}
                </option>

))}

            </select>

            <select
              value={machineFilter}
              onChange={(e) =>
                setMachineFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
              >

              <option value="">
                All Machines
              </option>

              {machines.map((machine) => (

                <option
                key={machine}
                value={machine}
                >
                  {machine}
                </option>

))}

            </select>

            <select
              value={labourFilter}
              onChange={(e) =>
                setLabourFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
              >

              <option value="">
                All Labours
              </option>

              {labours.map((labour) => (
                
                <option
                key={labour}
                value={labour}
                >
                  {labour}
                </option>

))}

            </select>

            <select
              value={shiftFilter}
              onChange={(e) =>
                setShiftFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
              >

              <option value="">
                All Shifts
              </option>

              <option value="Day">
                Day
              </option>

              <option value="Night">
                Night
              </option>

            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
              />

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="border border-slate-200 p-3 rounded-2xl"
              />

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-slate-200">

          <table className="w-full text-sm">

            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">

              <tr>

                <th className="p-4 text-left">
                  Date
                </th>

                <th className="p-4 text-left">
                  Factory
                </th>

                <th className="p-4 text-left">
                  Machine
                </th>

                <th className="p-4 text-left">
                  Labour
                </th>

                <th className="p-4 text-left">
                  Shift
                </th>

                <th className="p-4 text-left">
                  Mesh
                </th>

                <th className="p-4 text-left">
                  Bag
                </th>

                <th className="p-4 text-left">
                  Qty
                </th>

                <th className="p-4 text-left">
                  Amount
                </th>

                <th className="p-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredEntries
                .slice(0, visibleCount)
                .map((entry) => (
                  
                <tr
                key={entry.id}
                className="border-b border-slate-100"
                >

                  <td className="p-4">
                    {entry.production_date}
                  </td>

                  <td className="p-4">
                    {entry.factory}
                  </td>

                  <td className="p-4">
                    {entry.machine}
                  </td>

                  <td className="p-4">
                    {entry.labour_name}
                  </td>

                  <td className="p-4">
                    {entry.shift}
                  </td>

                  <td className="p-4">
                    {entry.mesh}
                  </td>

                  <td className="p-4">
                    {entry.bag_name}
                  </td>

                  <td className="p-4">
                    {entry.quantity}
                  </td>

                  <td className="p-4 font-semibold">
                    ₹{entry.amount}
                  </td>

                  <td className="p-4 flex gap-2">

                    <button
                      onClick={() =>
                        startEdit(entry)
                      }
                      className="bg-slate-800 text-white px-3 py-2 rounded-xl"
                      >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteEntry(entry.id)
                      }
                      className="bg-red-400 text-white px-3 py-2 rounded-xl"
                      >
                      Delete
                    </button>

                  </td>

                </tr>

))}

            </tbody>

          </table>

        </div>

        {/* LOAD MORE */}

        <div className="flex justify-center mt-6">

          {visibleCount <
            filteredEntries.length && (
              
              <button
              onClick={() =>
                setVisibleCount(
                  visibleCount + 25
                )
              }
              className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm"
              >
              Load More
            </button>

)}

        </div>

        {/* EDIT MODAL */}

        {editingId && (
          
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl">

              <h2 className="text-2xl font-bold mb-4 text-slate-900">
                Edit Entry
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  type="date"
                  value={editData.production_date || ''}
                  onChange={(e) =>
                    updateEditData({
                      production_date:
                        e.target.value,
                    })
                  }
                  className="border border-slate-200 p-3 rounded-2xl"
                />

                <input
                  value={editData.factory || ''}
                  onChange={(e) =>
                    updateEditData({
                      factory:
                        e.target.value,
                    })
                  }
                  placeholder="Factory"
                  className="border border-slate-200 p-3 rounded-2xl"
                />

                <input
                  value={editData.machine || ''}
                  onChange={(e) =>
                    updateEditData({
                      machine:
                        e.target.value,
                    })
                  }
                  placeholder="Machine"
                  className="border border-slate-200 p-3 rounded-2xl"
                />

                <input
                  value={editData.labour_name || ''}
                  onChange={(e) =>
                    updateEditData({
                      labour_name:
                        e.target.value,
                    })
                  }
                  placeholder="Labour Name"
                  className="border border-slate-200 p-3 rounded-2xl"
                />

                <select
                  value={editData.shift || ''}
                  onChange={(e) =>
                    updateEditData({
                      shift:
                        e.target.value,
                    })
                  }
                  className="border border-slate-200 p-3 rounded-2xl"
                >
                  <option value="Day">
                    Day
                  </option>
                  <option value="Night">
                    Night
                  </option>
                </select>

                <select
                  value={editData.mesh || ''}
                  onChange={(e) =>
                    updateEditData({
                      mesh:
                        e.target.value,
                    })
                  }
                  className="border border-slate-200 p-3 rounded-2xl"
                >
                  <option value="">
                    Select Mesh
                  </option>
                  {meshes.map((mesh) => (
                    <option
                      key={mesh}
                      value={mesh}
                    >
                      {mesh}
                    </option>
                  ))}
                </select>

                <select
                  value={editData.bag_type || ''}
                  onChange={(e) =>
                    updateEditData({
                      bag_type:
                        e.target.value,
                    })
                  }
                  className="border border-slate-200 p-3 rounded-2xl"
                >
                  <option value="">
                    Select Bag Type
                  </option>
                  {bagTypes.map((bagType) => (
                    <option
                      key={bagType}
                      value={bagType}
                    >
                      {bagType}
                    </option>
                  ))}
                </select>

                <select
                  value={editData.bag_name || ''}
                  onChange={(e) =>
                    updateEditData({
                      bag_name:
                        e.target.value,
                    })
                  }
                  className="border border-slate-200 p-3 rounded-2xl"
                >
                  <option value="">
                    Select Bag Name
                  </option>
                  {bagNames.map((bag) => (
                    <option
                      key={bag.id}
                      value={bag.bag_name}
                    >
                      {bag.bag_name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={editData.quantity || ''}
                  onChange={(e) =>
                    updateEditData({
                      quantity:
                        e.target.value,
                    })
                  }
                  placeholder="Quantity"
                  className="border border-slate-200 p-3 rounded-2xl"
                />

                <input
                  type="number"
                  value={editData.rate || 0}
                  readOnly
                  placeholder="Rate"
                  className="border border-slate-200 bg-slate-100 p-3 rounded-2xl"
                />

                <input
                  type="number"
                  value={editData.amount || 0}
                  readOnly
                  placeholder="Amount"
                  className="border border-slate-200 bg-slate-100 p-3 rounded-2xl"
                />

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={saveEdit}
                  className="bg-slate-800 text-white px-5 py-3 rounded-2xl"
                  >
                  Save
                </button>

                <button
                  onClick={() =>
                    setEditingId(null)
                  }
                  className="bg-slate-200 px-5 py-3 rounded-2xl"
                  >
                  Cancel
                </button>

              </div>

            </div>

          </div>

)}

      </div>

    </main>
</RoleGuard>
  )
}
