/**
 * Reports API - API functions for retrieving report data
 */

// Types for report data
export interface SalesReportData {
  totalRevenue: number
  previousPeriodRevenue: number
  revenueChange: number
  orderCount: number
  previousPeriodOrderCount: number
  orderCountChange: number
  averageOrderValue: number
  previousPeriodAverageOrderValue: number
  averageOrderValueChange: number
  revenueByPeriod: { date: string; revenue: number }[]
  topCustomers: { name: string; revenue: number; orderCount: number }[]
  salesByCategory: { category: string; revenue: number; percentage: number }[]
}

export interface ProductionReportData {
  jobsCompleted: number
  previousPeriodJobsCompleted: number
  jobsCompletedChange: number
  averageTurnaroundDays: number
  previousPeriodAverageTurnaroundDays: number
  turnaroundChange: number
  onTimeDeliveryRate: number
  previousPeriodOnTimeDeliveryRate: number
  onTimeDeliveryChange: number
  jobsByStatus: { status: string; count: number }[]
  productionByMethod: { method: string; count: number; percentage: number }[]
}

export interface CustomerReportData {
  newCustomers: number
  previousPeriodNewCustomers: number
  newCustomersChange: number
  customerRetentionRate: number
  previousPeriodRetentionRate: number
  retentionChange: number
  repeatOrderRate: number
  previousPeriodRepeatOrderRate: number
  repeatOrderChange: number
  averageLifetimeValue: number
  topCustomersByRevenue: { name: string; company: string; revenue: number; orderCount: number }[]
}

