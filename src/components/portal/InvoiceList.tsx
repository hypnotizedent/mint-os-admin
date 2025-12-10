import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MagnifyingGlass, Download, EnvelopeSimple, Eye, FileArrowDown } from "@phosphor-icons/react"
import type { Invoice, InvoiceStatus } from "@/lib/types"

interface InvoiceListProps {
  invoices: Invoice[]
  onViewInvoice: (invoice: Invoice) => void
  onDownloadPDF?: (invoiceId: string) => void
  onEmailInvoice?: (invoiceId: string) => void
  onExportCSV?: () => void
}

export function InvoiceList({ 
  invoices, 
  onViewInvoice, 
  onDownloadPDF,
  onEmailInvoice,
  onExportCSV 
}: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All")
  const [dateRange, setDateRange] = useState("all")

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery === "" ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "All" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Invoices</h2>
          <p className="text-muted-foreground mt-1">View and manage your invoices</p>
        </div>
        {onExportCSV && (
          <Button variant="outline" className="gap-2" onClick={onExportCSV}>
            <FileArrowDown size={18} weight="bold" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlass 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Search invoice or order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "All")}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Void">Void</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No invoices found</p>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Invoice {invoice.invoiceNumber}
                    </h3>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  
                  {invoice.nickname && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {invoice.nickname}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Order</p>
                      <p>#{invoice.orderNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Invoice Date</p>
                      <p>{formatDate(invoice.invoiceDate)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Due Date</p>
                      <p>{formatDate(invoice.dueDate)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Total</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(invoice.total)}
                      </p>
                    </div>
                  </div>

                  {invoice.balance > 0 && invoice.status !== 'Void' && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Balance Due: <span className="font-semibold">{formatCurrency(invoice.balance)}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => onViewInvoice(invoice)}
                  >
                    <Eye size={16} weight="bold" />
                    View
                  </Button>
                  {onDownloadPDF && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => onDownloadPDF(invoice.id)}
                    >
                      <Download size={16} weight="bold" />
                      PDF
                    </Button>
                  )}
                  {onEmailInvoice && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => onEmailInvoice(invoice.id)}
                    >
                      <EnvelopeSimple size={16} weight="bold" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
