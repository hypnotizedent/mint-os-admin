import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceList } from "./InvoiceList"
import { InvoiceDetail } from "./InvoiceDetail"
import { PaymentMethods } from "./PaymentMethods"
import { PaymentHistory } from "./PaymentHistory"
import type { Invoice, PaymentMethod, Payment, AccountBalance } from "@/lib/types"

interface BillingPageProps {
  invoices: Invoice[]
  paymentMethods: PaymentMethod[]
  payments: Payment[]
  accountBalance: AccountBalance
}

export function BillingPage({
  invoices,
  paymentMethods,
  payments,
  accountBalance,
}: BillingPageProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  const handleDownloadPDF = (invoiceId: string) => {
    console.log('Download PDF for invoice:', invoiceId)
    // In production, this would trigger a PDF download
    // e.g., window.open(`/api/customer/invoices/${invoiceId}/pdf`, '_blank')
  }

  const handleEmailInvoice = (invoiceId: string) => {
    console.log('Email invoice:', invoiceId)
    // In production, this would open an email dialog or send directly
  }

  const handleExportCSV = () => {
    console.log('Export invoices to CSV')
    // In production, this would trigger a CSV download
  }

  const handleAddPaymentMethod = () => {
    console.log('Add payment method')
    // In production, this would open a payment method form/modal
  }

  const handleRemovePaymentMethod = (methodId: string) => {
    console.log('Remove payment method:', methodId)
    // In production, this would call the API to remove the method
  }

  const handleSetDefault = (methodId: string) => {
    console.log('Set default payment method:', methodId)
    // In production, this would call the API to update the default
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Billing & Invoicing</h1>
        <p className="text-muted-foreground mt-1">Manage your invoices, payments, and billing information</p>
      </div>

      {/* Account Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Total Outstanding
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {formatCurrency(accountBalance.totalOutstanding)}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Overdue
            </p>
            <p className="text-3xl font-bold text-red-500 mt-2">
              {formatCurrency(accountBalance.overdueAmount)}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Current
            </p>
            <p className="text-3xl font-bold text-yellow-500 mt-2">
              {formatCurrency(accountBalance.currentAmount)}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Open Invoices
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {accountBalance.invoiceCount}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <InvoiceList
            invoices={invoices}
            onViewInvoice={handleViewInvoice}
            onDownloadPDF={handleDownloadPDF}
            onEmailInvoice={handleEmailInvoice}
            onExportCSV={handleExportCSV}
          />
        </TabsContent>

        <TabsContent value="payment-methods">
          <PaymentMethods
            paymentMethods={paymentMethods}
            onAddPaymentMethod={handleAddPaymentMethod}
            onRemovePaymentMethod={handleRemovePaymentMethod}
            onSetDefault={handleSetDefault}
          />
        </TabsContent>

        <TabsContent value="payment-history">
          <PaymentHistory payments={payments} />
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Modal */}
      <InvoiceDetail
        invoice={selectedInvoice}
        open={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        onDownloadPDF={handleDownloadPDF}
        onEmailInvoice={handleEmailInvoice}
      />
    </div>
  )
}
