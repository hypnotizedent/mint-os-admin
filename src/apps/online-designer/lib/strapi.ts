/**
 * Strapi API Client for Custom Studio App
 * Replaces Supabase with PrintShop OS Strapi backend
 */

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://100.92.156.118:1337';

interface DesignSession {
  id?: string;
  documentId?: string;
  customerEmail?: string;
  customerId?: string;
  garmentType: string;
  designs: any[];
  pricing: {
    basePrice: number;
    designComplexity: number;
    total: number;
  };
  status: 'active' | 'completed' | 'abandoned';
  productId?: string;
}

interface CustomOrder {
  id?: string;
  documentId?: string;
  sessionId: string;
  customerEmail?: string;
  customerId?: string;
  garmentType: string;
  designs: Record<string, unknown> | unknown[];
  pricing: {
    basePrice: number;
    designComplexity?: number;
    total?: number;
    quantity?: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
}

class StrapiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Get token from localStorage if exists
    this.token = localStorage.getItem('designStudioToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('designStudioToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('designStudioToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // Design Sessions
  async createDesignSession(session: Omit<DesignSession, 'id' | 'documentId'>): Promise<{ data: DesignSession }> {
    return this.request('/api/design-sessions', {
      method: 'POST',
      body: JSON.stringify({ data: session }),
    });
  }

  async updateDesignSession(
    documentId: string,
    updates: Partial<DesignSession>
  ): Promise<{ data: DesignSession }> {
    return this.request(`/api/design-sessions/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: updates }),
    });
  }

  async getDesignSession(documentId: string): Promise<{ data: DesignSession }> {
    return this.request(`/api/design-sessions/${documentId}`);
  }

  async getCustomerSessions(customerEmail: string): Promise<{ data: DesignSession[] }> {
    return this.request(
      `/api/design-sessions?filters[customerEmail][$eq]=${encodeURIComponent(customerEmail)}&sort=createdAt:desc`
    );
  }

  // Custom Orders (Design Orders)
  async createCustomOrder(order: Omit<CustomOrder, 'id' | 'documentId'>): Promise<{ data: CustomOrder }> {
    return this.request('/api/custom-orders', {
      method: 'POST',
      body: JSON.stringify({ data: order }),
    });
  }

  async getCustomerOrders(customerEmail: string): Promise<{ data: CustomOrder[] }> {
    return this.request(
      `/api/custom-orders?filters[customerEmail][$eq]=${encodeURIComponent(customerEmail)}&sort=createdAt:desc`
    );
  }

  // File Upload (to MinIO via Strapi)
  async uploadDesignFile(file: File): Promise<{ id: number; url: string }> {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const [uploaded] = await response.json();
    return {
      id: uploaded.id,
      url: uploaded.url.startsWith('http') ? uploaded.url : `${this.baseUrl}${uploaded.url}`,
    };
  }

  // Customer Auth (uses existing PrintShop OS auth)
  async loginCustomer(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.request<{ success: boolean; token: string; user: any }>(
      '/api/auth/customer/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return { token: response.token, user: response.user };
  }

  async signupCustomer(
    name: string,
    email: string,
    password: string,
    company?: string
  ): Promise<{ token: string; user: any }> {
    const response = await this.request<{ success: boolean; token: string; user: any }>(
      '/api/auth/customer/signup',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password, company }),
      }
    );
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return { token: response.token, user: response.user };
  }

  async verifyToken(): Promise<{ valid: boolean; user?: any }> {
    if (!this.token) return { valid: false };
    
    try {
      return await this.request('/api/auth/verify');
    } catch {
      this.clearToken();
      return { valid: false };
    }
  }
}

// Export singleton instance
export const strapi = new StrapiClient(STRAPI_URL);

// Export types
export type { DesignSession, CustomOrder };
