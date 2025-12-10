import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Package } from "@phosphor-icons/react"
import type { Quote, QuoteStatus } from "@/lib/types"

interface QuoteListProps {
  quotes: Quote[]
  onViewQuote: (quoteId: string) => void
}

export function QuoteList({ quotes, onViewQuote }: QuoteListProps) {
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | 'all'>('all')

  const filteredQuotes = quotes.filter(quote => 
    filterStatus === 'all' || quote.status === filterStatus
  )

  const pendingQuotes = quotes.filter(q => q.status === 'Pending')
  const recentQuotes = quotes.filter(q => q.status !== 'Pending').slice(0, 10)

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      case 'Approved':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'Rejected':
        return 'bg-red-500/10 text-red-700 dark:text-red-400'
      case 'Expired':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
      case 'Converted':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: QuoteStatus) => {
    switch (status) {
      case 'Pending':
        return <Clock size={16} weight="fill" />
      case 'Approved':
        return <CheckCircle size={16} weight="fill" />
      case 'Rejected':
        return <XCircle size={16} weight="fill" />
      case 'Converted':
        return <Package size={16} weight="fill" />
      default:
        return <Clock size={16} weight="fill" />
    }
  }

  const calculateDaysUntilExpiration = (expiresAt: string): number => {
    const expires = new Date(expiresAt)
    const now = new Date()
    const diffTime = expires.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Quotes</h1>
          <p className="text-muted-foreground mt-1">View and manage your quotes</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
          size="sm"
        >
          All
        </Button>
        <Button 
          variant={filterStatus === 'Pending' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('Pending')}
          size="sm"
        >
          Pending
        </Button>
        <Button 
          variant={filterStatus === 'Approved' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('Approved')}
          size="sm"
        >
          Approved
        </Button>
        <Button 
          variant={filterStatus === 'Converted' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('Converted')}
          size="sm"
        >
          Converted
        </Button>
      </div>

      {pendingQuotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Pending Quotes ({pendingQuotes.length})
          </h2>
          {pendingQuotes.map((quote) => (
            <Card key={quote.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {quote.quoteNumber}
                    </h3>
                    <Badge className={getStatusColor(quote.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </span>
                    </Badge>
                    {quote.status === 'Pending' && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Expires in {calculateDaysUntilExpiration(quote.expiresAt)} days
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {quote.lineItems.slice(0, 2).map((item) => (
                      <p key={item.id} className="text-sm text-muted-foreground">
                        {item.quantity}x {item.productName} - {item.printLocations.join(' & ')} Print
                      </p>
                    ))}
                    {quote.lineItems.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        + {quote.lineItems.length - 2} more items
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total: ${quote.total.toFixed(2)}</span>
                    <span>Created: {formatDate(quote.createdAt)}</span>
                  </div>
                </div>
                <Button onClick={() => onViewQuote(quote.id)}>
                  View & Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {recentQuotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Recent Quotes ({recentQuotes.length})
          </h2>
          {recentQuotes.map((quote) => (
            <Card key={quote.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {quote.quoteNumber}
                    </h3>
                    <Badge className={getStatusColor(quote.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </span>
                    </Badge>
                    {quote.orderNumber && (
                      <Badge variant="outline">
                        Order: {quote.orderNumber}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {quote.lineItems.slice(0, 2).map((item) => (
                      <p key={item.id} className="text-sm text-muted-foreground">
                        {item.quantity}x {item.productName}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total: ${quote.total.toFixed(2)}</span>
                    <span>Created: {formatDate(quote.createdAt)}</span>
                    {quote.approvedAt && (
                      <span>Approved: {formatDate(quote.approvedAt)}</span>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={() => onViewQuote(quote.id)}>
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredQuotes.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No quotes found</p>
        </Card>
      )}
    </div>
  )
}
