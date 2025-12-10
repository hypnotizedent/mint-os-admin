/**
 * Unified API Client for Strapi
 * 
 * Wraps all Strapi API calls for customers, orders, quotes, jobs, and line items.
 * Uses Strapi v5 document API format (documentId).
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// ============================================================================
// Constants
// ============================================================================

/** Default number of days from now for job due dates when not specified */
export const DEFAULT_JOB_DUE_DAYS = 14;

// ============================================================================
// Types
// ============================================================================

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerData extends StrapiEntity {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  printavoId?: string;
}

export interface OrderData extends StrapiEntity {
  orderNumber: string;
  visualId?: string;
  status: string;
  totalAmount: number;
  amountPaid?: number;
  amountOutstanding?: number;
  dueDate?: string;
  customerDueDate?: string;
  notes?: string;
  productionNotes?: string;
  items?: LineItemData[];
  customer?: CustomerData;
  printavoCustomerId?: string;
}

export interface JobData extends StrapiEntity {
  title: string;
  customer: string;
  customerId?: string;
  status: string;
  priority: string;
  dueDate: string;
  description?: string;
  quantity: number;
  fileCount?: number;
  assignedMachine?: string;
  estimatedCost?: number;
  progress?: number;
  order?: OrderData;
}

export interface LineItemData extends StrapiEntity {
  // Core fields
  description?: string;
  styleDescription?: string;
  styleNumber?: string;
  category?: string;
  color?: string;
  
  // Quantity and pricing - supports both naming conventions
  quantity?: number;        // Alias for totalQuantity
  totalQuantity?: number;   // Strapi field name
  unitPrice?: number;       // Alias for unitCost
  unitCost?: number;        // Strapi field name
  totalPrice?: number;      // Alias for totalCost
  totalCost?: number;       // Strapi field name
  taxable?: boolean;
  
  // Size breakdown (individual quantities)
  sizeXS?: number;
  sizeS?: number;
  sizeM?: number;
  sizeL?: number;
  sizeXL?: number;
  size2XL?: number;
  size3XL?: number;
  size4XL?: number;
  size5XL?: number;
  sizes?: Record<string, number>;  // Alternative size map
  
  // Print specifications
  printLocations?: string[];
  inkColors?: number;
  goodsStatus?: string;
  
  // Relations
  order?: OrderData;
  printavoId?: string;
  orderId?: number;
  orderVisualId?: string;
}

export interface QuoteData extends StrapiEntity {
  quoteNumber: string;
  status: string;
  total?: number;
  subtotal?: number;
  taxAmount?: number;
  setupFees?: number;
  rushFee?: number;
  expiresAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  approverSignature?: string;
  approvedBy?: string;
  rejectionReason?: string;
  customerNotes?: string;
  internalNotes?: string;
  lineItems?: LineItemData[];
  mockupUrls?: string[];
  customer?: CustomerData;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface CreateOrderInput {
  orderNumber: string;
  status: string;
  totalAmount: number;
  dueDate?: string;
  notes?: string;
  productionNotes?: string;
  items?: Omit<LineItemData, keyof StrapiEntity>[];
  customer?: { connect: string[] };
  customerNotes?: string;
  discount?: number;
  discountType?: string;
  taxRate?: number;
  rushOrder?: boolean;
  rushFee?: number;
}

export interface CreateJobInput {
  title: string;
  customer: string;
  customerId?: string;
  status: string;
  priority: string;
  dueDate: string;
  description?: string;
  quantity: number;
  fileCount?: number;
  estimatedCost?: number;
  order?: { connect: string[] };
}

export interface UpdateJobInput {
  status?: string;
  priority?: string;
  progress?: number;
  assignedMachine?: string;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  error?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function handleResponse<T>(response: Response): Promise<ApiResult<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
    };
  }
  
  const data = await response.json();
  return { success: true, data: data.data };
}

async function handlePaginatedResponse<T>(response: Response): Promise<PaginatedResult<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      data: [],
      pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 },
      error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
    };
  }
  
  const result = await response.json();
  return {
    success: true,
    data: result.data || [],
    pagination: result.meta?.pagination || { page: 1, pageSize: 25, pageCount: 1, total: result.data?.length || 0 },
  };
}

