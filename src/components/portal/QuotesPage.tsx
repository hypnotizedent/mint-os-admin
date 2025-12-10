/**
 * QuotesPage - Wires QuoteList and QuoteApproval to Strapi
 * 
 * Created: November 29, 2025
 */
import { useState, useEffect, useCallback } from "react"
import { QuoteList } from "./QuoteList"
import { QuoteApproval } from "./QuoteApproval"
import { 
  fetchCustomerQuotes, 
  fetchQuoteDetails, 
  approveQuote,
  type PortalQuote 
} from "@/lib/portal-api"
import type { Quote } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface QuotesPageProps {
  customerId?: string
  showOnlyPending?: boolean
}

/**
 * Map PortalQuote to full Quote type for components
 */
function mapPortalQuoteToQuote(pq: PortalQuote): Quote {
  return {
    id: pq.id,
    quoteNumber: pq.quoteNumber,
    customerId: pq.documentId || '',
    status: mapStatus(pq.status),
    createdAt: pq.createdAt,
    expiresAt: pq.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lineItems: [],  // Minimal data - full details loaded when viewing
    subtotal: pq.totalAmount || 0,
    setupFees: 0,
    rushFee: 0,
    tax: 0,
    total: pq.totalAmount || 0,
    artworkFiles: [],
    changeRequests: [],
    notes: pq.notes,
  }
}

function mapStatus(status: string): Quote['status'] {
  const statusMap: Record<string, Quote['status']> = {
    draft: 'Pending',
    sent: 'Pending',
    viewed: 'Pending',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    converted: 'Converted',
  }
  return statusMap[status?.toLowerCase()] || 'Pending'
}

export function QuotesPage({ customerId, showOnlyPending = false }: QuotesPageProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isApprovalOpen, setIsApprovalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQuotes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const portalQuotes = await fetchCustomerQuotes(customerId || '', {
        status: showOnlyPending ? 'pending' : undefined,
        limit: 100,
      })
      
      setQuotes(portalQuotes.map(mapPortalQuoteToQuote))
    } catch (err) {
      console.error('Failed to load quotes:', err)
      setError('Failed to load quotes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [customerId, showOnlyPending])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  const handleViewQuote = async (quoteId: string) => {
    // Fetch full quote details
    const fullQuote = await fetchQuoteDetails(quoteId)
    
    if (fullQuote) {
      setSelectedQuote(fullQuote)
      setIsApprovalOpen(true)
    } else {
      // Fallback to basic quote data
      const basicQuote = quotes.find(q => q.id === quoteId)
      if (basicQuote) {
        setSelectedQuote(basicQuote)
        setIsApprovalOpen(true)
      }
    }
  }

  const handleApprove = async (approvalData: {
    signature: string
    name: string
    email: string
    termsAccepted: boolean
  }) => {
    if (!selectedQuote) return

    // Find the documentId from our quotes list
    const portalQuotes = await fetchCustomerQuotes(customerId || '', { limit: 100 })
    const matchingQuote = portalQuotes.find(q => q.id === selectedQuote.id)
    
    if (!matchingQuote?.documentId) {
      throw new Error('Quote not found')
    }

    const result = await approveQuote(matchingQuote.documentId, approvalData)
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to approve quote')
    }

    // Refresh the quotes list
    await loadQuotes()
    
    // Close the dialog
    setIsApprovalOpen(false)
    setSelectedQuote(null)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading quotes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button 
            onClick={loadQuotes}
            className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <QuoteList 
        quotes={quotes}
        onViewQuote={handleViewQuote}
      />
      
      <QuoteApproval
        quote={selectedQuote}
        isOpen={isApprovalOpen}
        onClose={() => {
          setIsApprovalOpen(false)
          setSelectedQuote(null)
        }}
        onApprove={handleApprove}
      />
    </div>
  )
}
