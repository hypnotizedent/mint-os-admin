/**
 * OrderDetailPage Component
 * Staff-facing order detail view with line items, payments, and actions
 */
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Package, 
  User,
  Clock,
  CalendarBlank,
  CurrencyDollar,
  Printer,
  Truck,
  FileText,
  CheckCircle,
  Warning,
  Copy,
  Receipt,
  CaretDown
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { generateInvoice, type Invoice } from "@/lib/api/invoices"
import { printInvoice } from "@/lib/api/invoice-utils"
import { InvoicePreview } from "@/components/invoices/InvoicePreview"
import { PaymentHistory } from "@/components/payments/PaymentHistory"
import { dashboardApi, type OrderDetail as ApiOrderDetail } from "@/lib/dashboard-api"

// Workflow statuses grouped by stage
const WORKFLOW_STATUSES = {
  'Quotes': [
    'QUOTE',
    'QUOTE - Pending Approval',
    'QUOTE - Sent',
    'QUOTE - Approved',
    'QUOTE - Rejected',
  ],
  'Art & Design': [
    'ART - Waiting for Art',
    'ART - In Progress',
    'ART - Ready for Review',
    'ART - Approved',
    'ART - Revisions Needed',
  ],
  'Screen Print': [
    'SP - Waiting for Screens',
    'SP - Screens Ready',
    'SP - In Production',
    'SP - On Press',
    'SP - Printing Complete',
  ],
  'Embroidery': [
    'EMB - Digitizing',
    'EMB - Ready to Stitch',
    'EMB - In Production',
    'EMB - Complete',
  ],
  'DTG / Direct to Garment': [
    'DTG - Queue',
    'DTG - Printing',
    'DTG - Complete',
  ],
  'Fulfillment': [
    'SUPA - Ready for Fulfillment',
    'SUPA - Packing',
    'SUPA - Ready for Pickup',
    'SUPA - Shipped',
  ],
  'Completion': [
    'COMPLETE',
    'COMPLETE - Picked Up',
    'COMPLETE - Delivered',
    'INVOICE PAID',
    'CANCELLED',
  ],
};

interface LineItem {
  id: string;
  documentId?: string;
  styleDescription?: string;
  styleNumber?: string;
  color?: string;
  totalQuantity: number;
  unitPrice: number;
  totalCost: number;
  sizeXS?: number;
  sizeS?: number;
  sizeM?: number;
  sizeL?: number;
  sizeXL?: number;
  size2XL?: number;
  size3XL?: number;
  size4XL?: number;
  size5XL?: number;
}

interface StatusChange {
  from: string;
  to: string;
  changedAt: string;
  changedBy?: string;
}

