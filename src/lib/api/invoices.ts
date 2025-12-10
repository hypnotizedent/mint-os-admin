/**
 * Invoice API Client
 * Handles invoice generation, listing, and management
 * 
 * Created: November 29, 2025
 */

import { generatePrintableInvoice } from './invoice-utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// ============================================================================
// Types
// ============================================================================

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Void';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceAddress {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  nickname?: string;
  orderId: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  lineItems: InvoiceLineItem[];
  customerName: string;
  customerEmail: string;
  customerAddress?: InvoiceAddress;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  search?: string;
}

export interface PaymentInfo {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface GenerateInvoiceOptions {
  orderId: string;
  dueDate?: string;
  notes?: string;
}

// ============================================================================
// Invoice API Functions
// ============================================================================

/**
 * Generate invoice from an order
 * Returns the invoice data (not the PDF directly)
 */
export async function generateInvoice(
  options: GenerateInvoiceOptions
): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    // Fetch the order with all details
    const orderRes = await fetch(
      `${API_BASE}/api/orders/${options.orderId}?populate=*`
    );
    
    if (!orderRes.ok) {
      throw new Error('Order not found');
    }
    
    const orderData = await orderRes.json();
    const order = orderData.data;
    
    // Create invoice from order data
    const invoice: Invoice = {
      id: `inv-${order.id}`,
      invoiceNumber: `INV-${order.orderNumber || order.id}`,
      orderNumber: order.orderNumber || order.visualId || `#${order.id}`,
      nickname: order.orderNickname || undefined,
      orderId: order.documentId || order.id.toString(),
      invoiceDate: new Date().toISOString(),
      dueDate: options.dueDate || calculateDueDate(30),
      status: order.amountOutstanding <= 0 ? 'Paid' : 'Pending',
      subtotal: calculateSubtotal(order),
      tax: order.salesTax || 0,
      shipping: order.shippingCost || 0,
      discount: order.discount || 0,
      total: order.totalAmount || 0,
      amountPaid: order.amountPaid || 0,
      balance: order.amountOutstanding || order.totalAmount || 0,
      lineItems: (order.lineItems || []).map((item: Record<string, unknown>) => ({
        id: String(item.id || ''),
        description: String(item.styleDescription || item.styleNumber || 'Item'),
        quantity: Number(item.totalQuantity || item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        total: Number(item.totalCost || item.total || 0),
      })),
      customerName: order.customer?.name || 'Customer',
      customerEmail: order.customer?.email || '',
      customerAddress: order.customer?.address ? {
        street: String(order.customer.address.street || ''),
        street2: order.customer.address.street2 ? String(order.customer.address.street2) : undefined,
        city: String(order.customer.address.city || ''),
        state: String(order.customer.address.state || ''),
        zip: String(order.customer.address.zip || ''),
      } : undefined,
    };
    
    return { success: true, invoice };
  } catch (error) {
    console.error('Generate invoice error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate invoice' 
    };
  }
}

/**
 * Download invoice as PDF
 * Generates and returns HTML content blob for printing
 * Note: This returns HTML content that can be printed as PDF from the browser.
 * For server-side PDF generation, use the backend pdfkit service.
 */
export async function downloadInvoicePDF(orderId: string): Promise<Blob | null> {
  try {
    // First generate the invoice data
    const { success, invoice, error } = await generateInvoice({ orderId });
    
    if (!success || !invoice) {
      throw new Error(error || 'Failed to generate invoice');
    }
    
    // Generate printable HTML content
    const htmlContent = generatePrintableInvoice(invoice);
    
    // Create a blob from the HTML content for download/print
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return blob;
  } catch (error) {
    console.error('Download invoice PDF error:', error);
    return null;
  }
}

/**
 * Get all invoices (orders that have invoicing data)
 */
