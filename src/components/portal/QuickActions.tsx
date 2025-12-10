import { useNavigate } from "react-router-dom"
import { Receipt, ArrowsClockwise, Package } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    {
      icon: Receipt,
      label: "Request New Quote",
      description: "Get a quote for your project",
      onClick: () => navigate("/portal/quotes/request"),
      variant: "default" as const
    },
    {
      icon: ArrowsClockwise,
      label: "Reorder",
      description: "Reorder a previous order",
      onClick: () => navigate("/portal/orders/history"),
      variant: "outline" as const
    },
    {
      icon: Package,
      label: "Track Orders",
      description: "Check order status",
      onClick: () => navigate("/portal/orders/track"),
      variant: "outline" as const
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Commonly used features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant={action.variant}
                className="h-auto flex-col gap-2 py-4"
                onClick={action.onClick}
              >
                <Icon size={24} weight="bold" />
                <div className="text-center">
                  <div className="font-semibold text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
