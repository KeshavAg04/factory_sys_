'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'
import RoleGuard from '@/components/RoleGuard'

export default function CreditDebitPage(){

const [noteNumber,setNoteNumber] =
useState('')

const [adjustmentDate,setAdjustmentDate] =
useState('')

const [customerName,setCustomerName] =
useState('')

const [invoiceNumber,setInvoiceNumber] =
useState('')

const [adjustmentType,setAdjustmentType] =
useState('Credit Note')

const [amount,setAmount] =
useState('')

const [reason,setReason] =
useState('')

const [remarks,setRemarks] =
useState('')

const [customers,setCustomers] =
useState<string[]>([])

const [invoiceNumbers,setInvoiceNumbers] =
useState<string[]>([])

const [userFactory,setUserFactory] =
useState('')

useEffect(()=>{

const factory =
localStorage.getItem(
'userFactory'
) || ''

setUserFactory(
factory
)

loadCustomers(
factory
)

loadNextNumber(
'Credit Note'
)

},[])

async function loadCustomers(
factoryFilter = userFactory
){

let query =
supabase
.from('dispatch_entries')
.select('customer_name,invoice_number')

if(factoryFilter){

query =
query.eq(
'factory',
factoryFilter
)

}

const {data} =
await query

const uniqueCustomers =

[
...new Set(

(data || [])
.map(
row =>
row.customer_name
)
.filter(Boolean)

)

]

setCustomers(
uniqueCustomers as string[]
)

setInvoiceNumbers(
[
...new Set(
(data || [])
.map(
row =>
row.invoice_number
)
.filter(Boolean)
)
] as string[]
)

}

async function loadNextNumber(
type:string
){

const prefix =

type === 'Credit Note'

? 'CN'

: 'DN'

const {data} =
await supabase
.from('sales_adjustments')
.select('note_number')
.eq(
'adjustment_type',
type
)
.order(
'id',
{
ascending:false
}
)
.limit(1)

let next = 1

if(
data &&
data.length > 0
){

const last =
data[0].note_number

const lastNumber =
Number(
last.split('-')[1]
)

next =
lastNumber + 1

}

setNoteNumber(

`${prefix}-${String(next).padStart(4,'0')}`

)

}

async function saveEntry(){

if(
userFactory &&
!invoiceNumbers.includes(
invoiceNumber
)
){

alert(
'Select a Dadi dispatch invoice before saving.'
)

return

}

const {error} =
await supabase
.from(
'sales_adjustments'
)
.insert({

note_number:
noteNumber,

adjustment_date:
adjustmentDate,

customer_name:
customerName,

invoice_number:
invoiceNumber,

adjustment_type:
adjustmentType,

amount:
Number(amount),

reason,

remarks

})

if(error){

console.log(error)

alert(
'Save failed'
)

return

}

alert(
'Saved Successfully'
)

setAdjustmentDate('')
setCustomerName('')
setInvoiceNumber('')
setAmount('')
setReason('')
setRemarks('')

await loadNextNumber(
adjustmentType
)

}

return (

<RoleGuard
allowedRoles={[
'Admin',
'accounts'
]}
allowDadiFactory
>

    <div className='p-4 md:p-6 space-y-6'>
    
    <div>
    
    <p className='text-slate-500'>
    Dispatch Management
    </p>
    
    <h1 className='text-4xl font-bold'>
    Credit / Debit Notes
    </h1>
    
    </div>
    
    <div className='bg-white rounded-3xl p-6 max-w-4xl'>
    
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
    
    <div>
    
    <p className='text-sm text-slate-500 mb-1'>
    Note Number
    </p>
    
    <input
    value={noteNumber}
    readOnly
    className='border rounded-xl p-3 bg-slate-100 w-full'
    />
    
    </div>
    
    <div>
    
    <p className='text-sm text-slate-500 mb-1'>
    Date
    </p>
    
    <input
    type='date'
    value={adjustmentDate}
    onChange={e=>
    setAdjustmentDate(
    e.target.value
    )
    }
    className='border rounded-xl p-3 w-full'
    />
    
    </div>
    
    <div>
    
    <p className='text-sm text-slate-500 mb-1'>
    Customer
    </p>
    
    <select
    value={customerName}
    onChange={e=>
    setCustomerName(
    e.target.value
    )
    }
    className='border rounded-xl p-3 w-full'
    >
    
    <option value=''>
    Select Customer
    </option>
    
    {customers.map(
    customer=>(
    <option
    key={customer}
    value={customer}
    >
    {customer}
    </option>
    )
    )}
    
    </select>
    
    </div>
    
    <div>
    
    <p className='text-sm text-slate-500 mb-1'>
    Invoice Number
    </p>
    
    <input
    list="credit-debit-invoices"
    value={invoiceNumber}
    onChange={e=>
    setInvoiceNumber(
    e.target.value
    )
    }
    className='border rounded-xl p-3 w-full'
    />

    <datalist id="credit-debit-invoices">
    {invoiceNumbers.map(
    invoice=>(
    <option
    key={invoice}
    value={invoice}
    />
    )
    )}
    </datalist>
    
    </div>
    
    <div>
    
    <p className='text-sm text-slate-500 mb-1'>
    Type
    </p>
    
    <select
    value={adjustmentType}
    onChange={async e=>{
    
    const value =
    e.target.value
    
    setAdjustmentType(
    value
    )
    
    await loadNextNumber(
    value
    )
    
    }}
    className='border rounded-xl p-3 w-full'
    >
    
    <option>
    Credit Note
    </option>
    
    <option>
    Debit Note
    </option>
    
    </select>
    
    </div>
    
    <div>
    
    <p className='text-sm text-slate-500 mb-1'>
    Amount
    </p>
    
    <input
    type='number'
    value={amount}
    onChange={e=>
    setAmount(
    e.target.value
    )
    }
    className='border rounded-xl p-3 w-full'
    />
    
    </div>
    
    <div className='md:col-span-2'>
    
    <p className='text-sm text-slate-500 mb-1'>
    Reason
    </p>
    
    <input
    value={reason}
    onChange={e=>
    setReason(
    e.target.value
    )
    }
    className='border rounded-xl p-3 w-full'
    />
    
    </div>
    
    <div className='md:col-span-2'>
    
    <p className='text-sm text-slate-500 mb-1'>
    Remarks
    </p>
    
    <textarea
    value={remarks}
    onChange={e=>
    setRemarks(
    e.target.value
    )
    }
    rows={4}
    className='border rounded-xl p-3 w-full'
    />
    
    </div>
    
    </div>
    
    <div className='mt-6'>
    
    <button
    onClick={saveEntry}
    className='bg-slate-900 text-white px-6 py-3 rounded-xl'
    >
    
    Save
    
    </button>
    
    </div>
    
    </div>
    
    </div>

    </RoleGuard>
    
    )
    
    }
