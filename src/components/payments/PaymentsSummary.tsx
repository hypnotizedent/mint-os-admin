/**
 * PaymentsSummary Dashboard Widget
 * Shows outstanding payments summary and quick links
 */
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CurrencyDollar,
  Warning,
  ArrowRight,
  CalendarBlank,
  TrendUp,
} from "@phosphor-icons/react"
import { getPaymentsSummary } from "@/lib/api/payments"
import type { PaymentsDashboardSummary } from "@/lib/types"

interface PaymentsSummaryProps {
  onViewOrder?: (orderDocumentId: string) => void
  onViewAllPayments?: () => void
}

export function PaymentsSummary({
  onViewOrder,
  onViewAllPayments,
}: PaymentsSummaryProps) {
  const [summary, setSummary] = useState<PaymentsDashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true)
      const data = await getPaymentsSummary()
      setSummary(data)
      setIsLoading(false)
    }

    fetchSummary()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false
    const dueDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CurrencyDollar size={20} weight="fill" className="text-green-600" />
            Payments Overview
          </CardTitle>
          {onViewAllPayments && (
            <Button variant="ghost" size="sm" onClick={onViewAllPayments}>
              View All
              <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Outstanding Total */}
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
            <p className="text-xl font-bold text-orange-600">
              {formatCurrency(summary.totalOutstanding)}
            </p>
            {summary.overdueCount > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Warning size={12} className="text-destructive" />
                <span className="text-xs text-destructive">
                  {summary.overdueCount} overdue
                </span>
              </div>
            )}
          </div>

          {/* Payments This Month */}
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-1">This Month</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(summary.paymentsThisMonth)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendUp size={12} className="text-green-600" />
              <span className="text-xs text-muted-foreground">
                {formatCurrency(summary.paymentsThisWeek)} this week
              </span>
            </div>
          </div>
        </div>

        {/* Outstanding Orders List */}
        {summary.outstandingOrders.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Top Outstanding Orders
            </h4>
            <div className="space-y-2">
              {summary.outstandingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onViewOrder?.(order.documentId)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        #{order.orderNumber}
                      </span>
                      {isOverdue(order.dueDate) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(order.amountOutstanding)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarBlank size={10} />
                      {formatDate(order.dueDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.outstandingOrders.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <CurrencyDollar size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">All orders paid!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
