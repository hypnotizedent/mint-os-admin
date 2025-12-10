import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  Package, 
  MapPin, 
  CalendarBlank,
  CheckCircle,
  Clock
} from "@phosphor-icons/react"
import type { Order, OrderStatus } from "@/lib/types"
import { format } from "date-fns"

interface OrderDetailsProps {
  order: Order
  onDownloadInvoice: (orderId: number) => void
  onDownloadFiles: (orderId: number) => void
}

const statusColors: Record<OrderStatus, string> = {
  quote: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  in_production: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  ready_to_ship: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-300",
  completed: "bg-green-500/10 text-green-700 dark:text-green-300",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
  invoice_paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  payment_due: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
}

const formatStatus = (status: OrderStatus): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function OrderDetails({ order, onDownloadInvoice, onDownloadFiles }: OrderDetailsProps) {
  const { attributes } = order

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Order #{attributes.printavoId}</h2>
          {attributes.orderNickname && (
            <p className="text-muted-foreground mt-1">{attributes.orderNickname}</p>
          )}
        </div>
        <Badge className={statusColors[attributes.status]}>
          {formatStatus(attributes.status)}
        </Badge>
      </div>

      {/* Order Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Order Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Package size={20} className="text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Order Number</p>
              <p className="text-muted-foreground">#{attributes.printavoId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarBlank size={20} className="text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Order Date</p>
              <p className="text-muted-foreground">
                {format(new Date(attributes.timeline.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          {attributes.timeline.dueDate && (
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-muted-foreground">
                  {format(new Date(attributes.timeline.dueDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          )}
          {(attributes.status === 'delivered' || attributes.status === 'completed') && (
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Delivered</p>
                <p className="text-muted-foreground">
                  {format(new Date(attributes.timeline.updatedAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Customer & Shipping */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Customer & Shipping</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">Customer</p>
            <p className="text-foreground">{attributes.customer.name}</p>
            {attributes.customer.company && (
              <p className="text-muted-foreground text-sm">{attributes.customer.company}</p>
            )}
            <p className="text-muted-foreground text-sm">{attributes.customer.email}</p>
          </div>
          {attributes.shippingAddress && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin size={16} />
                Shipping Address
              </p>
              <p className="text-muted-foreground text-sm">{attributes.shippingAddress.street}</p>
              {attributes.shippingAddress.street2 && (
                <p className="text-muted-foreground text-sm">{attributes.shippingAddress.street2}</p>
              )}
              <p className="text-muted-foreground text-sm">
                {attributes.shippingAddress.city}, {attributes.shippingAddress.state} {attributes.shippingAddress.zip}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Line Items */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Items</h3>
        <div className="space-y-4">
          {attributes.lineItems.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-3 border-b last:border-0">
              <div className="flex-1">
                <p className="font-medium">{item.description}</p>
                {item.category && (
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                )}
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="text-right">
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Unit Price</p>
                  <p className="font-medium">${item.unitCost.toFixed(2)}</p>
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold">${item.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pricing Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pricing Breakdown</h3>
        <div className="space-y-3 max-w-md ml-auto">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${attributes.totals.subtotal.toFixed(2)}</span>
          </div>
          {attributes.totals.fees > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fees</span>
              <span className="font-medium">${attributes.totals.fees.toFixed(2)}</span>
            </div>
          )}
          {attributes.totals.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-green-600">-${attributes.totals.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">${attributes.totals.tax.toFixed(2)}</span>
          </div>
          {attributes.totals.shipping > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">${attributes.totals.shipping.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${attributes.totals.total.toFixed(2)}</span>
          </div>
          {attributes.totals.amountPaid > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">${attributes.totals.amountPaid.toFixed(2)}</span>
              </div>
              {attributes.totals.amountOutstanding > 0 && (
                <div className="flex justify-between text-orange-600 dark:text-orange-400 font-semibold">
                  <span>Balance Due</span>
                  <span>${attributes.totals.amountOutstanding.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Files & Downloads */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Files & Downloads</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => onDownloadInvoice(order.id)}
          >
            <Download size={18} />
            Download Invoice
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => onDownloadFiles(order.id)}
          >
            <Download size={18} />
            Download Art Files
          </Button>
        </div>
      </Card>

      {/* Notes */}
      {attributes.notes && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Order Notes</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{attributes.notes}</p>
        </Card>
      )}
    </div>
  )
}
