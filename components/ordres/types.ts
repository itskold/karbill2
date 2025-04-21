export type TRepairOrderStatus = "pending" | "in_progress" | "completed" | "cancelled"
export type TRepairOrderPriority = "low" | "medium" | "high" | "urgent"

export interface IRepairItem {
  id: string
  description: string
  estimatedHours: number
  technicianNotes?: string
  completed: boolean
  completedAt?: Date
  technicianId?: string
  technicianName?: string
}

export interface IPartItem {
  id: string
  name: string
  description?: string
  price: number
  supplier?: string
  quantity: number
  received: boolean
  receivedAt?: Date
}

export interface IRepairOrder {
  id: string
  number: string
  vehicleId: string
  clientId: string
  orderDate: Date
  estimatedCompletionDate: Date
  completedDate?: Date
  status: TRepairOrderStatus
  priority: TRepairOrderPriority
  customerComplaints?: string
  repairs: IRepairItem[]
  parts: IPartItem[]
  laborCost: number
  partsTotal: number
  total: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  assignedTechnicianId?: string
  assignedTechnicianName?: string
}

export interface IEmployee {
  id: string
  name: string
  role: string
  specialization: string
  email: string
  phone: string
  status: "active" | "inactive" | "on_leave"
  avatar?: string
}
