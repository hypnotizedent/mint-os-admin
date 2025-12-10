/**
 * PaymentHistory Component
 * Displays a list of payments for an order with running balance
 */
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import {
  CurrencyDollar,
  CaretDown,
  CaretUp,
  Receipt,
  Check,
  Clock,
  X,
  ArrowCounterClockwise,
} from "@phosphor-icons/react"
import { getPayments } from "@/lib/api/payments"
import type { OrderPayment, PaymentMethodEnum, PaymentStatusEnum } from "@/lib/types"

interface PaymentHistoryProps {
  orderDocumentId: string
  totalAmount: number
  refreshTrigger?: number
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodEnum, string> = {
  cash: "Cash",
  check: "Check",
  credit_card: "Credit Card",
  ach: "ACH",
  stripe: "Stripe",
  bank_transfer: "Bank Transfer",
  other: "Other",
}

const STATUS_CONFIG: Record<
  PaymentStatusEnum,
  { label: string; color: string; icon: React.ReactNode }
> = {
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <Check size={12} weight="bold" />,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: <Clock size={12} weight="bold" />,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: <Clock size={12} weight="bold" />,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <X size={12} weight="bold" />,
  },
  refunded: {
    label: "Refunded",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: <ArrowCounterClockwise size={12} weight="bold" />,
  },
  expired: {
    label: "Expired",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: <Clock size={12} weight="bold" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: <X size={12} weight="bold" />,
  },
}

export function PaymentHistory({
  orderDocumentId,
  totalAmount,
  refreshTrigger,
}: PaymentHistoryProps) {
  const [payments, setPayments] = useState<OrderPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true)
      const data = await getPayments(orderDocumentId)
      setPayments(data)
      setIsLoading(false)
    }

    if (orderDocumentId) {
      fetchPayments()
    }
  }, [orderDocumentId, refreshTrigger])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Calculate running balance for each payment
  // Payments are sorted newest first from API, so we process oldest first for balance calc
  const calculatePaymentsWithBalance = () => {
    // Sort payments by date (oldest first) for balance calculation
    const chronologicalPayments = [...payments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    
    let runningBalance = totalAmount
    const withBalances = chronologicalPayments.map(payment => {
      if (payment.status === "paid") {
        runningBalance = Math.max(0, runningBalance - payment.amount)
      }
      return { ...payment, runningBalance }
    })
    
    // Sort back to newest first for display
    return withBalances.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
  
  const sortedPayments = calculatePaymentsWithBalance()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt size={18} />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <CurrencyDollar size={32} className="mx-auto mb-2 opacity-50" />
            <p>No payments recorded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
            >
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt size={18} />
                Payment History ({payments.length})
              </CardTitle>
              {isOpen ? (
                <CaretUp size={18} className="text-muted-foreground" />
              ) : (
                <CaretDown size={18} className="text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {sortedPayments.map((payment) => {
                const statusConfig = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending

                return (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(payment.amount)}
                          </span>
                          <Badge className={statusConfig.color} variant="secondary">
                            <span className="flex items-center gap-1">
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {PAYMENT_METHOD_LABELS[payment.paymentMethod as PaymentMethodEnum] ||
                            payment.paymentMethod}
                          {payment.referenceNumber && (
                            <span className="ml-2">
                              • Ref: {payment.referenceNumber}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatDate(payment.paymentDate || payment.createdAt)}
                        </p>
                        {payment.recordedBy && (
                          <p className="text-xs text-muted-foreground">
                            by {payment.recordedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    {payment.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {payment.notes}
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Balance after: {formatCurrency(payment.runningBalance)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
