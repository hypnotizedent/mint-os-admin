/**
 * Payments API Client
 * Communicates with Strapi payments endpoints
 */

import type { OrderPayment, PaymentFormData, PaymentsDashboardSummary, OutstandingOrderSummary } from '../types';
import { VALID_PAYMENT_METHODS } from '../types';
import { sanitizeTextInput } from '../utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// Security constants
const MAX_REFERENCE_LENGTH = 100;
const MAX_NOTES_LENGTH = 500;
const MAX_RECORDED_BY_LENGTH = 100;
const MAX_DOCUMENT_ID_LENGTH = 100;
const MAX_AMOUNT = 999999999.99;

/**
 * Validate payment form data
 */
function validatePaymentData(payment: PaymentFormData, maxAmount: number): { valid: boolean; error?: string } {
  // Validate amount
  if (typeof payment.amount !== 'number' || !isFinite(payment.amount)) {
    return { valid: false, error: 'Invalid payment amount' };
  }
  if (payment.amount <= 0) {
    return { valid: false, error: 'Payment amount must be greater than 0' };
  }
  if (payment.amount > maxAmount) {
    return { valid: false, error: 'Payment amount exceeds outstanding balance' };
  }
  if (payment.amount > MAX_AMOUNT) {
    return { valid: false, error: 'Payment amount exceeds maximum allowed' };
  }

  // Validate payment method
  if (!VALID_PAYMENT_METHODS.includes(payment.paymentMethod as typeof VALID_PAYMENT_METHODS[number])) {
    return { valid: false, error: 'Invalid payment method' };
  }

  // Validate payment date format
  if (!payment.paymentDate || !/^\d{4}-\d{2}-\d{2}$/.test(payment.paymentDate)) {
    return { valid: false, error: 'Invalid payment date format' };
  }
  
  const paymentDate = new Date(payment.paymentDate);
  if (isNaN(paymentDate.getTime())) {
    return { valid: false, error: 'Invalid payment date' };
  }

  // Validate date is not in the future
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  if (paymentDate > today) {
    return { valid: false, error: 'Payment date cannot be in the future' };
  }

  // Validate date is within reasonable range (1 year ago)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);
  if (paymentDate < oneYearAgo) {
    return { valid: false, error: 'Payment date cannot be more than 1 year ago' };
  }

  return { valid: true };
}

interface StrapiPaymentResponse {
  data: {
    id: number;
    documentId: string;
    amount: number;
    status: string;
    paymentType?: string;
    paymentMethod: string;
    referenceNumber?: string;
    paymentDate?: string;
    recordedBy?: string;
    notes?: string;
    paidAt?: string;
    createdAt: string;
  };
}

interface StrapiPaymentsListResponse {
  data: Array<{
    id: number;
    documentId: string;
    amount: number;
    status: string;
    paymentType?: string;
    paymentMethod: string;
    referenceNumber?: string;
    paymentDate?: string;
    recordedBy?: string;
    notes?: string;
    paidAt?: string;
    createdAt: string;
  }>;
  meta?: {
    pagination?: {
      total: number;
    };
  };
}

interface StrapiOrderResponse {
  data: {
    id: number;
    documentId: string;
    orderNumber: string;
    totalAmount: number;
    amountPaid: number;
    amountOutstanding: number;
    dueDate?: string;
    customer?: {
      id: number;
      documentId: string;
      name: string;
    };
  };
}

/**
 * Record a new payment for an order
 * Note: Updates order amounts after creating payment. In production,
 * this should be handled atomically on the backend.
 */