export interface DashboardStatsData {
  revenueThisMonth: number
  revenueTrend: number
  ordersThisWeek: number
  ordersThisMonth: number
  ordersTrend: number
  jobsInProduction: number
  completedToday: number
  revenueByDay: { date: string; revenue: number }[]
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// Status constants for consistency across the module
const COMPLETED_STATUSES = ['COMPLETED', 'INVOICE PAID', 'INVOICE_PAID', 'DELIVERED'];
const PRODUCTION_STATUSES = ['IN_PRODUCTION', 'PENDING', 'PREPRESS'];

/**
 * Calculate date range for a given period
 */
export function getDateRange(period: 'week' | 'month' | 'quarter' | 'year' | 'custom', customFrom?: string, customTo?: string) {
  const now = new Date();
  let dateFrom: Date = new Date(now.getFullYear(), now.getMonth(), 1); // Default to start of month
  let dateTo: Date = now;

  switch (period) {
    case 'week':
      dateFrom = new Date(now);
      dateFrom.setDate(now.getDate() - 7);
      break;
    case 'month':
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      dateFrom = new Date(now);
      dateFrom.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      dateFrom = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      dateFrom = customFrom ? new Date(customFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
      dateTo = customTo ? new Date(customTo) : now;
      break;
  }

  return {
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0],
  };
}

/**
 * Get the previous period date range for comparison
 */
function getPreviousPeriodRange(dateFrom: string, dateTo: string) {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const duration = to.getTime() - from.getTime();
  
  const previousTo = new Date(from.getTime() - 86400000); // Subtract 1 day instead of 1 ms
  const previousFrom = new Date(previousTo.getTime() - duration);
  
  return {
    dateFrom: previousFrom.toISOString().split('T')[0],
    dateTo: previousTo.toISOString().split('T')[0],
  };
}

/**
 * Calculate percentage change
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get sales report data
 */
export async function getSalesReport(dateFrom: string, dateTo: string): Promise<SalesReportData> {
  try {
    // Fetch orders within the date range
    const ordersRes = await fetch(
      `${API_BASE}/api/orders?populate=customer&pagination[limit]=5000&filters[createdAt][$gte]=${dateFrom}&filters[createdAt][$lte]=${dateTo}T23:59:59`
    );
    
    if (!ordersRes.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const ordersData = await ordersRes.json();
    const orders = ordersData.data || [];
    
    // Get previous period for comparison
    const prevPeriod = getPreviousPeriodRange(dateFrom, dateTo);
    const prevOrdersRes = await fetch(
      `${API_BASE}/api/orders?populate=customer&pagination[limit]=5000&filters[createdAt][$gte]=${prevPeriod.dateFrom}&filters[createdAt][$lte]=${prevPeriod.dateTo}T23:59:59`
    );
    const prevOrdersData = await prevOrdersRes.json();
    const prevOrders = prevOrdersData.data || [];
    
    // Calculate metrics
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const previousPeriodRevenue = prevOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const orderCount = orders.length;
    const previousPeriodOrderCount = prevOrders.length;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
    const previousPeriodAverageOrderValue = previousPeriodOrderCount > 0 ? previousPeriodRevenue / previousPeriodOrderCount : 0;
    
    // Revenue by day
    const revenueByDay: Record<string, number> = {};
    orders.forEach((o: any) => {
      const date = new Date(o.createdAt).toISOString().split('T')[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + (o.totalAmount || 0);
    });
    
    const revenueByPeriod = Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Top customers
    const customerRevenue: Record<string, { name: string; revenue: number; orderCount: number }> = {};
    orders.forEach((o: any) => {
      const name = o.customer?.name || 'Unknown';
      if (!customerRevenue[name]) {
        customerRevenue[name] = { name, revenue: 0, orderCount: 0 };
      }
      customerRevenue[name].revenue += o.totalAmount || 0;
      customerRevenue[name].orderCount += 1;
    });
    
    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Sales by category (by product/service category from line items)
    const categoryRevenue: Record<string, number> = {};
    orders.forEach((o: any) => {
      if (Array.isArray(o.lineItems) && o.lineItems.length > 0) {
        o.lineItems.forEach((item: any) => {
          const category = item.category || 'Other';
          const amount = item.total || item.amount || 0;
          categoryRevenue[category] = (categoryRevenue[category] || 0) + amount;
        });
      } else if (o.category) {
        // Fallback: order-level category
        const category = o.category;
        categoryRevenue[category] = (categoryRevenue[category] || 0) + (o.totalAmount || 0);
      } else {
        // Fallback: unknown category
        categoryRevenue['Other'] = (categoryRevenue['Other'] || 0) + (o.totalAmount || 0);
      }
    });
    
    const salesByCategory = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    return {
      totalRevenue,
      previousPeriodRevenue,
      revenueChange: calculateChange(totalRevenue, previousPeriodRevenue),
      orderCount,
      previousPeriodOrderCount,
      orderCountChange: calculateChange(orderCount, previousPeriodOrderCount),
      averageOrderValue,
      previousPeriodAverageOrderValue,
      averageOrderValueChange: calculateChange(averageOrderValue, previousPeriodAverageOrderValue),
      revenueByPeriod,
      topCustomers,
      salesByCategory,
    };
  } catch (error) {
    console.error('Error fetching sales report:', error);
    // Return empty data on error
    return {
      totalRevenue: 0,
      previousPeriodRevenue: 0,
      revenueChange: 0,
      orderCount: 0,
      previousPeriodOrderCount: 0,
      orderCountChange: 0,
      averageOrderValue: 0,
      previousPeriodAverageOrderValue: 0,
      averageOrderValueChange: 0,
      revenueByPeriod: [],
      topCustomers: [],
      salesByCategory: [],
    };
  }
}

/**
 * Get production report data
 */
export async function getProductionReport(dateFrom: string, dateTo: string): Promise<ProductionReportData> {
  try {
    // Fetch orders/jobs within the date range
    const ordersRes = await fetch(
      `${API_BASE}/api/orders?pagination[limit]=5000&filters[createdAt][$gte]=${dateFrom}&filters[createdAt][$lte]=${dateTo}T23:59:59`
    );
    
    if (!ordersRes.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const ordersData = await ordersRes.json();
    const orders = ordersData.data || [];
    
    // Get previous period for comparison
    const prevPeriod = getPreviousPeriodRange(dateFrom, dateTo);
    const prevOrdersRes = await fetch(
      `${API_BASE}/api/orders?pagination[limit]=5000&filters[createdAt][$gte]=${prevPeriod.dateFrom}&filters[createdAt][$lte]=${prevPeriod.dateTo}T23:59:59`
    );
    const prevOrdersData = await prevOrdersRes.json();
    const prevOrders = prevOrdersData.data || [];
    
    // Calculate completed jobs
    const jobsCompleted = orders.filter((o: any) => COMPLETED_STATUSES.includes(o.status)).length;
    const previousPeriodJobsCompleted = prevOrders.filter((o: any) => COMPLETED_STATUSES.includes(o.status)).length;
    
    // Calculate average turnaround (days from creation to completion)
    const completedOrders = orders.filter((o: any) => COMPLETED_STATUSES.includes(o.status) && o.updatedAt);
    let totalTurnaround = 0;
    completedOrders.forEach((o: any) => {
      const created = new Date(o.createdAt);
      const completed = new Date(o.updatedAt);
      const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      totalTurnaround += days;
    });
    const averageTurnaroundDays = completedOrders.length > 0 ? Math.round(totalTurnaround / completedOrders.length) : 0;
    
    const prevCompletedOrders = prevOrders.filter((o: any) => COMPLETED_STATUSES.includes(o.status) && o.updatedAt);
    let prevTotalTurnaround = 0;
    prevCompletedOrders.forEach((o: any) => {
      const created = new Date(o.createdAt);
      const completed = new Date(o.updatedAt);
      const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      prevTotalTurnaround += days;
    });
    const previousPeriodAverageTurnaroundDays = prevCompletedOrders.length > 0 ? Math.round(prevTotalTurnaround / prevCompletedOrders.length) : 0;
    
    // Calculate on-time delivery rate (orders completed before or on due date)
    const ordersWithDueDate = completedOrders.filter((o: any) => o.dueDate);
    const onTimeOrders = ordersWithDueDate.filter((o: any) => {
      const due = new Date(o.dueDate);
      const completed = new Date(o.updatedAt);
      return completed <= due;
    });
    const onTimeDeliveryRate = ordersWithDueDate.length > 0 ? Math.round((onTimeOrders.length / ordersWithDueDate.length) * 100) : 100;
    
    const prevOrdersWithDueDate = prevCompletedOrders.filter((o: any) => o.dueDate);
    const prevOnTimeOrders = prevOrdersWithDueDate.filter((o: any) => {
      const due = new Date(o.dueDate);
      const completed = new Date(o.updatedAt);
      return completed <= due;
    });
    const previousPeriodOnTimeDeliveryRate = prevOrdersWithDueDate.length > 0 ? Math.round((prevOnTimeOrders.length / prevOrdersWithDueDate.length) * 100) : 100;
    
    // Jobs by status
    const statusCounts: Record<string, number> = {};
    orders.forEach((o: any) => {
      const status = o.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const jobsByStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
    
    // Production by method (using notes or tags if available, otherwise mock)
    const methodCounts: Record<string, number> = {
      'Screen Print': 0,
      'DTG': 0,
      'Embroidery': 0,
      'Vinyl': 0,
      'Other': 0,
    };
    
    // Try to infer from order notes or items (allow orders to be counted in multiple methods)
    orders.forEach((o: any) => {
      const notes = (o.notes || '').toLowerCase();
      const nickname = (o.orderNickname || '').toLowerCase();
      const combined = notes + ' ' + nickname;
      
      let matched = false;
      if (combined.includes('screen') || combined.includes('ink')) {
        methodCounts['Screen Print']++;
        matched = true;
      }
      if (combined.includes('dtg') || combined.includes('direct to garment')) {
        methodCounts['DTG']++;
        matched = true;
      }
      if (combined.includes('embroid') || combined.includes('stitch')) {
        methodCounts['Embroidery']++;
        matched = true;
      }
      if (combined.includes('vinyl') || combined.includes('heat transfer')) {
        methodCounts['Vinyl']++;
        matched = true;
      }
      if (!matched) {
        methodCounts['Other']++;
      }
    });
    
    const totalByMethod = Object.values(methodCounts).reduce((a, b) => a + b, 0);
    const productionByMethod = Object.entries(methodCounts)
      .filter(([, count]) => count > 0)
      .map(([method, count]) => ({
        method,
        count,
        percentage: totalByMethod > 0 ? Math.round((count / totalByMethod) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
    
    return {
      jobsCompleted,
      previousPeriodJobsCompleted,
      jobsCompletedChange: calculateChange(jobsCompleted, previousPeriodJobsCompleted),
      averageTurnaroundDays,
      previousPeriodAverageTurnaroundDays,
      // Invert the calculation so positive = improvement (faster turnaround)
      turnaroundChange: calculateChange(previousPeriodAverageTurnaroundDays, averageTurnaroundDays),
      onTimeDeliveryRate,
      previousPeriodOnTimeDeliveryRate,
      onTimeDeliveryChange: calculateChange(onTimeDeliveryRate, previousPeriodOnTimeDeliveryRate),
      jobsByStatus,
      productionByMethod,
    };
  } catch (error) {
    console.error('Error fetching production report:', error);
    return {
      jobsCompleted: 0,
      previousPeriodJobsCompleted: 0,
      jobsCompletedChange: 0,
      averageTurnaroundDays: 0,
      previousPeriodAverageTurnaroundDays: 0,
      turnaroundChange: 0,
      onTimeDeliveryRate: 100,
      previousPeriodOnTimeDeliveryRate: 100,
      onTimeDeliveryChange: 0,
      jobsByStatus: [],
      productionByMethod: [],
    };
  }
}

/**
 * Get customer report data
 */
export async function getCustomerReport(dateFrom: string, dateTo: string): Promise<CustomerReportData> {
  try {
    // Fetch customers
    const customersRes = await fetch(`${API_BASE}/api/customers?pagination[limit]=5000`);
    if (!customersRes.ok) {
      throw new Error('Failed to fetch customers');
    }
    const customersData = await customersRes.json();
    const customers = customersData.data || [];
    
    // Fetch orders within date range
    const ordersRes = await fetch(
      `${API_BASE}/api/orders?populate=customer&pagination[limit]=5000&filters[createdAt][$gte]=${dateFrom}&filters[createdAt][$lte]=${dateTo}T23:59:59`
    );
    const ordersData = await ordersRes.json();
    const orders = ordersData.data || [];
    
    // Get previous period for comparison
    const prevPeriod = getPreviousPeriodRange(dateFrom, dateTo);
    const prevOrdersRes = await fetch(
      `${API_BASE}/api/orders?populate=customer&pagination[limit]=5000&filters[createdAt][$gte]=${prevPeriod.dateFrom}&filters[createdAt][$lte]=${prevPeriod.dateTo}T23:59:59`
    );
    const prevOrdersData = await prevOrdersRes.json();
    const prevOrders = prevOrdersData.data || [];
    
    // New customers this period (customers created within date range)
    const newCustomers = customers.filter((c: any) => {
      const createdAt = new Date(c.createdAt);
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      return createdAt >= from && createdAt <= to;
    }).length;
    
    const previousPeriodNewCustomers = customers.filter((c: any) => {
      const createdAt = new Date(c.createdAt);
      const from = new Date(prevPeriod.dateFrom);
      const to = new Date(prevPeriod.dateTo);
      return createdAt >= from && createdAt <= to;
    }).length;
    
    // Calculate customer revenue
    const customerStats: Record<string, { name: string; company: string; revenue: number; orderCount: number; orders: string[] }> = {};
    orders.forEach((o: any) => {
      const customerId = o.customer?.documentId || o.customer?.id || 'unknown';
      const name = o.customer?.name || 'Unknown';
      const company = o.customer?.company || '';
      
      if (!customerStats[customerId]) {
        customerStats[customerId] = { name, company, revenue: 0, orderCount: 0, orders: [] };
      }
      customerStats[customerId].revenue += o.totalAmount || 0;
      customerStats[customerId].orderCount += 1;
      customerStats[customerId].orders.push(o.documentId || o.id);
    });
    
    // Repeat order rate (customers with more than one order)
    const customersWithOrders = Object.values(customerStats);
    const repeatCustomers = customersWithOrders.filter(c => c.orderCount > 1).length;
    const repeatOrderRate = customersWithOrders.length > 0 
      ? Math.round((repeatCustomers / customersWithOrders.length) * 100) 
      : 0;
    
    // Calculate for previous period
    const prevCustomerStats: Record<string, { orderCount: number }> = {};
    prevOrders.forEach((o: any) => {
      const customerId = o.customer?.documentId || o.customer?.id || 'unknown';
      if (!prevCustomerStats[customerId]) {
        prevCustomerStats[customerId] = { orderCount: 0 };
      }
      prevCustomerStats[customerId].orderCount += 1;
    });
    
    const prevCustomersWithOrders = Object.values(prevCustomerStats);
    const prevRepeatCustomers = prevCustomersWithOrders.filter(c => c.orderCount > 1).length;
    const previousPeriodRepeatOrderRate = prevCustomersWithOrders.length > 0 
      ? Math.round((prevRepeatCustomers / prevCustomersWithOrders.length) * 100) 
      : 0;
    
    // Customer retention rate (customers who ordered in both periods)
    const currentCustomerIds = new Set(Object.keys(customerStats));
    const prevCustomerIds = new Set(Object.keys(prevCustomerStats));
    const retainedCustomers = [...prevCustomerIds].filter(id => currentCustomerIds.has(id)).length;
    const customerRetentionRate = prevCustomerIds.size > 0 
      ? Math.round((retainedCustomers / prevCustomerIds.size) * 100) 
      : 100;
    
    // For previous retention rate, use the current rate as baseline
    // (would need a third period for accurate comparison, so we show N/A via 0% change)
    const previousPeriodRetentionRate = customerRetentionRate;
    
    // Average lifetime value
    const allCustomerRevenues = Object.values(customerStats).map(c => c.revenue);
    const averageLifetimeValue = allCustomerRevenues.length > 0 
      ? Math.round(allCustomerRevenues.reduce((a, b) => a + b, 0) / allCustomerRevenues.length) 
      : 0;
    
    // Top customers by revenue
    const topCustomersByRevenue = Object.values(customerStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(({ name, company, revenue, orderCount }) => ({ name, company, revenue, orderCount }));
    
    return {
      newCustomers,
      previousPeriodNewCustomers,
      newCustomersChange: calculateChange(newCustomers, previousPeriodNewCustomers),
      customerRetentionRate,
      previousPeriodRetentionRate,
      retentionChange: calculateChange(customerRetentionRate, previousPeriodRetentionRate),
      repeatOrderRate,
      previousPeriodRepeatOrderRate,
      repeatOrderChange: calculateChange(repeatOrderRate, previousPeriodRepeatOrderRate),
      averageLifetimeValue,
      topCustomersByRevenue,
    };
  } catch (error) {
    console.error('Error fetching customer report:', error);
    return {
      newCustomers: 0,
      previousPeriodNewCustomers: 0,
      newCustomersChange: 0,
      customerRetentionRate: 100,
      previousPeriodRetentionRate: 100,
      retentionChange: 0,
      repeatOrderRate: 0,
      previousPeriodRepeatOrderRate: 0,
      repeatOrderChange: 0,
      averageLifetimeValue: 0,
      topCustomersByRevenue: [],
    };
  }
}

/**
 * Get dashboard stats for widgets
 */
export async function getDashboardStats(): Promise<DashboardStatsData> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    const monthStart = startOfMonth.toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    
    // Fetch orders for this month
    const ordersRes = await fetch(
      `${API_BASE}/api/orders?pagination[limit]=5000&filters[createdAt][$gte]=${monthStart}`
    );
    
    if (!ordersRes.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const ordersData = await ordersRes.json();
    const orders = ordersData.data || [];
    
    // Calculate metrics
    const revenueThisMonth = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    
    // Get last month for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevRes = await fetch(
      `${API_BASE}/api/orders?pagination[limit]=5000&filters[createdAt][$gte]=${lastMonthStart.toISOString().split('T')[0]}&filters[createdAt][$lte]=${lastMonthEnd.toISOString().split('T')[0]}T23:59:59`
    );
    const prevData = await prevRes.json();
    const prevOrders = prevData.data || [];
    const lastMonthRevenue = prevOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    
    const revenueTrend = calculateChange(revenueThisMonth, lastMonthRevenue);
    
    // Orders this week
    const ordersThisWeek = orders.filter((o: any) => {
      const created = new Date(o.createdAt);
      return created >= startOfWeek;
    }).length;
    
    const ordersThisMonth = orders.length;
    const ordersTrend = calculateChange(ordersThisMonth, prevOrders.length);
    
    // Jobs in production (use module-level constant)
    const jobsInProduction = orders.filter((o: any) => PRODUCTION_STATUSES.includes(o.status)).length;
    
    // Completed today (use module-level constant)
    const completedToday = orders.filter((o: any) => {
      const updated = new Date(o.updatedAt).toISOString().split('T')[0];
      return updated === today && COMPLETED_STATUSES.includes(o.status);
    }).length;
    
    // Revenue by day for chart
    const revenueByDayMap: Record<string, number> = {};
    
    // Initialize all days of the month (using a separate counter variable)
    const currentDate = new Date(startOfMonth);
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      revenueByDayMap[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    orders.forEach((o: any) => {
      const date = new Date(o.createdAt).toISOString().split('T')[0];
      if (Object.prototype.hasOwnProperty.call(revenueByDayMap, date)) {
        revenueByDayMap[date] += o.totalAmount || 0;
      }
    });
    
    const revenueByDay = Object.entries(revenueByDayMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      revenueThisMonth,
      revenueTrend,
      ordersThisWeek,
      ordersThisMonth,
      ordersTrend,
      jobsInProduction,
      completedToday,
      revenueByDay,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      revenueThisMonth: 0,
      revenueTrend: 0,
      ordersThisWeek: 0,
      ordersThisMonth: 0,
      ordersTrend: 0,
      jobsInProduction: 0,
      completedToday: 0,
      revenueByDay: [],
    };
  }
}

/**
 * Sanitize a value to prevent CSV formula injection
 * Prefixes dangerous characters with a single quote
 */
function sanitizeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // Characters that could trigger formula execution in spreadsheet apps
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  
  if (dangerousChars.some(char => stringValue.startsWith(char))) {
    return `'${stringValue}`;
  }
  
  return stringValue;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const rawValue = row[header];
        const value = sanitizeCSVValue(rawValue);
        // Handle values that need quoting
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
