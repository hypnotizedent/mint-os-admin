/**
 * InvoicePreview Component
 * Shows invoice preview before generating/downloading
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Download, 
  Printer,
  X
} from "@phosphor-icons/react"
import type { Invoice } from "@/lib/api/invoices"

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
  isDownloading?: boolean;
}

export function InvoicePreview({ 
  invoice, 
  onClose, 
  onDownload, 
  onPrint,
  isDownloading = false 
}: InvoicePreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Void': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b">
          <CardTitle className="flex items-center gap-2">
            <FileText size={24} />
            Invoice Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPrint}
              className="gap-2"
            >
              <Printer size={16} />
              Print
            </Button>
            <Button 
              size="sm" 
              onClick={onDownload}
              disabled={isDownloading}
              className="gap-2"
            >
              <Download size={16} />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close invoice preview"
            >
              <X size={18} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">PRINTSHOP OS</h1>
              <p className="text-muted-foreground">Your Print Shop Name</p>
              <p className="text-sm text-muted-foreground">123 Main St</p>
              <p className="text-sm text-muted-foreground">City, ST 12345</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">INVOICE</h2>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Bill To:</h3>
              <p className="font-medium">{invoice.customerName}</p>
              <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
              {invoice.customerAddress && (
                <>
                  <p className="text-sm text-muted-foreground">{invoice.customerAddress.street}</p>
                  {invoice.customerAddress.street2 && (
                    <p className="text-sm text-muted-foreground">{invoice.customerAddress.street2}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {invoice.customerAddress.city}, {invoice.customerAddress.state} {invoice.customerAddress.zip}
                  </p>
                </>
              )}
            </div>
            <div className="text-right space-y-1">
              <p><span className="text-muted-foreground">Invoice #:</span> <span className="font-medium">{invoice.invoiceNumber}</span></p>
              <p><span className="text-muted-foreground">Order #:</span> <span className="font-medium">{invoice.orderNumber}</span></p>
              <p><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formatDate(invoice.invoiceDate)}</span></p>
              <p><span className="text-muted-foreground">Due Date:</span> <span className="font-medium">{formatDate(invoice.dueDate)}</span></p>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 font-semibold">Description</th>
                  <th className="text-center py-3 font-semibold w-20">Qty</th>
                  <th className="text-right py-3 font-semibold w-28">Unit Price</th>
                  <th className="text-right py-3 font-semibold w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.length > 0 ? (
                  invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No line items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">{formatCurrency(invoice.tax)}</span>
              </div>
              {invoice.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium">{formatCurrency(invoice.shipping)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>-{formatCurrency(invoice.amountPaid)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-foreground">
                <span>Balance Due:</span>
                <span className={invoice.balance > 0 ? 'text-orange-600' : 'text-green-600'}>
                  {formatCurrency(invoice.balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mt-8 pt-6 border-t text-center text-muted-foreground">
            <p>Payment Terms: Net 30</p>
            <p className="mt-2">Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