export async function recordPayment(
  orderDocumentId: string,
  payment: PaymentFormData,
  recordedBy: string = 'Staff'
): Promise<{ success: boolean; payment?: OrderPayment; newAmountPaid?: number; newAmountOutstanding?: number; error?: string }> {
  try {
    // Validate orderDocumentId format (basic check)
    if (!orderDocumentId || typeof orderDocumentId !== 'string' || orderDocumentId.length > MAX_DOCUMENT_ID_LENGTH) {
      return { success: false, error: 'Invalid order ID' };
    }

    // Sanitize recordedBy
    const sanitizedRecordedBy = sanitizeTextInput(recordedBy, MAX_RECORDED_BY_LENGTH) || 'Staff';

    // First, fetch the current order to get latest amounts
    const orderRes = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderDocumentId)}`);
    if (!orderRes.ok) {
      return { success: false, error: 'Failed to fetch order' };
    }
    const orderData: StrapiOrderResponse = await orderRes.json();
    const order = orderData.data;
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const currentAmountPaid = order.amountPaid || 0;
    const totalAmount = order.totalAmount || 0;
    // Use amountOutstanding if explicitly set (even if 0), otherwise calculate
    const currentOutstanding = order.amountOutstanding !== undefined 
      ? order.amountOutstanding 
      : (totalAmount - currentAmountPaid);

    // Validate payment data against current order state
    const validation = validatePaymentData(payment, currentOutstanding);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const newAmountPaid = currentAmountPaid + payment.amount;
    const newAmountOutstanding = Math.max(0, totalAmount - newAmountPaid);

    // Sanitize text fields
    const sanitizedReferenceNumber = sanitizeTextInput(payment.referenceNumber, MAX_REFERENCE_LENGTH);
    const sanitizedNotes = sanitizeTextInput(payment.notes, MAX_NOTES_LENGTH);

    // Create the payment record
    const paymentRes = await fetch(`${API_BASE}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          order: orderDocumentId,
          amount: payment.amount,
          status: 'paid',
          paymentType: 'balance',
          paymentMethod: payment.paymentMethod,
          referenceNumber: sanitizedReferenceNumber || null,
          paymentDate: payment.paymentDate,
          recordedBy: sanitizedRecordedBy,
          notes: sanitizedNotes || null,
          paidAt: new Date().toISOString(),
        },
      }),
    });

    if (!paymentRes.ok) {
      // Don't expose detailed server errors to client
      return { 
        success: false, 
        error: 'Failed to record payment. Please try again.' 
      };
    }

    const paymentData: StrapiPaymentResponse = await paymentRes.json();

    // Update the order with new payment amounts
    const updateRes = await fetch(`${API_BASE}/api/orders/${orderDocumentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          amountPaid: newAmountPaid,
          amountOutstanding: newAmountOutstanding,
        },
      }),
    });

    if (!updateRes.ok) {
      console.warn('Failed to update order payment amounts');
    }

    const p = paymentData.data;
    return {
      success: true,
      payment: {
        id: p.id.toString(),
        documentId: p.documentId,
        amount: p.amount,
        status: p.status as OrderPayment['status'],
        paymentType: p.paymentType as OrderPayment['paymentType'],
        paymentMethod: p.paymentMethod as OrderPayment['paymentMethod'],
        referenceNumber: p.referenceNumber,
        paymentDate: p.paymentDate,
        recordedBy: p.recordedBy,
        notes: p.notes,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      },
      newAmountPaid,
      newAmountOutstanding,
    };
  } catch (error) {
    // Log error for debugging but don't expose details to user
    console.error('Record payment error:', error);
    return {
      success: false,
      error: 'An error occurred while recording the payment. Please try again.',
    };
  }
}

/**
 * Get all payments for a specific order
 */
export async function getPayments(orderDocumentId: string): Promise<OrderPayment[]> {
  try {
    // Validate and encode the orderDocumentId to prevent injection
    if (!orderDocumentId || typeof orderDocumentId !== 'string' || orderDocumentId.length > MAX_DOCUMENT_ID_LENGTH) {
      console.error('Invalid order document ID');
      return [];
    }

    const res = await fetch(
      `${API_BASE}/api/payments?filters[order][documentId][$eq]=${encodeURIComponent(orderDocumentId)}&sort=createdAt:desc`
    );

    if (!res.ok) {
      console.error('Failed to fetch payments');
      return [];
    }

    const data: StrapiPaymentsListResponse = await res.json();
    
    return (data.data || []).map((p) => ({
      id: p.id.toString(),
      documentId: p.documentId,
      amount: p.amount,
      status: p.status as OrderPayment['status'],
      paymentType: p.paymentType as OrderPayment['paymentType'],
      paymentMethod: p.paymentMethod as OrderPayment['paymentMethod'],
      referenceNumber: p.referenceNumber,
      paymentDate: p.paymentDate,
      recordedBy: p.recordedBy,
      notes: p.notes,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }));
  } catch (error) {
    console.error('Get payments error:', error);
    return [];
  }
}

/**
 * Get all orders with outstanding balances
 */
export async function getOutstandingOrders(): Promise<OutstandingOrderSummary[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/orders?filters[amountOutstanding][$gt]=0&populate=customer&sort=amountOutstanding:desc&pagination[limit]=100`
    );

    if (!res.ok) {
      console.error('Failed to fetch outstanding orders');
      return [];
    }

    interface OrderListItem {
      id: number;
      documentId: string;
      orderNumber: string;
      totalAmount: number;
      amountPaid: number;
      amountOutstanding: number;
      dueDate?: string;
      customer?: {
        id: number;
        documentId: string;
        name: string;
      };
    }

    const data: { data: OrderListItem[] } = await res.json();
    
    return (data.data || []).map((o) => ({
      id: o.id.toString(),
      documentId: o.documentId,
      orderNumber: o.orderNumber,
      customerName: o.customer?.name || 'Unknown Customer',
      totalAmount: o.totalAmount || 0,
      amountPaid: o.amountPaid || 0,
      amountOutstanding: o.amountOutstanding || 0,
      dueDate: o.dueDate,
    }));
  } catch (error) {
    console.error('Get outstanding orders error:', error);
    return [];
  }
}

