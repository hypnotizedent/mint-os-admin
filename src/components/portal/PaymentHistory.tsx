import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, ArrowCounterClockwise } from "@phosphor-icons/react"
import type { Payment, PaymentStatus } from "@/lib/types"

interface PaymentHistoryProps {
  payments: Payment[]
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={20} weight="fill" className="text-green-500" />
      case 'Pending':
        return <Clock size={20} weight="fill" className="text-yellow-500" />
      case 'Failed':
        return <XCircle size={20} weight="fill" className="text-red-500" />
      case 'Refunded':
        return <ArrowCounterClockwise size={20} weight="fill" className="text-blue-500" />
      default:
        return <Clock size={20} weight="fill" className="text-gray-500" />
    }
  }

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'Failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'Refunded':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
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
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Payment History</h2>
        <p className="text-muted-foreground mt-1">View all your payment transactions</p>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payment history yet</p>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {formatCurrency(payment.amount)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payment.date)} | {payment.paymentMethod}
                    </p>
                    {payment.transactionId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Transaction ID: {payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {payments.length > 0 && (
        <Card className="p-6 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-foreground">{payments.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Total Paid
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(
                  payments
                    .filter((p) => p.status === 'Completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Completed
              </p>
              <p className="text-2xl font-bold text-green-500">
                {payments.filter((p) => p.status === 'Completed').length}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
