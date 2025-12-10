import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DownloadSimple,
  FileText,
  Image as ImageIcon,
} from "@phosphor-icons/react"
import type { Quote, QuoteStatus } from "@/lib/types"

interface QuoteDetailProps {
  quote: Quote | null
  isOpen: boolean
  onClose: () => void
  onApprove?: () => void
  onReject?: () => void
  onRequestChanges?: () => void
  onConvertToOrder?: () => void
  onDownloadPDF?: () => void
}

export function QuoteDetail({ 
  quote, 
  isOpen, 
  onClose,
  onApprove,
  onReject,
  onRequestChanges,
  onConvertToOrder,
  onDownloadPDF,
}: QuoteDetailProps) {
  if (!quote) return null

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quote {quote.quoteNumber}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(quote.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(quote.status)}
                  {quote.status}
                </span>
              </Badge>
              {quote.status === 'Pending' && (
                <span className="text-sm text-muted-foreground">
                  Expires: {formatDate(quote.expiresAt)} ({calculateDaysUntilExpiration(quote.expiresAt)} days)
                </span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Line Items */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Items</h3>
            <Separator />
            {quote.lineItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {item.quantity}x {item.productName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      {item.printLocations.map((location, idx) => (
                        <span key={idx}>
                          {location} ({item.colors} colors)
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Unit: ${item.unitPrice.toFixed(2)}
                    </p>
                    <p className="font-semibold text-foreground">
                      ${item.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Pricing</h3>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">${quote.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Setup Fee:</span>
                <span className="text-foreground">${quote.setupFees.toFixed(2)}</span>
              </div>
              {quote.rushFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rush Fee:</span>
                  <span className="text-foreground">${quote.rushFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="text-foreground">${quote.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-foreground">
                  ${quote.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Artwork Preview */}
          {quote.artworkFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Artwork Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quote.artworkFiles.map((file) => (
                  <Card key={file.id} className="p-3">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={32} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center truncate w-full">
                        {file.name}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Proof */}
          {quote.proofFile && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Proof</h3>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {quote.proofFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      View approval proof
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Notes */}
          {quote.notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Notes from Sales</h3>
              <Card className="p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            {onDownloadPDF && (
              <Button variant="outline" onClick={onDownloadPDF}>
                <DownloadSimple size={18} className="mr-2" />
                Download PDF
              </Button>
            )}
            
            {quote.status === 'Pending' && (
              <>
                {onReject && (
                  <Button variant="outline" onClick={onReject}>
                    Reject Quote
                  </Button>
                )}
                {onRequestChanges && (
                  <Button variant="outline" onClick={onRequestChanges}>
                    Request Changes
                  </Button>
                )}
                {onApprove && (
                  <Button onClick={onApprove}>
                    Approve Quote
                  </Button>
                )}
              </>
            )}

            {quote.status === 'Approved' && onConvertToOrder && (
              <Button onClick={onConvertToOrder}>
                Convert to Order
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