// ============================================================================
// Customers API
// ============================================================================

export const customersApi = {
  /**
   * Get all customers with optional filtering and pagination
   */
  async list(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
  } = {}): Promise<PaginatedResult<CustomerData>> {
    const { page = 1, pageSize = 25, search, sort = 'name:asc' } = options;
    
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'sort': sort,
    });
    
    if (search) {
      params.append('filters[$or][0][name][$containsi]', search);
      params.append('filters[$or][1][email][$containsi]', search);
      params.append('filters[$or][2][company][$containsi]', search);
    }
    
    const response = await fetch(`${API_BASE}/api/customers?${params}`);
    return handlePaginatedResponse<CustomerData>(response);
  },
  
  /**
   * Get a single customer by documentId
   */
  async get(documentId: string): Promise<ApiResult<CustomerData>> {
    const response = await fetch(`${API_BASE}/api/customers/${documentId}`);
    return handleResponse<CustomerData>(response);
  },
  
  /**
   * Create a new customer
   */
  async create(data: CreateCustomerInput): Promise<ApiResult<CustomerData>> {
    const response = await fetch(`${API_BASE}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return handleResponse<CustomerData>(response);
  },
  
  /**
   * Update a customer by documentId
   */
  async update(documentId: string, data: Partial<CreateCustomerInput>): Promise<ApiResult<CustomerData>> {
    const response = await fetch(`${API_BASE}/api/customers/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return handleResponse<CustomerData>(response);
  },
  
  /**
   * Delete a customer by documentId
   */
  async delete(documentId: string): Promise<ApiResult<CustomerData>> {
    const response = await fetch(`${API_BASE}/api/customers/${documentId}`, {
      method: 'DELETE',
    });
    return handleResponse<CustomerData>(response);
  },
  
  /**
   * Search customers by query
   */
  async search(query: string, limit = 10): Promise<ApiResult<CustomerData[]>> {
    const params = new URLSearchParams({
      'filters[$or][0][name][$containsi]': query,
      'filters[$or][1][email][$containsi]': query,
      'filters[$or][2][company][$containsi]': query,
      'pagination[limit]': limit.toString(),
    });
    
    const response = await fetch(`${API_BASE}/api/customers?${params}`);
    const result = await handlePaginatedResponse<CustomerData>(response);
    return { success: result.success, data: result.data, error: result.error };
  },
};

// ============================================================================
// Orders API
// ============================================================================