interface OrderDetail {
  id: string;
  documentId: string;
  orderNumber: string;
  orderNickname?: string;
  visualId?: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  amountOutstanding: number;
  salesTax: number;
  discount: number;
  fees: number;
  dueDate?: string;
  customerDueDate?: string;
  productionDueDate?: string;
  createdAt: string;
  notes?: string;
  productionNotes?: string;
  deliveryMethod?: string;
  customerPO?: string;
  statusHistory?: StatusChange[];
  customer?: {
    id: string;
    documentId?: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  lineItems?: LineItem[];
}

interface OrderDetailPageProps {
  orderId: string;
  onBack: () => void;
  onViewCustomer?: (customerId: string) => void;
}

export function OrderDetailPage({ orderId, onBack, onViewCustomer }: OrderDetailPageProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [paymentRefreshTrigger, setPaymentRefreshTrigger] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleGenerateInvoice = async () => {
    if (!order) return;
    
    setIsGeneratingInvoice(true);
    try {
      const { success, invoice, error: invoiceError } = await generateInvoice({ 
        orderId: order.documentId 
      });
      
      if (success && invoice) {
        setInvoicePreview(invoice);
        toast.success('Invoice generated');
      } else {
        toast.error(invoiceError || 'Failed to generate invoice');
      }
    } catch {
      toast.error('Failed to generate invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!invoicePreview) return;
    printInvoice(invoicePreview);
    toast.success('Invoice ready for download');
  };

  const handlePrintInvoice = () => {
    if (!invoicePreview) return;
    printInvoice(invoicePreview);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.status) return;
    
    const previousStatus = order.status;
    setIsUpdatingStatus(true);
    
    try {
      await dashboardApi.updateOrderStatus(parseInt(order.id), newStatus);
      
      // Update local state
      setOrder(prev => prev ? {
        ...prev,
        status: newStatus,
        statusHistory: [
          ...(prev.statusHistory || []),
          {
            from: previousStatus,
            to: newStatus,
            changedAt: new Date().toISOString(),
            changedBy: 'Current User'
          }
        ]
      } : null);
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await dashboardApi.getOrder(parseInt(orderId, 10));
        
        if (!data) {
          throw new Error('Order not found');
        }
        
        setOrder({
          id: data.id.toString(),
          documentId: data.id.toString(),
          orderNumber: data.orderNumber || `#${data.id}`,
          orderNickname: data.orderNickname,
          visualId: data.orderNumber,
          status: data.printavoStatusName || data.status || 'QUOTE',
          totalAmount: data.totalAmount || 0,
          amountPaid: (data.totalAmount || 0) - (data.amountOutstanding || 0),
          amountOutstanding: data.amountOutstanding || 0,
          salesTax: 0,
          discount: 0,
          fees: 0,
          dueDate: data.dueDate,
          customerDueDate: data.customerDueDate,
          productionDueDate: undefined,
          createdAt: data.dueDate || new Date().toISOString(),
          notes: undefined,
          productionNotes: undefined,
          deliveryMethod: undefined,
          customerPO: undefined,
          statusHistory: (data.statusHistory || []).map((h: { status: string; previous_status: string; changed_by: string; changed_at: string }) => ({ from: h.previous_status, to: h.status, changedAt: h.changed_at, changedBy: h.changed_by })),
          customer: data.customer ? {
            id: data.customer.id?.toString(),
            documentId: data.customer.id?.toString(),
            name: data.customer.name || 'Unknown',
            email: data.customer.email,
            phone: data.customer.phone,
            company: data.customer.company,
          } : undefined,
          lineItems: (data.lineItems || []).map((li) => ({
            id: li.id.toString(),
            documentId: li.id.toString(),
            styleDescription: li.description,
            styleNumber: li.styleNumber,
            color: li.color,
            totalQuantity: li.totalQuantity || 0,
            unitPrice: li.unitCost || 0,
            totalCost: li.totalCost || 0,
            sizeXS: li.sizes?.xs || 0,
            sizeS: li.sizes?.s || 0,
            sizeM: li.sizes?.m || 0,
            sizeL: li.sizes?.l || 0,
            sizeXL: li.sizes?.xl || 0,
            size2XL: li.sizes?.xxl || 0,
            size3XL: li.sizes?.xxxl || 0,
            size4XL: li.sizes?.xxxxl || 0,
            size5XL: li.sizes?.xxxxxl || 0,
          })),
        });
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('quote')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (statusLower.includes('art')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (statusLower.includes('sp ') || statusLower.includes('screen')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (statusLower.includes('emb')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    if (statusLower.includes('dtg')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    if (statusLower.includes('supa') || statusLower.includes('fulfillment')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    if (statusLower.includes('complete') || statusLower.includes('paid')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (statusLower.includes('cancel')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (statusLower.includes('shipped') || statusLower.includes('pickup')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const formatStatus = (status: string) => {
    return status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      toast.success('Order number copied');
    }
  };

  const getSizeBreakdown = (item: LineItem) => {
    const sizes = [
      { label: 'XS', value: item.sizeXS },
      { label: 'S', value: item.sizeS },
      { label: 'M', value: item.sizeM },
      { label: 'L', value: item.sizeL },
      { label: 'XL', value: item.sizeXL },
      { label: '2XL', value: item.size2XL },
      { label: '3XL', value: item.size3XL },
      { label: '4XL', value: item.size4XL },
      { label: '5XL', value: item.size5XL },
    ].filter(s => s.value && s.value > 0);
    return sizes;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft size={18} />
          Back
        </Button>
        <Card className="p-12 text-center">
          <Warning size={48} className="mx-auto text-destructive mb-4" />
          <p className="text-destructive">{error || 'Order not found'}</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Return
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                #{order.orderNumber}
              </h1>
              <Button variant="ghost" size="sm" onClick={copyOrderNumber} className="h-8 w-8 p-0">
                <Copy size={16} />
              </Button>
            </div>
            {order.orderNickname && (
              <p className="text-xl text-muted-foreground font-medium mt-1">
                {order.orderNickname}
              </p>
            )}
          </div>
        </div>
        
        {/* Status Dropdown - Prominent position */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
            <Select
              value={order.status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-[280px] h-12 text-base font-medium">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(order.status) + ' text-xs'}>
                    {order.status}
                  </Badge>
                  {isUpdatingStatus && <span className="text-xs text-muted-foreground">Updating...</span>}
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {Object.entries(WORKFLOW_STATUSES).map(([group, statuses]) => (
                  <SelectGroup key={group}>
                    <SelectLabel className="font-semibold text-xs uppercase tracking-wide text-muted-foreground px-2 py-2 bg-muted/50">
                      {group}
                    </SelectLabel>
                    {statuses.map((status) => (
                      <SelectItem 
                        key={status} 
                        value={status}
                        className="pl-4"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status) + ' text-xs'}>
                            {status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleGenerateInvoice}
          disabled={isGeneratingInvoice}
        >
          <Receipt size={18} />
          {isGeneratingInvoice ? 'Generating...' : 'Generate Invoice'}
        </Button>
        <Button variant="outline" className="gap-2">
          <Printer size={18} />
          Print
        </Button>
        <Button variant="outline" className="gap-2">
          <Truck size={18} />
          Ship
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <CurrencyDollar size={24} weight="fill" className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Paid
              </p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(order.amountPaid)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <CheckCircle size={24} weight="fill" className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Outstanding
              </p>
              <p className={`text-2xl font-bold mt-2 ${order.amountOutstanding > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                {formatCurrency(order.amountOutstanding)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
              <Warning size={24} weight="fill" className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Due Date
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {order.dueDate ? formatDate(order.dueDate) : 'TBD'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <CalendarBlank size={24} weight="fill" className="text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Line Items ({order.lineItems?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.lineItems && order.lineItems.length > 0 ? (
                <div className="space-y-4">
                  {order.lineItems.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {item.styleDescription || item.styleNumber || `Item ${index + 1}`}
                          </p>
                          {item.styleNumber && item.styleDescription && (
                            <p className="text-sm text-muted-foreground">
                              Style: {item.styleNumber}
                            </p>
                          )}
                          {item.color && (
                            <p className="text-sm text-muted-foreground">
                              Color: {item.color}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.totalCost)}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.totalQuantity} pcs x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                      
                      {getSizeBreakdown(item).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                          {getSizeBreakdown(item).map(size => (
                            <Badge key={size.label} variant="secondary" className="text-xs">
                              {size.label}: {size.value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No line items found</p>
                  <p className="text-sm">Line items may still be importing</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(order.notes || order.productionNotes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Customer Notes</p>
                    <p className="text-foreground whitespace-pre-wrap">{order.notes}</p>
                  </div>
                )}
                {order.productionNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Production Notes</p>
                    <p className="text-foreground whitespace-pre-wrap">{order.productionNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Status History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.statusHistory.slice().reverse().map((change, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          Changed from{' '}
                          <Badge variant="outline" className="text-xs mx-1">{change.from}</Badge>
                          {' '}to{' '}
                          <Badge className={getStatusColor(change.to) + ' text-xs mx-1'}>{change.to}</Badge>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {change.changedBy && <span>{change.changedBy} - </span>}
                          {formatDateTime(change.changedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <PaymentHistory
            orderDocumentId={order.documentId}
            totalAmount={order.totalAmount}
            refreshTrigger={paymentRefreshTrigger}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">{order.customer.name}</p>
                    {order.customer.company && (
                      <p className="text-sm text-muted-foreground">{order.customer.company}</p>
                    )}
                  </div>
                  {order.customer.email && (
                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                  )}
                  {order.customer.phone && (
                    <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                  )}
                  {onViewCustomer && order.customer.documentId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => onViewCustomer(order.customer!.documentId!)}
                    >
                      View Customer
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No customer linked</p>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              {order.customerDueDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Due</span>
                  <span className="font-medium">{formatDate(order.customerDueDate)}</span>
                </div>
              )}
              {order.productionDueDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Production Due</span>
                  <span className="font-medium">{formatDate(order.productionDueDate)}</span>
                </div>
              )}
              {order.deliveryMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <Badge variant="outline">{order.deliveryMethod}</Badge>
                </div>
              )}
              {order.customerPO && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer PO</span>
                  <span className="font-medium">{order.customerPO}</span>
                </div>
              )}
              
              <Separator className="my-3" />
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.totalAmount - order.salesTax - order.fees + order.discount)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.fees > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fees</span>
                  <span className="font-medium">{formatCurrency(order.fees)}</span>
                </div>
              )}
              {order.salesTax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatCurrency(order.salesTax)}</span>
                </div>
              )}
              
              <Separator className="my-3" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {invoicePreview && (
        <InvoicePreview
          invoice={invoicePreview}
          onClose={() => setInvoicePreview(null)}
          onDownload={handleDownloadInvoice}
          onPrint={handlePrintInvoice}
        />
      )}
    </div>
  );
}
