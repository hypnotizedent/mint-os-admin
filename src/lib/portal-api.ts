/**
 * Customer Portal API Service
 * 
 * Connects to Strapi CMS for customer-facing portal operations.
 * All endpoints are public (auth: false) for internal dashboard access.
 * 
 * Created: November 29, 2025
 */

import type { Quote, QuoteStatus } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://100.92.156.118:1337';

// ============================================================================
// Types
// ============================================================================

export interface PortalCustomer {
  id: string;
  documentId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  printavoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalOrder {
  id: string;
  documentId: string;
  orderNumber: string;
  orderNickname?: string;
  visualId?: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  amountOutstanding: number;
  dueDate?: string;
  customerDueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lineItems?: PortalLineItem[];
}

export interface PortalLineItem {
  id: string;
  documentId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  style?: string;
  color?: string;
  sizes?: Record<string, number>;
}

export interface PortalQuote {
  id: string;
  documentId: string;
  quoteNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  totalAmount: number;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  lineItems?: PortalLineItem[];
}

export interface PortalStats {
  ordersThisMonth: number;
  pendingQuotes: number;
  activeJobs: number;
  totalSpentYTD: number;
}

export interface AuthResponse {
  success: boolean;
  customer?: PortalCustomer;
  token?: string;
  error?: string;
}

// ============================================================================
// Authentication
// ============================================================================

/**
 * Login customer by email
 * Looks up customer in Strapi by email address
 */
export async function loginCustomer(email: string): Promise<AuthResponse> {
  try {
    // Find customer by email
    const response = await fetch(
      `${API_BASE}/api/customers?filters[email][$eqi]=${encodeURIComponent(email)}&pagination[limit]=1`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return { success: false, error: 'No account found with that email address' };
    }
    
    const customerData = data.data[0];
    const customer: PortalCustomer = {
      id: customerData.id.toString(),
      documentId: customerData.documentId,
      name: customerData.name || 'Customer',
      email: customerData.email,
      phone: customerData.phone,
      company: customerData.company,
      printavoId: customerData.printavoId,
      createdAt: customerData.createdAt,
      updatedAt: customerData.updatedAt,
    };
    
    // Generate a simple session token (in production, use proper JWT)
    const token = btoa(JSON.stringify({ 
      customerId: customer.documentId, 
      email: customer.email,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    
    return { success: true, customer, token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to connect to server' };
  }
}

/**
 * Verify session token and return customer data
 */
export async function verifySession(token: string): Promise<AuthResponse> {
  try {
    const decoded = JSON.parse(atob(token));
    
    // Check expiration
    if (decoded.exp < Date.now()) {
      return { success: false, error: 'Session expired' };
    }
    
    // Fetch fresh customer data
    const response = await fetch(
      `${API_BASE}/api/customers/${decoded.customerId}`
    );
    
    if (!response.ok) {
      return { success: false, error: 'Customer not found' };
    }
    
    const data = await response.json();
    const customerData = data.data;
    
    const customer: PortalCustomer = {
      id: customerData.id.toString(),
      documentId: customerData.documentId,
      name: customerData.name || 'Customer',
      email: customerData.email,
      phone: customerData.phone,
      company: customerData.company,
      printavoId: customerData.printavoId,
      createdAt: customerData.createdAt,
      updatedAt: customerData.updatedAt,
    };
    
    return { success: true, customer, token };
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, error: 'Invalid session' };
  }
}

// ============================================================================
// Orders
// ============================================================================

/**
 * Fetch orders for a customer
 */
export async function fetchCustomerOrders(
  customerId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
  } = {}
): Promise<{ orders: PortalOrder[]; total: number; pages: number }> {
  const { page = 1, limit = 10, status, sortBy = 'createdAt:desc' } = options;
  
  try {
    // First get customer's printavoId
    const customerRes = await fetch(`${API_BASE}/api/customers/${customerId}`);
    if (!customerRes.ok) {
      throw new Error('Customer not found');
    }
    const customerData = await customerRes.json();
    const printavoCustomerId = customerData.data?.printavoId;
    
    if (!printavoCustomerId) {
      return { orders: [], total: 0, pages: 0 };
    }
    
    // Build query params
    const params = new URLSearchParams({
      'filters[printavoCustomerId][$eq]': printavoCustomerId,
      'pagination[page]': page.toString(),
      'pagination[pageSize]': limit.toString(),
      'sort': sortBy,
    });
    
    if (status) {
      params.append('filters[status][$eq]', status);
    }
    
    const response = await fetch(`${API_BASE}/api/orders?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    const orders: PortalOrder[] = (data.data || []).map((o: any) => ({
      id: o.id.toString(),
      documentId: o.documentId,
      orderNumber: o.orderNumber || o.visualId || `#${o.id}`,
      visualId: o.visualId,
      status: o.status || 'PENDING',
      totalAmount: o.totalAmount || 0,
      amountPaid: o.amountPaid || 0,
      amountOutstanding: o.amountOutstanding || 0,
      dueDate: o.dueDate,
      customerDueDate: o.customerDueDate,
      notes: o.notes,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
    
    const pagination = data.meta?.pagination || { total: orders.length, pageCount: 1 };
    
    return {
      orders,
      total: pagination.total,
      pages: pagination.pageCount,
    };
  } catch (error) {
    console.error('Fetch orders error:', error);
    return { orders: [], total: 0, pages: 0 };
  }
}

/**
 * Fetch single order with line items
 */
export async function fetchOrderDetail(
  orderId: string
): Promise<PortalOrder | null> {
  try {
    const response = await fetch(
      `${API_BASE}/api/orders/${orderId}?populate=lineItems`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const o = data.data;
    
    return {
      id: o.id.toString(),
      documentId: o.documentId,
      orderNumber: o.orderNumber || o.visualId || `#${o.id}`,
      visualId: o.visualId,
      status: o.status || 'PENDING',
      totalAmount: o.totalAmount || 0,
      amountPaid: o.amountPaid || 0,
      amountOutstanding: o.amountOutstanding || 0,
      dueDate: o.dueDate,
      customerDueDate: o.customerDueDate,
      notes: o.notes,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      lineItems: (o.lineItems || []).map((li: any) => ({
        id: li.id.toString(),
        documentId: li.documentId,
        description: li.description || li.style || 'Item',
        quantity: li.quantity || 0,
        unitPrice: li.unitPrice || 0,
        totalPrice: li.totalPrice || (li.quantity * li.unitPrice) || 0,
        style: li.style,
        color: li.color,
        sizes: li.sizes,
      })),
    };
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return null;
  }
}

/**
 * Fetch single order with line items (alternative signature for portal components)
 * @param orderId - Order ID or documentId
 * @param _customerId - Customer ID (used for validation, currently not enforced)
 */
export async function fetchOrderDetails(
  orderId: string,
  _customerId: string
): Promise<PortalOrder | null> {
  // For now, we just call fetchOrderDetail since the API doesn't filter by customer
  // In a production environment, you might want to verify customer ownership
  return fetchOrderDetail(orderId);
}

// ============================================================================
// Quotes
// ============================================================================

/**
 * Fetch quotes for a customer
 */
export async function fetchCustomerQuotes(
  customerId: string,
  options: {
    status?: string;
    limit?: number;
  } = {}
): Promise<PortalQuote[]> {
  const { status, limit = 50 } = options;
  
  try {
    // First get customer's printavoId for filtering
    const customerRes = await fetch(`${API_BASE}/api/customers/${customerId}`);
    let printavoCustomerId: string | null = null;
    
    if (customerRes.ok) {
      const customerData = await customerRes.json();
      printavoCustomerId = customerData.data?.printavoId;
    }
    
    const params = new URLSearchParams({
      'pagination[limit]': limit.toString(),
      'sort': 'createdAt:desc',
      'populate': 'customer',
    });
    
    // Filter by customer using customerId relation or printavoCustomerId
    if (customerId) {
      params.append('filters[$or][0][customer][documentId][$eq]', customerId);
      if (printavoCustomerId) {
        params.append('filters[$or][1][printavoCustomerId][$eq]', printavoCustomerId);
      }
    }
    
    if (status) {
      params.append('filters[status][$eq]', status);
    }
    
    const response = await fetch(`${API_BASE}/api/quotes?${params}`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    return (data.data || []).map((q: any) => ({
      id: q.id.toString(),
      documentId: q.documentId,
      quoteNumber: q.quoteNumber || `Q-${q.id}`,
      status: q.status || 'draft',
      totalAmount: q.total || q.subtotal || 0,
      expiresAt: q.expiresAt,
      notes: q.customerNotes || q.internalNotes,
      createdAt: q.createdAt,
    }));
  } catch (error) {
    console.error('Fetch quotes error:', error);
    return [];
  }
}

// ============================================================================
// Dashboard Stats
// ============================================================================

/**
 * Fetch dashboard statistics for a customer
 */
export async function fetchCustomerStats(
  customerId: string
): Promise<PortalStats> {
  try {
    // Fetch orders to calculate stats
    const { orders, total } = await fetchCustomerOrders(customerId, { limit: 100 });
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Calculate stats
    const ordersThisMonth = orders.filter(o => 
      new Date(o.createdAt) >= startOfMonth
    ).length;
    
    const activeJobs = orders.filter(o => 
      ['PENDING', 'IN_PRODUCTION', 'PREPRESS', 'PRINTING'].includes(o.status?.toUpperCase() || '')
    ).length;
    
    const totalSpentYTD = orders
      .filter(o => new Date(o.createdAt) >= startOfYear)
      .reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    
    // Fetch pending quotes
    const quotes = await fetchCustomerQuotes(customerId, { status: 'pending' });
    
    return {
      ordersThisMonth,
      pendingQuotes: quotes.length,
      activeJobs,
      totalSpentYTD,
    };
  } catch (error) {
    console.error('Fetch stats error:', error);
    return {
      ordersThisMonth: 0,
      pendingQuotes: 0,
      activeJobs: 0,
      totalSpentYTD: 0,
    };
  }
}

// ============================================================================
// Quote Actions
// ============================================================================

/**
 * Fetch a single quote with full details
 */
export async function fetchQuoteDetails(
  quoteId: string
): Promise<Quote | null> {
  try {
    const response = await fetch(
      `${API_BASE}/api/quotes/${quoteId}?populate=*`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const q = data.data;

    // Map Strapi response to Quote type
    return {
      id: q.id.toString(),
      quoteNumber: q.quoteNumber || `Q-${q.id}`,
      customerId: q.customerId || '',
      status: mapQuoteStatus(q.status),
      createdAt: q.createdAt,
      expiresAt: q.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      approvedAt: q.approvedAt,
      rejectedAt: q.rejectedAt,
      convertedAt: q.convertedAt,
      orderNumber: q.orderNumber,
      lineItems: (q.lineItems || []).map((item: any) => ({
        id: item.id?.toString() || crypto.randomUUID?.() || `item-${Math.random()}`,
        productName: item.productName || item.name || 'Item',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.price || 0,
        colors: item.colors || 1,
        printLocations: item.printLocations || [],
        description: item.description || '',
        total: (item.quantity || 1) * (item.unitPrice || item.price || 0),
      })),
      subtotal: q.subtotal || q.total || 0,
      setupFees: q.setupFees || 0,
      rushFee: q.rushFee || 0,
      tax: q.taxAmount || q.tax || 0,
      total: q.total || q.subtotal || 0,
      artworkFiles: (q.mockupUrls || []).map((url: string, i: number) => ({
        id: `mockup-${i}`,
        name: `Mockup ${i + 1}`,
        url: url,
        type: 'image/png',
      })),
      proofFile: undefined,
      approvalSignature: q.approverSignature,
      approvalName: q.approvedBy?.split('<')[0]?.trim(),
      approvalEmail: q.approvedBy?.match(/<(.+)>/)?.[1],
      rejectionReason: q.rejectionReason,
      changeRequests: [],  // Not in schema - would need separate content type
      notes: q.customerNotes || q.internalNotes,
    };
  } catch (error) {
    console.error('Fetch quote details error:', error);
    return null;
  }
}

/**
 * Map Strapi status to QuoteStatus type
 */
function mapQuoteStatus(status: string): QuoteStatus {
  const statusMap: Record<string, QuoteStatus> = {
    draft: 'Pending',
    sent: 'Pending',
    viewed: 'Pending',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    converted: 'Converted',
  };
  return statusMap[status?.toLowerCase()] || 'Pending';
}

/**
 * Approve a quote with signature
 */
export async function approveQuote(
  quoteDocumentId: string,
  approvalData: {
    signature: string;
    name: string;
    email: string;
    termsAccepted: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/quotes/${quoteDocumentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approverSignature: approvalData.signature,
          approvedBy: `${approvalData.name} <${approvalData.email}>`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || 'Approval failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Approve quote error:', error);
    return { success: false, error: 'Failed to approve quote' };
  }
}

/**
 * Reject a quote with reason
 */
export async function rejectQuote(
  quoteDocumentId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/quotes/${quoteDocumentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || 'Rejection failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Reject quote error:', error);
    return { success: false, error: 'Failed to reject quote' };
  }
}

/**
 * Request changes on a quote
 */
export async function requestQuoteChanges(
  quoteDocumentId: string,
  comments: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First fetch the current quote to get existing change requests
    const quoteResponse = await fetch(`${API_BASE}/api/quotes/${quoteDocumentId}`);
    if (!quoteResponse.ok) {
      return { success: false, error: 'Quote not found' };
    }
    
    const quoteData = await quoteResponse.json();
    const existingRequests = quoteData.data?.changeRequests || [];
    
    // Add new change request
    const newRequest = {
      requestedAt: new Date().toISOString(),
      comments,
      status: 'Pending',
    };
    
    const response = await fetch(`${API_BASE}/api/quotes/${quoteDocumentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          changeRequests: [...existingRequests, newRequest],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || 'Request failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Request changes error:', error);
    return { success: false, error: 'Failed to request changes' };
  }
}

// ============================================================================
// Customer Profile
// ============================================================================

/**
 * Update customer profile
 */
export async function updateCustomerProfile(
  customerId: string,
  updates: Partial<Pick<PortalCustomer, 'name' | 'phone' | 'company'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/customers/${customerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: updates }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || 'Update failed' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
