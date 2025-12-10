import { useNavigate } from "react-router-dom"
import { ArrowRight, Package } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CustomerOrder } from "@/lib/types"

interface RecentOrdersProps {
  orders: CustomerOrder[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': 'bg-green-500 text-white',
      'in-production': 'bg-blue-500 text-white',
      'shipped': 'bg-cyan-500 text-white',
      'delivered': 'bg-green-600 text-white',
      'cancelled': 'bg-red-500 text-white'
    }
    return colors[status as keyof typeof colors] || 'bg-muted text-foreground'
  }

  const formatStatus = (status: string) => {
    return status.split(/[-_]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your last 5 orders</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/portal/orders/history")}
            className="gap-2"
          >
            View All
            <ArrowRight size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No orders yet</p>
            <Button
              variant="link"
              onClick={() => navigate("/portal/quotes/request")}
              className="mt-2"
            >
              Request a quote to get started
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/portal/orders/${order.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">
                      Order #{order.orderNumber}
                    </span>
                    <Badge className={cn("text-xs", getStatusColor(order.status))}>
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{formatDate(order.date)}</span>
                    <span>•</span>
                    <span>{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-foreground">
                    ${order.total.toLocaleString()}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Track: {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
