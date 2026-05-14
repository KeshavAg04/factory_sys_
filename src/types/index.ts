export interface ProductionEntry {
    id?: string
  
    date: string
    factory: string
    machine: string
    labour: string
    shift: string
  
    mesh: string
    bag_type: string
    bag_name: string
  
    quantity: number
    rate: number
    amount: number
  
    created_at?: string
  }