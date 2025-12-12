import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  EnvelopeSimple, 
  Phone, 
  Buildings, 
  Package, 
  CurrencyDollar,
  Plus,
  Clock,
  FileText,
  ArrowsClockwise
} from "@phosphor-icons/react"
import { CustomerSegmentBadge, CustomerSegmentInfo, type CustomerSegment, segmentConfig } from "./CustomerSegmentBadge"
import { toast } from "sonner"
import type { Customer } from "@/lib/types"
import { dashboardApi } from "@/lib/dashboard-api"

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';
const API_SERVICE_BASE = import.meta.env.VITE_API_SERVICE_URL || 'http://localhost:3001';

interface Order {
  id: string;
  documentId: string;
  orderNumber: string;
  orderNickname?: string;
  visualId?: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  amountOutstanding: number;
  dueDate: string;
  createdAt: string;
  notes?: string;
  items?: Array<{
    description?: string;
    quantity?: number;
  }>;
}

interface SegmentDetails {
  segment: CustomerSegment;
  criteria?: {
    totalOrders?: number;
    ordersLast30Days?: number;
    totalSpend?: number;
    avgOrderValue?: number;
    orderFrequencyPerMonth?: number;
    repeatSimilarity?: number;
  };
  reason?: string;
  detectedAt?: string;
}

interface CustomerDetailPageProps {
  customerId: string;
  onBack: () => void;
  onNewOrder: (customerId: string) => void;
  onViewOrder?: (orderId: string) => void;
}