export async function getInvoices(
  filters?: InvoiceFilters
): Promise<{ invoices: Invoice[]; total: number }> {
  try {
    // Build query params for orders that are invoice-ready
    const params = new URLSearchParams({
      'populate': '*',
      'pagination[limit]': '100',
      'sort': 'createdAt:desc',
    });
    
    // Only get orders that have been invoiced (have status indicating payment due)
    // This includes: INVOICE_SENT, PAYMENT_NEEDED, INVOICE_PAID, etc.
    const invoiceStatuses = [
      'INVOICE_SENT',
      'PAYMENT_NEEDED', 
      'INVOICE_PAID',
      'COMPLETE',
      'READY_FOR_PICKUP',
      'SHIPPED',
    ];
    
    if (filters?.status) {
      // Filter by payment status
      if (filters.status === 'Paid') {
        params.append('filters[amountOutstanding][$eq]', '0');
      } else if (filters.status === 'Pending') {
        params.append('filters[amountOutstanding][$gt]', '0');
      }
    }
    
    if (filters?.customerId) {
      params.append('filters[customer][documentId][$eq]', filters.customerId);
    }
    
    if (filters?.startDate) {
      params.append('filters[createdAt][$gte]', filters.startDate);
    }
    
    if (filters?.endDate) {
      params.append('filters[createdAt][$lte]', filters.endDate);
    }
    
    const response = await fetch(`${API_BASE}/api/orders?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform orders to invoices, filtering for those with invoice-ready status
    const invoices: Invoice[] = (data.data || [])
      .filter((order: Record<string, unknown>) => {
        const status = String(order.status || '');
        // Include orders that are in production or later stages
        return invoiceStatuses.some(s => status.includes(s)) || 
               Number(order.totalAmount || 0) > 0;
      })
      .map((order: Record<string, unknown>) => ({
        id: `inv-${order.id}`,
        invoiceNumber: `INV-${order.orderNumber || order.id}`,
        orderNumber: String(order.orderNumber || order.visualId || `#${order.id}`),
        nickname: order.orderNickname ? String(order.orderNickname) : undefined,
        orderId: String(order.documentId || order.id),
        invoiceDate: String(order.createdAt || new Date().toISOString()),
        dueDate: String(order.dueDate || calculateDueDate(30)),
        status: getInvoiceStatus(order),
        subtotal: calculateSubtotal(order),
        tax: Number(order.salesTax || 0),
        shipping: Number(order.shippingCost || 0),
        discount: Number(order.discount || 0),
        total: Number(order.totalAmount || 0),
        amountPaid: Number(order.amountPaid || 0),
        balance: Number(order.amountOutstanding || order.totalAmount || 0),
        lineItems: [],
        customerName: (order.customer as Record<string, unknown>)?.name 
          ? String((order.customer as Record<string, unknown>).name) 
          : 'Customer',
        customerEmail: (order.customer as Record<string, unknown>)?.email 
          ? String((order.customer as Record<string, unknown>).email) 
          : '',
      }));
    
    // Apply search filter client-side
    let filteredInvoices = invoices;
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredInvoices = invoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.orderNumber.toLowerCase().includes(searchLower) ||
        inv.customerName.toLowerCase().includes(searchLower) ||
        (inv.nickname && inv.nickname.toLowerCase().includes(searchLower))
      );
    }
    
    return {
      invoices: filteredInvoices,
      total: filteredInvoices.length,
    };
  } catch (error) {
    console.error('Get invoices error:', error);
    return { invoices: [], total: 0 };
  }
}

/**
 * Get a single invoice by order ID
 */
export async function getInvoice(orderId: string): Promise<Invoice | null> {
  const { success, invoice } = await generateInvoice({ orderId });
  return success ? invoice ?? null : null;
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(
  orderId: string,
  paymentInfo: PaymentInfo
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update the order's payment information in Strapi
    const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          amountPaid: paymentInfo.amount,
          amountOutstanding: 0,
          status: 'INVOICE_PAID',
          paymentMethod: paymentInfo.paymentMethod,
          paymentTransactionId: paymentInfo.transactionId,
          paymentNotes: paymentInfo.notes,
          paidAt: new Date().toISOString(),
        },
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || 'Failed to mark as paid' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Mark invoice paid error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark invoice as paid' 
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateDueDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}

function calculateSubtotal(order: Record<string, unknown>): number {
  const total = Number(order.totalAmount || 0);
  const tax = Number(order.salesTax || 0);
  const shipping = Number(order.shippingCost || 0);
  return total - tax - shipping;
}

function getInvoiceStatus(order: Record<string, unknown>): InvoiceStatus {
  const amountOutstanding = Number(order.amountOutstanding || 0);
  const status = String(order.status || '');
  
  if (amountOutstanding <= 0 || status === 'INVOICE_PAID') {
    return 'Paid';
  }
  
  const dueDate = order.dueDate ? new Date(String(order.dueDate)) : null;
  if (dueDate && dueDate < new Date()) {
    return 'Overdue';
  }
  
  return 'Pending';
}
