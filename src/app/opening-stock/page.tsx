'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { supabase } from '@/lib/supabase'
import RoleGuard from '@/components/RoleGuard'

type OpeningStock = {
  id:number
  bag_name:string
  opening_quantity:number
  minimum_stock:number
}

export default function OpeningStockPage(){

  const [loading,setLoading] =
    useState(false)

  const [items,setItems] =
    useState<OpeningStock[]>([])

  const [bagName,setBagName] =
    useState('')

  const [openingQuantity,setOpeningQuantity] =
    useState('')

  const [minimumStock,setMinimumStock] =
    useState('')

    const [bagNames,setBagNames] =
    useState<string[]>([])

  const [editingId,setEditingId] =
    useState<number | null>(null)

  useEffect(()=>{

    loadData()

  },[])
  useEffect(()=>{

    loadData()
    loadBagNames()
  
  },[])

  async function loadData(){

    const { data,error } =
      await supabase
        .from('opening_stock')
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
  async function loadBagNames(){

    const { data } =
      await supabase
        .from('bag_name_master')
        .select('bag_name')
        .order(
          'bag_name',
          {
            ascending:true
          }
        )
  
    setBagNames(
      data?.map(
        item=>item.bag_name
      ) || []
    )
  
  }

  async function saveBag(){

    if(!bagName){

      toast.error(
        'Enter Bag Name'
      )

      return

    }

    setLoading(true)

    const { error } =
      await supabase
        .from('opening_stock')
        .insert([
          {
            bag_name:
              bagName,

            opening_quantity:
              Number(
                openingQuantity || 0
              ),

            minimum_stock:
              Number(
                minimumStock || 0
              )
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
    setOpeningQuantity('')
    setMinimumStock('')

    loadData()

  }

  async function updateBag(
    id:number,
    opening_quantity:number,
    minimum_stock:number
  ){

    const { error } =
      await supabase
        .from('opening_stock')
        .update({
          opening_quantity,
          minimum_stock
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
    id:number
  ){

    const confirmed =
      window.confirm(
        'Delete this bag?'
      )

    if(!confirmed)
      return

    const { error } =
      await supabase
        .from('opening_stock')
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
              Opening Stock Master
            </h1>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">

            <h2 className="text-xl font-semibold mb-4">
              Add New Bag
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <select
  value={bagName}
  onChange={(e)=>
    setBagName(
      e.target.value
    )
  }
  className="border border-slate-200 rounded-2xl p-3"
>

  <option value="">
    Select Bag
  </option>

  {bagNames.map(
    bag=>(
      <option
        key={bag}
        value={bag}
      >
        {bag}
      </option>
    )
  )}

</select>
              <input
                type="number"
                placeholder="Opening Quantity"
                value={openingQuantity}
                onChange={(e)=>
                  setOpeningQuantity(
                    e.target.value
                  )
                }
                className="border border-slate-200 rounded-2xl p-3"
              />

              <input
                type="number"
                placeholder="Minimum Stock"
                value={minimumStock}
                onChange={(e)=>
                  setMinimumStock(
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
                    Opening Quantity
                  </th>

                  <th className="text-left p-3">
                    Minimum Stock
                  </th>

                  <th className="text-left p-3">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(item=>(

                  <OpeningStockRow
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

function OpeningStockRow({
  item,
  editingId,
  setEditingId,
  updateBag,
  deleteBag
}:any){

  const [openingQuantity,setOpeningQuantity] =
    useState(
      item.opening_quantity
    )

  const [minimumStock,setMinimumStock] =
    useState(
      item.minimum_stock
    )

  const isEditing =
    editingId === item.id

  return (

    <tr className="border-b">

      <td className="p-3 font-medium">

        {item.bag_name}

      </td>

      <td className="p-3">

        {isEditing ? (

          <input
            type="number"
            value={openingQuantity}
            onChange={(e)=>
              setOpeningQuantity(
                Number(
                  e.target.value
                )
              )
            }
            className="border rounded-xl p-2 w-32"
          />

        ) : (

          item.opening_quantity

        )}

      </td>

      <td className="p-3">

        {isEditing ? (

          <input
            type="number"
            value={minimumStock}
            onChange={(e)=>
              setMinimumStock(
                Number(
                  e.target.value
                )
              )
            }
            className="border rounded-xl p-2 w-32"
          />

        ) : (

          item.minimum_stock

        )}

      </td>

      <td className="p-3">

        {isEditing ? (

          <button
            onClick={()=>
              updateBag(
                item.id,
                openingQuantity,
                minimumStock
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