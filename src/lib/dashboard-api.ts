/**
 * Dashboard API Client
 * Connects to the production dashboard API (port 3335) for real Printavo data
 */

const DASHBOARD_API = import.meta.env.VITE_DASHBOARD_API_URL || "http://docker-host:3335";

// Types matching the API response
export interface ProductionStats {
  quote: string;
  art: string;
  screenprint: string;
  embroidery: string;
  dtg: string;
  fulfillment: string;
  complete: string;
  total: string;
}

export interface LineItem {
  id: number;
  document_id: string;
  printavo_id: string;
  order_id: number;
  order_visual_id: string;
  category: string;
  style_number: string;
  style_description: string;
  color: string;
  total_quantity: number;
  unit_cost: string;
  total_cost: string;
  size_xs: number;
  size_s: number;
  size_m: number;
  size_l: number;
  size_xl: number;
  size_2_xl: number;
  size_3_xl: number;
  size_4_xl: number;
  size_5_xl: number;
  size_other: number;
}

export interface Order {
  id: number;
  order_number: string;
  order_nickname: string;
  status: string;
  printavo_status_name: string;
  total_amount: string;
  amount_outstanding: string;
  due_date: string;
  customer_due_date: string;
  customer_po: string;
  notes: string;
  production_notes: string;
  artwork_count: number;
  artwork_files: string[];
  status_history: string[];
  customer_name: string;
  line_items: LineItem[];
}

// OrderDetail type for /api/orders/:id endpoint
export interface OrderDetailLineItem {
  id: number;
  styleNumber: string;
  description: string;
  color: string;
  category: string;
  unitCost: number;
  totalQuantity: number;
  totalCost: number;
  sizes: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
    xxxl: number;
    xxxxl: number;
    xxxxxl: number;
    other: number;
  };
}

export interface StatusHistoryEntry {
  status: string;
  previous_status: string;
  changed_by: string;
  changed_at: string;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  orderNickname: string;
  status: string;
  printavoStatusName: string;
  totalAmount: number;
  amountOutstanding: number;
  dueDate: string;
  customerDueDate: string;
  statusHistory: StatusHistoryEntry[];
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  lineItems: OrderDetailLineItem[];
}

export interface OrdersResponse {
  total: number;
  page: number;
  limit: number;
  orders: Order[];
}

export interface OrderFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// API Client
export const dashboardApi = {
  /**
   * Get production statistics
   */
  async getProductionStats(): Promise<ProductionStats> {
    const response = await fetch(`${DASHBOARD_API}/api/production-stats`);
    if (!response.ok) throw new Error("Failed to fetch production stats");
    return response.json();
  },

  /**
   * Get orders with optional filters
   */
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    
    const url = `${DASHBOARD_API}/api/orders${params.toString() ? "?" + params.toString() : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },

  /**
   * Get a single order by ID with full details
   */
  async getOrder(id: number): Promise<OrderDetail | null> {
    const response = await fetch(`${DASHBOARD_API}/api/orders/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch order");
    }
    return response.json();
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, newStatus: string): Promise<{ success: boolean }> {
    const response = await fetch(`${DASHBOARD_API}/api/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) throw new Error("Failed to update order status");
    return response.json();
  },

  /**
   * Get label data for an order
   */
  async getLabelData(orderId: number): Promise<{
    jobId: string;
    printavoId: string;
    customerName: string;
    jobNickname: string;
    quantity: number;
    sizes: string;
    dueDate: string;
    notes: string;
  }> {
    const response = await fetch(`${DASHBOARD_API}/api/orders/${orderId}/label-data`);
    if (!response.ok) throw new Error("Failed to fetch label data");
    return response.json();
  },

  /**
   * Get customer address for an order
   */
  async getCustomerAddress(orderId: number): Promise<{
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
  }> {
    const response = await fetch(`${DASHBOARD_API}/api/orders/${orderId}/customer-address`);
    if (!response.ok) throw new Error("Failed to fetch customer address");
    return response.json();
  },

  /**
   * Get production view (grouped by decoration type)
   */
  async getProduction(): Promise<{
    screenprint: Order[];
    embroidery: Order[];
    dtg: Order[];
    fulfillment: Order[];
  }> {
    const response = await fetch(`${DASHBOARD_API}/api/production`);
    if (!response.ok) throw new Error("Failed to fetch production data");
    return response.json();
  },

  /**
   * Get shipping rates
   */
  async getShippingRates(fromAddress: unknown, toAddress: unknown, parcel: unknown): Promise<unknown> {
    const response = await fetch(`${DASHBOARD_API}/api/shipping/rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromAddress, toAddress, parcel }),
    });
    if (!response.ok) throw new Error("Failed to get shipping rates");
    return response.json();
  },

  /**
   * Buy shipping label
   */
  async buyShippingLabel(shipmentId: string, rateId: string): Promise<unknown> {
    const response = await fetch(`${DASHBOARD_API}/api/shipping/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId, rateId }),
    });
    if (!response.ok) throw new Error("Failed to buy shipping label");
    return response.json();
  },

  /**
   * Get recent active jobs (for sidebar widget)
   */
  async getRecentJobs(): Promise<{
    jobs: {
      id: number;
      order_number: string;
      order_nickname: string;
      printavo_status_name: string;
      total_amount: string;
      due_date: string;
      created_at: string;
      customer_name: string;
    }[];
  }> {
    const response = await fetch(`${DASHBOARD_API}/api/recent-jobs`);
    if (!response.ok) throw new Error("Failed to fetch recent jobs");
    return response.json();
  },

  /**
   * Get dashboard stats (new quotes, in production, revenue MTD, due this week)
   */
  async getDashboardStats(): Promise<{
    newQuotes: number;
    inProduction: number;
    revenueMTD: number;
    dueThisWeek: number;
  }> {
    const response = await fetch(`${DASHBOARD_API}/api/dashboard-stats`);
    if (!response.ok) throw new Error("Failed to fetch dashboard stats");
    return response.json();
  },

  /**
   * Get all customers with order stats (paginated)
   */
  async getCustomers(options: { page?: number; limit?: number; search?: string } = {}): Promise<{
    total: number;
    page: number;
    limit: number;
    customers: {
      id: string;
      name: string;
      email: string;
      phone: string;
      company: string;
      totalOrders: number;
      totalRevenue: number;
      paidRevenue: number;
      quoteTotal: number;
      paidOrderCount: number;
      lastOrderDate: string;
      status: "active" | "inactive";
      createdAt: string;
    }[];
  }> {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.search) params.append("search", options.search);
    
    const url = `${DASHBOARD_API}/api/customers${params.toString() ? "?" + params.toString() : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch customers");
    return response.json();
  },
};

export default dashboardApi;
