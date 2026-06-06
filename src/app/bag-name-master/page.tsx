'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { supabase } from '@/lib/supabase'
import RoleGuard from '@/components/RoleGuard'

type BagName = {
  id:string
  bag_name:string
}

export default function BagNameMasterPage(){

  const [loading,setLoading] =
    useState(false)

  const [items,setItems] =
    useState<BagName[]>([])

  const [bagName,setBagName] =
    useState('')

  const [editingId,setEditingId] =
    useState<string | null>(null)

  useEffect(()=>{

    loadData()

  },[])

  async function loadData(){

    const { data,error } =
      await supabase
        .from('bag_name_master')
        .select('*')
        .order(
          'bag_name',
          {
            ascending:true
          }
        )

    if(error){

      console.log(error)
      return

    }

    setItems(
      data || []
    )

  }

  async function saveBag(){

    if(!bagName){

      toast.error(
        'Enter Bag Name'
      )

      return

    }

    const existing =
      items.find(
        item =>
        item.bag_name
          .toLowerCase()
          .trim()
        ===
        bagName
          .toLowerCase()
          .trim()
      )

    if(existing){

      toast.error(
        'Bag already exists'
      )

      return

    }

    setLoading(true)

    const { error } =
      await supabase
        .from('bag_name_master')
        .insert([
          {
            bag_name:bagName
          }
        ])

    setLoading(false)

    if(error){

      toast.error(
        'Failed to save'
      )

      return

    }

    toast.success(
      'Bag added successfully'
    )

    setBagName('')

    loadData()

  }

  async function updateBag(
    id:string,
    bag_name:string
  ){

    const { error } =
      await supabase
        .from('bag_name_master')
        .update({
          bag_name
        })
        .eq(
          'id',
          id
        )

    if(error){

      toast.error(
        'Update failed'
      )

      return

    }

    toast.success(
      'Updated successfully'
    )

    setEditingId(null)

    loadData()

  }

  async function deleteBag(
    id:string
  ){

    const confirmed =
      window.confirm(
        'Delete this bag?'
      )

    if(!confirmed)
      return

    const { error } =
      await supabase
        .from('bag_name_master')
        .delete()
        .eq(
          'id',
          id
        )

    if(error){

      toast.error(
        'Delete failed'
      )

      return

    }

    toast.success(
      'Deleted successfully'
    )

    loadData()

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

          <div className="mb-6">

            <p className="text-slate-500 text-sm">
              Production Management
            </p>

            <h1 className="text-4xl font-bold text-slate-900 mt-2">
              Bag Name Master
            </h1>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">

            <h2 className="text-xl font-semibold mb-4">
              Add New Bag
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Bag Name"
                value={bagName}
                onChange={(e)=>
                  setBagName(
                    e.target.value
                  )
                }
                className="border border-slate-200 rounded-2xl p-3"
              />

            </div>

            <button
              onClick={saveBag}
              disabled={loading}
              className="
                mt-4
                px-6
                py-3
                bg-slate-900
                text-white
                rounded-2xl
                hover:bg-slate-800
              "
            >
              {
                loading
                ? 'Saving...'
                : 'Add Bag'
              }
            </button>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-x-auto">

            <table className="min-w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left p-3">
                    Bag Name
                  </th>

                  <th className="text-left p-3">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(item=>(

                  <BagRow
                    key={item.id}
                    item={item}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    updateBag={updateBag}
                    deleteBag={deleteBag}
                  />

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </RoleGuard>

  )

}

function BagRow({
  item,
  editingId,
  setEditingId,
  updateBag,
  deleteBag
}:any){

  const [bagName,setBagName] =
    useState(
      item.bag_name
    )

  const isEditing =
    editingId === item.id

  return (

    <tr className="border-b">

      <td className="p-3">

        {isEditing ? (

          <input
            type="text"
            value={bagName}
            onChange={(e)=>
              setBagName(
                e.target.value
              )
            }
            className="border rounded-xl p-2 w-full"
          />

        ) : (

          item.bag_name

        )}

      </td>

      <td className="p-3">

        {isEditing ? (

          <button
            onClick={()=>
              updateBag(
                item.id,
                bagName
              )
            }
            className="
              px-3 py-2
              bg-green-600
              text-white
              rounded-xl
              mr-2
            "
          >
            Save
          </button>

        ) : (

          <button
            onClick={()=>
              setEditingId(
                item.id
              )
            }
            className="
              px-3 py-2
              bg-blue-600
              text-white
              rounded-xl
              mr-2
            "
          >
            Edit
          </button>

        )}

        <button
          onClick={()=>
            deleteBag(
              item.id
            )
          }
          className="
            px-3 py-2
            bg-red-600
            text-white
            rounded-xl
          "
        >
          Delete
        </button>

      </td>

    </tr>

  )

}