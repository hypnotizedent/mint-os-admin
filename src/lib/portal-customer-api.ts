/**
 * Portal Customer API Service
 * 
 * API helpers for customer portal operations including preferences,
 * password management, and activity logging.
 * 
 * Created: November 30, 2024
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://100.92.156.118:1337';

// ============================================================================
// Types
// ============================================================================

export interface CustomerPreferences {
  id?: string;
  documentId?: string;
  orderConfirmation: boolean;
  artApproval: boolean;
  productionUpdates: boolean;
  shipmentNotifications: boolean;
  quoteReminders: boolean;
  marketingEmails: boolean;
  smsNotifications: boolean;
}

export interface ActivityItem {
  id: string;
  documentId?: string;
  activityType: string;
  description: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Build request headers with optional auth token
 */
function buildHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Get customer ID from auth context or localStorage
 */
function getCustomerId(): string | null {
  // Try to get from localStorage first (stored during login)
  const customerData = localStorage.getItem('customer');
  if (customerData) {
    try {
      const customer = JSON.parse(customerData);
      return customer.documentId || customer.id;
    } catch {
      // Continue to next method
    }
  }
  return null;
}

// ============================================================================
// Customer Preferences API
// ============================================================================

/**
 * Fetch customer notification preferences
 */
export async function getCustomerPreferences(
  customerId?: string
): Promise<ApiResponse<CustomerPreferences>> {
  const id = customerId || getCustomerId();
  
  if (!id) {
    return { success: false, error: 'Customer ID not found' };
  }
  
  try {
    const response = await fetch(
      `${API_BASE}/api/customer-preferences?filters[customer][documentId][$eq]=${encodeURIComponent(id)}&populate=customer`,
      { headers: buildHeaders() }
    );
    
    if (!response.ok) {
      // Return default preferences if none found
      if (response.status === 404) {
        return {
          success: true,
          data: {
            orderConfirmation: true,
            artApproval: true,
            productionUpdates: true,
            shipmentNotifications: true,
            quoteReminders: true,
            marketingEmails: false,
            smsNotifications: false,
          },
        };
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // If no preferences found, return defaults
    if (!result.data || result.data.length === 0) {
      return {
        success: true,
        data: {
          orderConfirmation: true,
          artApproval: true,
          productionUpdates: true,
          shipmentNotifications: true,
          quoteReminders: true,
          marketingEmails: false,
          smsNotifications: false,
        },
      };
    }
    
    const pref = result.data[0];
    return {
      success: true,
      data: {
        id: pref.id?.toString(),
        documentId: pref.documentId,
        orderConfirmation: pref.orderConfirmation ?? true,
        artApproval: pref.artApproval ?? true,
        productionUpdates: pref.productionUpdates ?? true,
        shipmentNotifications: pref.shipmentNotifications ?? true,
        quoteReminders: pref.quoteReminders ?? true,
        marketingEmails: pref.marketingEmails ?? false,
        smsNotifications: pref.smsNotifications ?? false,
      },
    };
  } catch (error) {
    console.error('Fetch preferences error:', error);
    // Return defaults on error for graceful degradation
    return {
      success: true,
      data: {
        orderConfirmation: true,
        artApproval: true,
        productionUpdates: true,
        shipmentNotifications: true,
        quoteReminders: true,
        marketingEmails: false,
        smsNotifications: false,
      },
    };
  }
}

/**
 * Save customer notification preferences
 */
export async function saveCustomerPreferences(
  preferences: CustomerPreferences,
  customerId?: string
): Promise<ApiResponse<CustomerPreferences>> {
  const id = customerId || getCustomerId();
  
  if (!id) {
    return { success: false, error: 'Customer ID not found' };
  }
  
  try {
    // Check if preferences already exist for this customer
    const existingResponse = await fetch(
      `${API_BASE}/api/customer-preferences?filters[customer][documentId][$eq]=${encodeURIComponent(id)}`,
      { headers: buildHeaders() }
    );
    
    let result;
    const existingData = existingResponse.ok ? await existingResponse.json() : null;
    const existingPrefs = existingData?.data?.[0];
    
    const prefData = {
      orderConfirmation: preferences.orderConfirmation,
      artApproval: preferences.artApproval,
      productionUpdates: preferences.productionUpdates,
      shipmentNotifications: preferences.shipmentNotifications,
      quoteReminders: preferences.quoteReminders,
      marketingEmails: preferences.marketingEmails,
      smsNotifications: preferences.smsNotifications,
    };
    
    if (existingPrefs?.documentId) {
      // Update existing preferences
      const response = await fetch(
        `${API_BASE}/api/customer-preferences/${existingPrefs.documentId}`,
        {
          method: 'PUT',
          headers: buildHeaders(),
          body: JSON.stringify({ data: prefData }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Update failed');
      }
      
      result = await response.json();
    } else {
      // Create new preferences
      const response = await fetch(
        `${API_BASE}/api/customer-preferences`,
        {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify({
            data: {
              ...prefData,
              customer: id,
            },
          }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Create failed');
      }
      
      result = await response.json();
    }
    
    const saved = result.data;
    return {
      success: true,
      data: {
        id: saved.id?.toString(),
        documentId: saved.documentId,
        orderConfirmation: saved.orderConfirmation ?? true,
        artApproval: saved.artApproval ?? true,
        productionUpdates: saved.productionUpdates ?? true,
        shipmentNotifications: saved.shipmentNotifications ?? true,
        quoteReminders: saved.quoteReminders ?? true,
        marketingEmails: saved.marketingEmails ?? false,
        smsNotifications: saved.smsNotifications ?? false,
      },
    };
  } catch (error) {
    console.error('Save preferences error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save preferences',
    };
  }
}

// ============================================================================
// Password Management API
// ============================================================================

/**
 * Change customer password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(
      `${API_BASE}/api/auth/customer/change-password`,
      {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );
    
    const result = await response.json();
    
    if (!response.ok) {
      // Handle specific HTTP status codes for more reliable error detection
      if (response.status === 400) {
        // Bad request - likely incorrect password or validation error
        return { 
          success: false, 
          error: result.error?.message || 'Current password is incorrect' 
        };
      }
      if (response.status === 401) {
        return { success: false, error: 'Authentication required' };
      }
      return { 
        success: false, 
        error: result.error?.message || 'Failed to change password' 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password',
    };
  }
}

// ============================================================================
// Activity Log API
// ============================================================================

/**
 * Fetch customer activity log
 */
export async function getActivityLog(
  customerId?: string,
  limit = 50
): Promise<ApiResponse<ActivityItem[]>> {
  const id = customerId || getCustomerId();
  
  if (!id) {
    return { success: false, error: 'Customer ID not found', data: [] };
  }
  
  try {
    const params = new URLSearchParams({
      'filters[customer][documentId][$eq]': id,
      'sort': 'createdAt:desc',
      'pagination[limit]': limit.toString(),
    });
    
    const response = await fetch(
      `${API_BASE}/api/customer-activities?${params}`,
      { headers: buildHeaders() }
    );
    
    if (!response.ok) {
      // Return empty array if no activities or endpoint doesn't exist
      if (response.status === 404) {
        return { success: true, data: [] };
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    const activities: ActivityItem[] = (result.data || []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      documentId: item.documentId as string | undefined,
      activityType: item.activityType as string || 'unknown',
      description: item.description as string || '',
      ipAddress: item.ipAddress as string | undefined,
      metadata: item.metadata as Record<string, unknown> | undefined,
      createdAt: item.createdAt as string,
    }));
    
    return { success: true, data: activities };
  } catch (error) {
    console.error('Fetch activity log error:', error);
    // Return empty array for graceful degradation
    return { success: true, data: [] };
  }
}

/**
 * Log a customer activity (internal use)
 */
export async function logActivity(
  activityType: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<ApiResponse<void>> {
  const customerId = getCustomerId();
  
  if (!customerId) {
    return { success: false, error: 'Customer ID not found' };
  }
  
  try {
    const response = await fetch(
      `${API_BASE}/api/customer-activities`,
      {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          data: {
            customer: customerId,
            activityType,
            description,
            metadata: metadata || null,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to log activity');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Log activity error:', error);
    // Don't fail the main operation if activity logging fails
    return { success: true };
  }
}

// ============================================================================
// Search API
// ============================================================================

export interface SearchResult {
  type: 'order' | 'quote';
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
}

/**
 * Search orders and quotes for a customer
 */
export async function searchPortal(
  query: string,
  customerId?: string
): Promise<ApiResponse<SearchResult[]>> {
  const id = customerId || getCustomerId();
  
  if (!id) {
    return { success: false, error: 'Customer ID not found', data: [] };
  }
  
  if (!query || query.trim().length < 2) {
    return { success: true, data: [] };
  }
  
  try {
    const searchTerm = query.trim();
    const results: SearchResult[] = [];
    
    // Search orders
    const orderParams = new URLSearchParams({
      'filters[$or][0][orderNumber][$containsi]': searchTerm,
      'filters[$or][1][visualId][$containsi]': searchTerm,
      'filters[$or][2][printavoId][$containsi]': searchTerm,
      'pagination[limit]': '10',
      'sort': 'createdAt:desc',
    });
    
    const ordersResponse = await fetch(
      `${API_BASE}/api/orders?${orderParams}`,
      { headers: buildHeaders() }
    );
    
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      const orders = ordersData.data || [];
      
      for (const order of orders) {
        results.push({
          type: 'order',
          id: order.documentId || order.id?.toString(),
          title: `Order #${order.orderNumber || order.visualId || order.id}`,
          description: order.notes || `Total: $${order.totalAmount || 0}`,
          status: order.status || 'PENDING',
          date: order.createdAt,
        });
      }
    }
    
    // Search quotes
    const quoteParams = new URLSearchParams({
      'filters[quoteNumber][$containsi]': searchTerm,
      'pagination[limit]': '10',
      'sort': 'createdAt:desc',
    });
    
    const quotesResponse = await fetch(
      `${API_BASE}/api/quotes?${quoteParams}`,
      { headers: buildHeaders() }
    );
    
    if (quotesResponse.ok) {
      const quotesData = await quotesResponse.json();
      const quotes = quotesData.data || [];
      
      for (const quote of quotes) {
        results.push({
          type: 'quote',
          id: quote.documentId || quote.id?.toString(),
          title: `Quote #${quote.quoteNumber || quote.id}`,
          description: quote.customerNotes || `Total: $${quote.subtotal || quote.total || 0}`,
          status: quote.status || 'pending',
          date: quote.createdAt,
        });
      }
    }
    
    // Sort by date descending
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { success: true, data: results.slice(0, 20) };
  } catch (error) {
    console.error('Search portal error:', error);
    return { success: true, data: [] };
  }
}
