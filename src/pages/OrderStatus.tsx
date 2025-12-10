import { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface OrderStatus {
  status: string;
  timestamp: string;
  description: string;
}

interface OrderData {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  status: string;
  statusHistory: OrderStatus[];
  totalAmount: number;
  amountPaid: number;
  amountOutstanding: number;
  dueDate: string;
  items: Array<{
    name: string;
    quantity: number;
    status?: string;
  }>;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = {
  QUOTE: {
    label: 'Quote',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: FileText,
    description: 'Your quote is being prepared',
  },
  QUOTE_SENT: {
    label: 'Quote Sent',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: FileText,
    description: 'Quote has been sent for your review',
  },
  QUOTE_APPROVED: {
    label: 'Approved',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    description: 'Quote approved, awaiting payment',
  },
  PAYMENT_NEEDED: {
    label: 'Payment Needed',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: CreditCard,
    description: 'Payment required to begin production',
  },
  IN_PRODUCTION: {
    label: 'In Production',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: Package,
    description: 'Your order is being produced',
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    icon: MapPin,
    description: 'Order ready for pickup at our location',
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: Truck,
    description: 'Your order is on its way',
  },
  COMPLETE: {
    label: 'Complete',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    description: 'Order delivered successfully',
  },
  INVOICE_PAID: {
    label: 'Paid',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    description: 'Order complete and paid in full',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: AlertCircle,
    description: 'This order has been cancelled',
  },
};

export default function OrderStatusTracker() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get order ID from URL
  const orderId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('order')
    : null;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order specified. Please check the link and try again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/orders?filters[orderNumber][$eq]=${orderId}&populate=customer`
        );
        
        if (!response.ok) {
          throw new Error('Failed to load order');
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          throw new Error('Order not found');
        }

        const orderData = data.data[0];
        
        // Transform to expected format
        setOrder({
          orderNumber: orderData.orderNumber,
          customer: {
            name: orderData.customer?.name || 'Customer',
            email: orderData.customer?.email || '',
            phone: orderData.customer?.phone,
            company: orderData.customer?.company,
          },
          status: orderData.status,
          statusHistory: [], // Would be populated from actual history
          totalAmount: orderData.totalAmount || 0,
          amountPaid: orderData.amountPaid || 0,
          amountOutstanding: orderData.amountOutstanding || 0,
          dueDate: orderData.dueDate,
          items: orderData.items || [],
          trackingNumber: orderData.trackingNumber,
          trackingUrl: orderData.trackingUrl,
          estimatedDelivery: orderData.estimatedDelivery,
          createdAt: orderData.createdAt,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.QUOTE;
  };

  const getProgressSteps = () => {
    const steps = ['QUOTE_APPROVED', 'IN_PRODUCTION', 'SHIPPED', 'COMPLETE'];
    const currentIndex = steps.indexOf(order?.status || '');
    
    return steps.map((step, index) => ({
      ...getStatusConfig(step),
      isComplete: currentIndex >= index,
      isCurrent: order?.status === step,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const progressSteps = getProgressSteps();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Order Number</p>
                <h1 className="text-2xl font-bold">#{order.orderNumber}</h1>
              </div>
              <div className={`${statusConfig.bgColor} ${statusConfig.color} px-4 py-2 rounded-full font-medium flex items-center`}>
                <StatusIcon className="w-5 h-5 mr-2" />
                {statusConfig.label}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {order.status !== 'CANCELLED' && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {progressSteps.map((step, index) => (
                  <div key={index} className="flex-1 flex items-center">
                    <div className="relative flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${step.isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}
                        ${step.isCurrent ? 'ring-4 ring-green-200' : ''}
                      `}>
                        {step.isComplete ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`
                        mt-2 text-xs font-medium
                        ${step.isComplete || step.isCurrent ? 'text-gray-900' : 'text-gray-400'}
                      `}>
                        {step.label}
                      </span>
                    </div>
                    {index < progressSteps.length - 1 && (
                      <div className={`
                        flex-1 h-1 mx-2
                        ${step.isComplete ? 'bg-green-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="p-6 bg-gray-50">
            <p className="text-gray-700 text-lg">{statusConfig.description}</p>
            {order.estimatedDelivery && (
              <p className="mt-2 text-gray-600">
                <Clock className="w-4 h-4 inline mr-2" />
                Estimated delivery: <strong>{formatDate(order.estimatedDelivery)}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-indigo-600" />
              Tracking Information
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="font-mono font-medium text-gray-900">{order.trackingNumber}</p>
              </div>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Track Package
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-indigo-600" />
            Order Details
          </h2>

          <div className="space-y-3 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                {item.status && (
                  <span className={`text-sm font-medium ${getStatusConfig(item.status).color}`}>
                    {getStatusConfig(item.status).label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Order Total</span>
              <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Amount Paid</span>
              <span className="font-medium">{formatCurrency(order.amountPaid)}</span>
            </div>
            {order.amountOutstanding > 0 && (
              <div className="flex justify-between text-amber-600 font-medium">
                <span>Balance Due</span>
                <span>{formatCurrency(order.amountOutstanding)}</span>
              </div>
            )}
          </div>

          {order.amountOutstanding > 0 && (
            <button
              onClick={() => window.location.href = `${API_BASE}/api/payments/checkout?orderId=${order.orderNumber}&type=balance`}
              className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Pay Balance ({formatCurrency(order.amountOutstanding)})
            </button>
          )}
        </div>

        {/* Delivery Address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
              Delivery Address
            </h2>
            <address className="not-italic text-gray-700">
              {order.customer.company && <p className="font-medium">{order.customer.company}</p>}
              <p>{order.customer.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            </address>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="font-bold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="tel:+15551234567"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Call Us</p>
                <p className="font-medium text-gray-900">(555) 123-4567</p>
              </div>
            </a>
            <a 
              href="mailto:support@printshop.com"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email Us</p>
                <p className="font-medium text-gray-900">support@printshop.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Order placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