export function CustomerDetailPage({ customerId, onBack, onNewOrder, onViewOrder }: CustomerDetailPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segmentDetails, setSegmentDetails] = useState<SegmentDetails | null>(null);
  const [segmentLoading, setSegmentLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Fetch customer segment
  const fetchSegment = async () => {
    try {
      const res = await fetch(`${API_SERVICE_BASE}/api/customers/${customerId}/segment`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSegmentDetails(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch segment:', err);
    }
  };

  // Auto-detect segment
  const handleDetectSegment = async () => {
    setIsDetecting(true);
    try {
      const res = await fetch(`${API_SERVICE_BASE}/api/customers/${customerId}/segment/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoUpdate: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSegmentDetails(data.data.details);
          toast.success(`Segment updated to ${data.data.newSegment.toUpperCase()}`);
        }
      } else {
        toast.error('Failed to detect segment');
      }
    } catch (err) {
      console.error('Failed to detect segment:', err);
      toast.error('Failed to detect segment');
    } finally {
      setIsDetecting(false);
    }
  };

  // Override segment manually
  const handleOverrideSegment = async (newSegment: CustomerSegment) => {
    setSegmentLoading(true);
    try {
      const res = await fetch(`${API_SERVICE_BASE}/api/customers/${customerId}/segment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment: newSegment }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSegmentDetails(data.data.details);
          toast.success(`Segment manually set to ${newSegment.toUpperCase()}`);
        }
      } else {
        toast.error('Failed to update segment');
      }
    } catch (err) {
      console.error('Failed to override segment:', err);
      toast.error('Failed to update segment');
    } finally {
      setSegmentLoading(false);
    }
  };

  // Fetch customer details from dashboard API
  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use dashboard API to get customer with stats
        const result = await dashboardApi.getCustomers({ limit: 5000 });
        const c = result.customers.find(cust => cust.id === customerId);
        
        if (!c) {
          throw new Error('Customer not found');
        }
        
        setCustomer({
          id: c.id,
          name: c.name || 'Unknown',
          email: c.email || '',
          phone: c.phone || '',
          company: c.company || '',
          totalOrders: c.totalOrders || 0,
          totalRevenue: c.paidRevenue || 0,
          lastOrderDate: c.lastOrderDate || new Date().toISOString(),
          status: c.status as 'active' | 'inactive',
        });
      } catch (err) {
        setError('Failed to load customer details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
      fetchSegment();
    }
  }, [customerId]);

  // Fetch customer orders from dashboard API
  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        // Get all orders and filter by customer name
        const result = await dashboardApi.getOrders({ limit: 5000 });
        const customerOrders = result.orders.filter(o => 
          o.customer_name === customer?.name
        );
        
        const fetchedOrders: Order[] = customerOrders.map((o: any) => ({
          id: o.id.toString(),
          documentId: o.id.toString(),
          orderNumber: o.order_number || `#${o.id}`,
          orderNickname: o.order_nickname || null,
          visualId: o.order_number,
          status: o.printavo_status_name || o.status || 'PENDING',
          totalAmount: parseFloat(o.total_amount) || 0,
          amountPaid: parseFloat(o.total_amount) - parseFloat(o.amount_outstanding || '0'),
          amountOutstanding: parseFloat(o.amount_outstanding || '0'),
          dueDate: o.due_date || '',
          createdAt: o.due_date || new Date().toISOString(),
          notes: o.notes || o.production_notes,
          items: o.line_items || [],
        }));
        
        // Sort by date descending
        fetchedOrders.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (customerId && customer) {
      fetchOrders();
    }
  }, [customerId, customer?.name]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'QUOTE': 'bg-yellow-100 text-yellow-800',
      'QUOTE_SENT': 'bg-yellow-100 text-yellow-800',
      'PENDING': 'bg-blue-100 text-blue-800',
      'IN_PRODUCTION': 'bg-purple-100 text-purple-800',
      'READY_TO_SHIP': 'bg-cyan-100 text-cyan-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'INVOICE PAID': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="w-full space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft size={18} />
          Back to Customers
        </Button>
        <Card className="p-12 text-center">
          <p className="text-destructive">{error || 'Customer not found'}</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Return to Customer List
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={18} />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {customer.name}
              </h1>
              {segmentDetails?.segment && (
                <CustomerSegmentBadge segment={segmentDetails.segment} size="md" />
              )}
            </div>
            <p className="text-muted-foreground">{customer.company}</p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => onNewOrder(customerId)}>
          <Plus size={18} weight="bold" />
          New Order
        </Button>
      </div>

      {/* Customer Segment Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Buildings size={20} />
            Customer Segment
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetectSegment}
              disabled={isDetecting}
              className="gap-2"
            >
              <ArrowsClockwise size={16} className={isDetecting ? 'animate-spin' : ''} />
              {isDetecting ? 'Detecting...' : 'Auto-Detect'}
            </Button>
            <Select
              value={segmentDetails?.segment || 'b2c'}
              onValueChange={(value) => handleOverrideSegment(value as CustomerSegment)}
              disabled={segmentLoading}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Override" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(segmentConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {segmentDetails ? (
          <CustomerSegmentInfo
            segment={segmentDetails.segment}
            details={{
              ...segmentDetails.criteria,
              reason: segmentDetails.reason,
            }}
            autoDetected={true}
            lastUpdate={segmentDetails.detectedAt}
          />
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="mb-2">No segment detected yet</p>
            <p className="text-sm">Click "Auto-Detect" to analyze order history</p>
          </div>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {customer.totalOrders}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Package size={24} weight="fill" className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${customer.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CurrencyDollar size={24} weight="fill" className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <EnvelopeSimple size={20} className="text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium truncate">{customer.email || 'Not provided'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone || 'Not provided'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-24" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No orders found for this customer.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {ordersLoading ? 'Loading orders...' : 'Orders may still be importing from Printavo.'}
              </p>
              <Button onClick={() => onNewOrder(customerId)}>
                <Plus size={16} className="mr-2" />
                Create First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.documentId || order.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onViewOrder?.(order.documentId || order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-foreground">
                        #{order.orderNumber}
                      </span>
                      {order.orderNickname && (
                        <span className="text-muted-foreground font-medium">
                          {order.orderNickname}
                        </span>
                      )}
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {order.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Due: {new Date(order.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {order.notes && (
                        <span className="truncate max-w-[200px]" title={order.notes}>
                          {order.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {order.totalAmount > 0 ? (
                      <>
                        <p className="text-lg font-semibold text-foreground">
                          ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {order.amountOutstanding > 0 && order.amountPaid > 0 && (
                          <p className="text-xs text-orange-600">
                            ${order.amountOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })} due
                          </p>
                        )}
                        {order.amountPaid > 0 && order.amountOutstanding === 0 && (
                          <p className="text-xs text-green-600">Paid in full</p>
                        )}
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-muted-foreground">Quote</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
