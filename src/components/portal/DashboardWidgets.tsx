import { Package, Receipt, Printer, CurrencyDollar } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CustomerDashboardStats } from "@/lib/types"

interface DashboardWidgetsProps {
  stats: CustomerDashboardStats
}

export function DashboardWidgets({ stats }: DashboardWidgetsProps) {
  const widgets = [
    {
      title: "Orders This Month",
      value: stats.ordersThisMonth,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Pending Quotes",
      value: stats.pendingQuotes,
      suffix: stats.pendingQuotes > 0 ? "Awaiting" : "None",
      icon: Receipt,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      suffix: stats.activeJobs > 0 ? "In Production" : "None",
      icon: Printer,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      title: "Total Spent YTD",
      value: `$${stats.totalSpentYTD.toLocaleString()}`,
      icon: CurrencyDollar,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget) => {
        const Icon = widget.icon
        return (
          <Card key={widget.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {widget.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${widget.bgColor}`}>
                <Icon className={widget.color} size={20} weight="fill" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {widget.value}
              </div>
              {widget.suffix && (
                <p className="text-xs text-muted-foreground mt-1">
                  {widget.suffix}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
