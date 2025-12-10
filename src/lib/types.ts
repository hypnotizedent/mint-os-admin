export type JobStatus = 'quote' | 'design' | 'prepress' | 'printing' | 'finishing' | 'delivery' | 'completed' | 'cancelled'

export type Priority = 'low' | 'normal' | 'high' | 'urgent'

export type MachineStatus = 'idle' | 'printing' | 'maintenance' | 'error' | 'offline'

export interface Job {
  id: string
  title: string
  customer: string
  customerId: string
  status: JobStatus
  priority: Priority
  dueDate: string
  createdAt: string
  description: string
  quantity: number
  fileCount: number
  assignedMachine?: string
  estimatedCost: number
  progress: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  totalOrders: number
  totalRevenue: number
  paidRevenue?: number    // Revenue from paid orders only
  quoteTotal?: number     // Total from pending quotes
  lastOrderDate: string
  status: 'active' | 'inactive'
}

export interface Machine {
  id: string
  name: string
  type: string
  status: MachineStatus
  utilization: number
  currentJob?: string
  lastMaintenance: string
  nextMaintenance: string
  totalJobs: number
  uptime: number
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  reorderLevel: number
  costPerUnit: number
  supplier: string
  lastRestocked: string
}

export interface FileItem {
  id: string
  name: string
  path: string
  size: number
  type: string
  uploadedAt: string
  uploadedBy?: string
  jobId?: string
  orderId?: string
  thumbnailUrl?: string
}

export interface DashboardStats {
  newQuotes: number
  inProduction: number
  dueThisWeek: number
  activeJobs: number
  completedToday: number
  revenue: number
  machinesOnline: number
  lowStockItems: number
  urgentJobs: number
}

// Production Calendar Types
export interface CapacityData {
  date: string
  scheduledJobs: number
  totalCapacity: number
  percentUtilized: number
  isOverbooked: boolean
}

export type CalendarView = 'month' | 'week' | 'day'

// Customer Portal Types - CustomerOrder uses full OrderStatus defined below
export interface CustomerOrder {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  date: string
  items: number
  trackingNumber?: string
}

export interface QuoteRequest {
  id: string
  quoteNumber: string
  status: 'pending' | 'approved' | 'rejected'
  description: string
  requestedDate: string
  estimatedTotal?: number
  expiresAt?: string
}

export interface CustomerNotification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  date: string
  read: boolean
  actionUrl?: string
}

export interface CustomerDashboardStats {
  ordersThisMonth: number
  pendingQuotes: number
  activeJobs: number
  activeOrders?: number      // Alias for Dashboard.tsx
  completedOrders?: number   // For Dashboard.tsx
  totalSpentYTD: number
  totalSpent?: number        // Alias for Dashboard.tsx
}

export interface CustomerUser {
  id: string
  name: string
  email: string
  company?: string
  avatar?: string
  role: 'customer'
}

// Billing & Invoicing Types
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Void'
export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded'
export type PaymentMethodType = 'Card' | 'Bank ACH' | 'PayPal'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Payment {
  id: string
  date: string
  amount: number
  paymentMethod: string
  status: PaymentStatus
  transactionId?: string
}

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  last4: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  token: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  orderNumber: string
  nickname?: string
  invoiceDate: string
  dueDate: string
  status: InvoiceStatus
  subtotal: number
  tax: number
  shipping: number
  total: number
  amountPaid: number
  balance: number
  lineItems: InvoiceItem[]
  paymentHistory: Payment[]
  customerName: string
  customerEmail: string
  customerAddress?: {
    street: string
    street2?: string
    city: string
    state: string
    zip: string
    country?: string
  }
}

export interface AccountBalance {
  totalOutstanding: number
  overdueAmount: number
  currentAmount: number
  invoiceCount: number
}
// Order types for customer portal
export type OrderStatus = 
  | 'quote'
  | 'pending'
  | 'in_production'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'invoice_paid'
  | 'payment_due'

export interface OrderCustomer {
  name: string
  email: string
  company?: string
  firstName?: string
  lastName?: string
}

export interface OrderAddress {
  street: string
  street2?: string
  city: string
  state: string
  zip: string
  country?: string
}

export interface OrderLineItem {
  id: string
  description: string
  category?: string
  quantity: number
  unitCost: number
  taxable: boolean
  total: number
}

