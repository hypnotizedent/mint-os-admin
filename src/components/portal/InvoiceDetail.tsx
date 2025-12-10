import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, EnvelopeSimple, Package } from "@phosphor-icons/react"
import type { Invoice, InvoiceStatus } from "@/lib/types"

interface InvoiceDetailProps {
  invoice: Invoice | null
  open: boolean
  onClose: () => void
  onDownloadPDF?: (invoiceId: string) => void
  onEmailInvoice?: (invoiceId: string) => void
  onViewOrder?: (orderNumber: string) => void
}

export function InvoiceDetail({
  invoice,
  open,
  onClose,
  onDownloadPDF,
  onEmailInvoice,
  onViewOrder,
}: InvoiceDetailProps) {
  if (!invoice) return null

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'Overdue':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'Void':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Invoice {invoice.invoiceNumber}</DialogTitle>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>
          <DialogDescription>
            Order #{invoice.orderNumber} | Due: {formatDate(invoice.dueDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-2">
            {onDownloadPDF && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onDownloadPDF(invoice.id)}>
                <Download size={16} weight="bold" />
                Download PDF
              </Button>
            )}
            {onEmailInvoice && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onEmailInvoice(invoice.id)}>
                <EnvelopeSimple size={16} weight="bold" />
                Email Invoice
              </Button>
            )}
            {onViewOrder && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onViewOrder(invoice.orderNumber)}>
                <Package size={16} weight="bold" />
                View Order
              </Button>
            )}
          </div>

          <Separator />

          {/* Customer & Invoice Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Bill To
              </h4>
              <p className="font-medium text-foreground">{invoice.customerName}</p>
              <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
              {invoice.customerAddress && (
                <div className="text-sm text-muted-foreground mt-2">
                  <p>{invoice.customerAddress.street}</p>
                  {invoice.customerAddress.street2 && <p>{invoice.customerAddress.street2}</p>}
                  <p>
                    {invoice.customerAddress.city}, {invoice.customerAddress.state}{' '}
                    {invoice.customerAddress.zip}
                  </p>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Invoice Details
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order #:</span>
                  <span className="font-medium">{invoice.orderNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Line Items
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Description</th>
                    <th className="text-right p-3 text-sm font-medium w-20">Qty</th>
                    <th className="text-right p-3 text-sm font-medium w-28">Unit Price</th>
                    <th className="text-right p-3 text-sm font-medium w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3 text-sm">{item.description}</td>
                      <td className="p-3 text-sm text-right">{item.quantity}</td>
                      <td className="p-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">{formatCurrency(invoice.tax)}</span>
              </div>
              {invoice.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium">{formatCurrency(invoice.shipping)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Amount Paid:</span>
                    <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(invoice.balance)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment History */}
          {invoice.paymentHistory.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Payment History
                </h4>
                <div className="space-y-2">
                  {invoice.paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{formatDate(payment.date)}</p>
                        <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                        <Badge variant="outline" className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Payment Terms */}
          <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium">Payment Terms: Net 30</p>
            <p className="mt-1">Thank you for your business!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