/**
 * Get payments dashboard summary
 */
export async function getPaymentsSummary(): Promise<PaymentsDashboardSummary> {
  try {
    // Get outstanding orders
    const outstandingOrders = await getOutstandingOrders();
    const totalOutstanding = outstandingOrders.reduce(
      (sum, o) => sum + (o.amountOutstanding || 0),
      0
    );

    // Get overdue orders (due date in the past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueCount = outstandingOrders.filter((o) => {
      if (!o.dueDate) return false;
      const dueDate = new Date(o.dueDate);
      return dueDate < today;
    }).length;

    // Get payments this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekPaymentsRes = await fetch(
      `${API_BASE}/api/payments?filters[status][$eq]=paid&filters[createdAt][$gte]=${weekAgo.toISOString()}`
    );
    let paymentsThisWeek = 0;
    if (weekPaymentsRes.ok) {
      const weekPaymentsData: StrapiPaymentsListResponse = await weekPaymentsRes.json();
      paymentsThisWeek = (weekPaymentsData.data || []).reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
    }

    // Get payments this month
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthPaymentsRes = await fetch(
      `${API_BASE}/api/payments?filters[status][$eq]=paid&filters[createdAt][$gte]=${monthAgo.toISOString()}`
    );
    let paymentsThisMonth = 0;
    if (monthPaymentsRes.ok) {
      const monthPaymentsData: StrapiPaymentsListResponse = await monthPaymentsRes.json();
      paymentsThisMonth = (monthPaymentsData.data || []).reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
    }

    return {
      totalOutstanding,
      paymentsThisWeek,
      paymentsThisMonth,
      overdueCount,
      outstandingOrders: outstandingOrders.slice(0, 5), // Top 5 for dashboard
    };
  } catch (error) {
    console.error('Get payments summary error:', error);
    return {
      totalOutstanding: 0,
      paymentsThisWeek: 0,
      paymentsThisMonth: 0,
      overdueCount: 0,
      outstandingOrders: [],
    };
  }
}