export interface OrderTotals {
  subtotal: number
  tax: number
  shipping: number
  discount: number
  fees: number
  total: number
  amountPaid: number
  amountOutstanding: number
}

export interface OrderTimeline {
  createdAt: string
  updatedAt: string
  dueDate?: string
  customerDueDate?: string
  paymentDueDate?: string
}

export interface Order {
  id: number
  attributes: {
    printavoId: string
    customer: OrderCustomer
    billingAddress?: OrderAddress
    shippingAddress?: OrderAddress
    status: OrderStatus
    totals: OrderTotals
    lineItems: OrderLineItem[]
    timeline: OrderTimeline
    notes?: string
    productionNotes?: string
    orderNickname?: string
    publicHash?: string
    approved?: boolean
  }
}

export interface OrderListResponse {
  data: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed'
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type TicketCategory = 'Order Issue' | 'Art Approval' | 'Shipping' | 'Billing' | 'General'

export interface TicketAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

export interface TicketComment {
  id: string
  ticketId: string
  userId: string
  userType: 'customer' | 'staff'
  message: string
  isInternal: boolean
  createdAt: string
  attachments?: TicketAttachment[]
}

export interface SupportTicket {
  id: string
  ticketNumber: string
  customerId: string
  customerName?: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  subject: string
  description: string
  orderNumber?: string
  createdAt: string
  updatedAt: string
  closedAt?: string
  assignedTo?: string
  comments?: TicketComment[]
  attachments?: TicketAttachment[]
}
export type QuoteStatus = 'Pending' | 'Approved' | 'Rejected' | 'Expired' | 'Converted'

export interface QuoteItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  colors: number
  printLocations: string[]
  description: string
  total: number
}

export interface ChangeRequest {
  id: string
  requestedAt: string
  comments: string
  status: 'Pending' | 'Reviewed'
}

export interface QuoteFile {
  id: string
  name: string
  url: string
  type: string
}

export interface Quote {
  id: string
  quoteNumber: string
  customerId: string
  status: QuoteStatus
  createdAt: string
  expiresAt: string
  approvedAt?: string
  rejectedAt?: string
  convertedAt?: string
  orderNumber?: string

  lineItems: QuoteItem[]
  subtotal: number
  setupFees: number
  rushFee: number
  tax: number
  total: number

  artworkFiles: QuoteFile[]
  proofFile?: QuoteFile

  approvalSignature?: string
  approvalName?: string
  approvalEmail?: string

  rejectionReason?: string
  changeRequests: ChangeRequest[]

  notes?: string
}

// Strapi API response types for data fetching
export interface StrapiCustomer {
  id: number
  documentId?: string
  name?: string
  email?: string
  phone?: string
  company?: string
  updatedAt?: string
}

export interface StrapiOrderItem {
  quantity?: number
}

export interface StrapiOrder {
  id: number
  documentId?: string
  orderNumber?: string
  status?: string
  dueDate?: string
  createdAt?: string
  notes?: string
  totalAmount?: number
  items?: StrapiOrderItem[]
  customer?: {
    documentId?: string
    name?: string
  }
}

// Valid payment methods constant - used for validation
export const VALID_PAYMENT_METHODS = [
  'cash',
  'check',
  'credit_card',
  'debit_card',
  'bank_transfer',
  'paypal',
  'venmo',
  'zelle',
  'other'
] as const;

export type ValidPaymentMethod = typeof VALID_PAYMENT_METHODS[number];

// Payment method enum for UI display
export type PaymentMethodEnum = 'cash' | 'check' | 'credit_card' | 'ach' | 'stripe' | 'bank_transfer' | 'other';

// Payment status enum for UI display
export type PaymentStatusEnum = 'paid' | 'pending' | 'processing' | 'failed' | 'refunded' | 'expired' | 'cancelled';

// Payment types used by the payments API
export interface OrderPayment {
  id: string;
  documentId: string;
  amount: number;
  status: PaymentStatusEnum;
  paymentType?: 'deposit' | 'balance' | 'refund';
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate?: string;
  recordedBy?: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentFormData {
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface PaymentsDashboardSummary {
  totalOutstanding: number;
  paymentsThisWeek: number;
  paymentsThisMonth: number;
  overdueCount: number;
  outstandingOrders: OutstandingOrderSummary[];
}

export interface OutstandingOrderSummary {
  id: string;
  documentId: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  amountPaid: number;
  amountOutstanding: number;
  dueDate?: string;
}