export const ordersApi = {
  /**
   * Get all orders with optional filtering and pagination
   */
  async list(options: {
    page?: number;
    pageSize?: number;
    status?: string;
    customerId?: string;
    sort?: string;
  } = {}): Promise<PaginatedResult<OrderData>> {
    const { page = 1, pageSize = 25, status, customerId, sort = 'createdAt:desc' } = options;
    
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'sort': sort,
    });
    
    if (status) {
      params.append('filters[status][$eq]', status);
    }
    
    if (customerId) {
      params.append('filters[customer][documentId][$eq]', customerId);
    }
    
    const response = await fetch(`${API_BASE}/api/orders?${params}`);
    return handlePaginatedResponse<OrderData>(response);
  },
  
  /**
   * Get a single order by documentId
   */
  async get(documentId: string, populate = '*'): Promise<ApiResult<OrderData>> {
    const response = await fetch(`${API_BASE}/api/orders/${documentId}?populate=${populate}`);
    return handleResponse<OrderData>(response);
  },
  
  /**
   * Create a new order
   */
  async create(data: CreateOrderInput): Promise<ApiResult<OrderData>> {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return handleResponse<OrderData>(response);
  },
  
  /**
   * Update an order by documentId
   */
  async update(documentId: string, data: Partial<CreateOrderInput>): Promise<ApiResult<OrderData>> {
    const response = await fetch(`${API_BASE}/api/orders/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return handleResponse<OrderData>(response);
  },
  
  /**
   * Convert a quote to an order (changes status and creates job)
   */
  async convertQuoteToOrder(orderDocumentId: string): Promise<ApiResult<{ order: OrderData; job?: JobData }>> {
    // First update the order status to PENDING
    const orderResult = await ordersApi.update(orderDocumentId, {
      status: 'PENDING',
    });
    
    if (!orderResult.success || !orderResult.data) {
      return { success: false, error: orderResult.error || 'Failed to update order status' };
    }
    
    const order = orderResult.data;
    
    // Create associated job record
    const defaultDueDate = new Date(Date.now() + DEFAULT_JOB_DUE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const jobResult = await jobsApi.create({
      title: order.orderNumber || `Job for Order ${order.documentId}`,
      customer: order.customer?.name || 'Unknown Customer',
      customerId: order.customer?.documentId,
      status: 'design',
      priority: 'normal',
      dueDate: order.dueDate || defaultDueDate,
      quantity: order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 1,
      estimatedCost: order.totalAmount,
      order: { connect: [orderDocumentId] },
    });
    
    return {
      success: true,
      data: {
        order,
        job: jobResult.data,
      },
    };
  },
};

// ============================================================================
// Jobs API
// ============================================================================

export const jobsApi = {
  /**
   * Get all jobs with optional filtering and pagination
   */
  async list(options: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    sort?: string;
  } = {}): Promise<PaginatedResult<JobData>> {
    const { page = 1, pageSize = 50, status, priority, sort = 'dueDate:asc' } = options;
    
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'sort': sort,
    });
    
    if (status) {
      params.append('filters[status][$eq]', status);
    }
    
    if (priority) {
      params.append('filters[priority][$eq]', priority);
    }
    
    const response = await fetch(`${API_BASE}/api/jobs?${params}`);
    return handlePaginatedResponse<JobData>(response);
  },
  
  /**
   * Get a single job by documentId
   */
  async get(documentId: string): Promise<ApiResult<JobData>> {
    const response = await fetch(`${API_BASE}/api/jobs/${documentId}?populate=*`);
    return handleResponse<JobData>(response);
  },
  
  /**
   * Create a new job
   */
  async create(data: CreateJobInput): Promise<ApiResult<JobData>> {
    const response = await fetch(`${API_BASE}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return handleResponse<JobData>(response);
  },
  
  /**
   * Update a job by documentId
   */
  async update(documentId: string, data: UpdateJobInput): Promise<ApiResult<JobData>> {
    const response = await fetch(`${API_BASE}/api/jobs/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return handleResponse<JobData>(response);
  },
  
  /**
   * Update job status
   */
  async updateStatus(documentId: string, status: string): Promise<ApiResult<JobData>> {
    return jobsApi.update(documentId, { status });
  },
};

// ============================================================================
// Quotes API
// ============================================================================

export const quotesApi = {
  /**
   * Get all quotes with optional filtering and pagination
   */
  async list(options: {
    page?: number;
    pageSize?: number;
    status?: string;
    customerId?: string;
    sort?: string;
  } = {}): Promise<PaginatedResult<QuoteData>> {
    const { page = 1, pageSize = 25, status, customerId, sort = 'createdAt:desc' } = options;
    
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'sort': sort,
    });
    
    if (status) {
      params.append('filters[status][$eq]', status);
    }
    
    if (customerId) {
      params.append('filters[customer][documentId][$eq]', customerId);
    }
    
    const response = await fetch(`${API_BASE}/api/quotes?${params}`);
    return handlePaginatedResponse<QuoteData>(response);
  },
  
  /**
   * Get a single quote by documentId
   */
  async get(documentId: string): Promise<ApiResult<QuoteData>> {
    const response = await fetch(`${API_BASE}/api/quotes/${documentId}?populate=*`);
    return handleResponse<QuoteData>(response);
  },
  
  /**
   * Update a quote by documentId
   */
  async update(documentId: string, data: Partial<QuoteData>): Promise<ApiResult<QuoteData>> {
    const response = await fetch(`${API_BASE}/api/quotes/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return handleResponse<QuoteData>(response);
  },
};

// ============================================================================
// Line Items API
// ============================================================================

/**
 * Input data for creating a new line item.
 * 
 * Required fields: totalQuantity, unitCost
 * 
 * Note: totalCost is auto-calculated as (totalQuantity * unitCost) if not provided.
 * Provide totalCost explicitly if you need a different value (e.g., with discounts).
 */
export interface CreateLineItemInput {
  // Core fields
  description?: string;
  styleDescription?: string;
  styleNumber?: string;
  category?: string;
  color?: string;
  
  // Quantity and pricing - Strapi field names
  /** Total quantity of items (required) */
  totalQuantity: number;
  /** Unit cost per item (required) */
  unitCost: number;
  /** Total cost - auto-calculated as (totalQuantity * unitCost) if not provided */
  totalCost?: number;
  taxable?: boolean;
  
  // Size breakdown
  sizeXS?: number;
  sizeS?: number;
  sizeM?: number;
  sizeL?: number;
  sizeXL?: number;
  size2XL?: number;
  size3XL?: number;
  size4XL?: number;
  size5XL?: number;
  
  // Print specifications
  printLocations?: string[];
  inkColors?: number;
  goodsStatus?: string;
  
  // Relation to order
  order?: { connect: string[] };
}

/**
 * Input data for updating an existing line item.
 * All fields are optional - only provided fields will be updated.
 * 
 * Note: If you update totalQuantity or unitCost without providing totalCost,
 * the update method will fetch the current item to recalculate totalCost.
 * For better performance, provide totalCost explicitly when known.
 */
export interface UpdateLineItemInput {
  // Core fields
  description?: string;
  styleDescription?: string;
  styleNumber?: string;
  category?: string;
  color?: string;
  
  // Quantity and pricing
  totalQuantity?: number;
  unitCost?: number;
  totalCost?: number;
  taxable?: boolean;
  
  // Size breakdown
  sizeXS?: number;
  sizeS?: number;
  sizeM?: number;
  sizeL?: number;
  sizeXL?: number;
  size2XL?: number;
  size3XL?: number;
  size4XL?: number;
  size5XL?: number;
  
  // Print specifications
  printLocations?: string[];
  inkColors?: number;
  goodsStatus?: string;
}

export const lineItemsApi = {
  /**
   * Get all line items with optional filtering and pagination
   */
  async list(options: {
    page?: number;
    pageSize?: number;
    orderDocumentId?: string;
    sort?: string;
  } = {}): Promise<PaginatedResult<LineItemData>> {
    const { page = 1, pageSize = 100, orderDocumentId, sort = 'createdAt:desc' } = options;
    
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'sort': sort,
    });
    
    if (orderDocumentId) {
      params.append('filters[order][documentId][$eq]', orderDocumentId);
    }
    
    const response = await fetch(`${API_BASE}/api/line-items?${params}`);
    return handlePaginatedResponse<LineItemData>(response);
  },

  /**
   * Get all line items for an order (convenience method)
   */
  async listByOrder(orderDocumentId: string): Promise<ApiResult<LineItemData[]>> {
    const result = await lineItemsApi.list({ orderDocumentId, pageSize: 100 });
    return { success: result.success, data: result.data, error: result.error };
  },
  
  /**
   * Get a single line item by documentId
   */
  async get(documentId: string): Promise<ApiResult<LineItemData>> {
    const response = await fetch(`${API_BASE}/api/line-items/${documentId}?populate=*`);
    return handleResponse<LineItemData>(response);
  },

  /**
   * Create a line item
   */
  async create(data: CreateLineItemInput): Promise<ApiResult<LineItemData>> {
    // Auto-calculate totalCost if not provided
    const lineItemData = {
      ...data,
      totalCost: data.totalCost ?? (data.totalQuantity * data.unitCost),
    };

    const response = await fetch(`${API_BASE}/api/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: lineItemData }),
    });
    return handleResponse<LineItemData>(response);
  },

  /**
   * Update a line item by documentId.
   * 
   * Note: If you update totalQuantity or unitCost without providing totalCost,
   * the method will fetch the current item to calculate the new totalCost.
   * For better performance, provide totalCost explicitly when known.
   * 
   * @param documentId - The line item's documentId
   * @param data - Fields to update
   * @param options - Optional settings
   * @param options.skipAutoCalculate - If true, skip auto-calculation of totalCost
   */
  async update(
    documentId: string, 
    data: UpdateLineItemInput,
    options?: { skipAutoCalculate?: boolean }
  ): Promise<ApiResult<LineItemData>> {
    const updateData = { ...data };
    
    // Auto-recalculate totalCost if totalQuantity or unitCost changed and totalCost not provided
    const shouldAutoCalculate = !options?.skipAutoCalculate && 
      (data.totalQuantity !== undefined || data.unitCost !== undefined) && 
      data.totalCost === undefined;
    
    if (shouldAutoCalculate) {
      // Fetch current item to get missing values for calculation
      const currentItem = await lineItemsApi.get(documentId);
      if (currentItem.success && currentItem.data) {
        const quantity = data.totalQuantity ?? currentItem.data.totalQuantity ?? 0;
        const unitCost = data.unitCost ?? currentItem.data.unitCost ?? 0;
        updateData.totalCost = quantity * unitCost;
      }
    }

    const response = await fetch(`${API_BASE}/api/line-items/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: updateData }),
    });
    return handleResponse<LineItemData>(response);
  },

  /**
   * Delete a line item by documentId
   */
  async delete(documentId: string): Promise<ApiResult<LineItemData>> {
    const response = await fetch(`${API_BASE}/api/line-items/${documentId}`, {
      method: 'DELETE',
    });
    return handleResponse<LineItemData>(response);
  },

  /**
   * Batch create multiple line items for an order.
   * Uses parallel processing for better performance.
   * 
   * @param orderDocumentId - The order's documentId to attach line items to
   * @param items - Array of line items to create (without order relation)
   * @returns Result with array of created items and any errors
   */
  async batchCreate(orderDocumentId: string, items: Omit<CreateLineItemInput, 'order'>[]): Promise<ApiResult<LineItemData[]>> {
    // Process items in parallel for better performance
    const promises = items.map(item => 
      lineItemsApi.create({
        ...item,
        order: { connect: [orderDocumentId] },
      })
    );

    const results = await Promise.allSettled(promises);
    
    const successfulItems: LineItemData[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success && result.value.data) {
          successfulItems.push(result.value.data);
        } else {
          errors.push(`Item ${index + 1}: ${result.value.error || 'Unknown error'}`);
        }
      } else {
        errors.push(`Item ${index + 1}: ${result.reason?.message || 'Request failed'}`);
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        data: successfulItems,
        error: `Failed to create ${errors.length}/${items.length} line item(s): ${errors.join('; ')}`,
      };
    }

    return { success: true, data: successfulItems };
  },

  /**
   * Update order totals after line item changes
   * Recalculates the order's totalAmount based on all line items
   */
  async recalculateOrderTotal(orderDocumentId: string): Promise<ApiResult<OrderData>> {
    // Get all line items for the order
    const lineItemsResult = await lineItemsApi.listByOrder(orderDocumentId);
    
    if (!lineItemsResult.success) {
      return { success: false, error: lineItemsResult.error || 'Failed to fetch line items' };
    }

    // Calculate total from line items (using totalCost or fallback to unitCost * totalQuantity)
    const totalAmount = lineItemsResult.data?.reduce((sum, item) => {
      const itemTotal = item.totalCost ?? (item.totalQuantity ?? 0) * (item.unitCost ?? 0);
      return sum + itemTotal;
    }, 0) ?? 0;

    // Update the order
    return ordersApi.update(orderDocumentId, { totalAmount });
  },
};

// ============================================================================
// Export unified client
// ============================================================================

export const apiClient = {
  customers: customersApi,
  orders: ordersApi,
  jobs: jobsApi,
  quotes: quotesApi,
  lineItems: lineItemsApi,
};

export default apiClient;
