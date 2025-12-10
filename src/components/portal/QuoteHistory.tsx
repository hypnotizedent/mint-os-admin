import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Package } from "@phosphor-icons/react"
import type { Quote, QuoteStatus } from "@/lib/types"

interface QuoteHistoryProps {
  quotes: Quote[]
  onViewQuote: (quoteId: string) => void
}

export function QuoteHistory({ quotes, onViewQuote }: QuoteHistoryProps) {
  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Quote History</h1>
        <p className="text-muted-foreground mt-1">
          View your past quotes and their outcomes
        </p>
      </div>

      {quotes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No quote history available</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
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
                    {quote.lineItems.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        + {quote.lineItems.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total: ${quote.total.toFixed(2)}</span>
                    <span>Created: {formatDate(quote.createdAt)}</span>
                    {quote.approvedAt && (
                      <span>Approved: {formatDate(quote.approvedAt)}</span>
                    )}
                    {quote.rejectedAt && (
                      <span>Rejected: {formatDate(quote.rejectedAt)}</span>
                    )}
                    {quote.convertedAt && (
                      <span>Converted: {formatDate(quote.convertedAt)}</span>
                    )}
                  </div>

                  {quote.rejectionReason && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Rejection reason:</span> {quote.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <Button variant="outline" onClick={() => onViewQuote(quote.id)}>
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
