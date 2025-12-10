import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, Export } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer 
} from "recharts"
import { 
  getSalesReport, 
  exportToCSV, 
  type SalesReportData 
} from "@/lib/reports-api"

interface SalesReportProps {
  dateFrom: string
  dateTo: string
}

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export function SalesReport({ dateFrom, dateTo }: SalesReportProps) {
  const [data, setData] = useState<SalesReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const report = await getSalesReport(dateFrom, dateTo)
        setData(report)
      } catch (error) {
        console.error('Failed to fetch sales report:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [dateFrom, dateTo])

  const handleExport = () => {
    if (!data) return
    
    // Export top customers
    exportToCSV(data.topCustomers, `sales-top-customers-${dateFrom}-to-${dateTo}`)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">Failed to load sales report</p>
      </Card>
    )
  }

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Export size={16} />
          Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(data.totalRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.revenueChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.revenueChange)}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Order Count</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.orderCount}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.orderCountChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.orderCountChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.orderCountChange)}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(data.averageOrderValue)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.averageOrderValueChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.averageOrderValueChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.averageOrderValueChange)}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenueByPeriod.length > 0 ? (
              <figure aria-label="Revenue over time line chart">
                <ChartContainer config={chartConfig} className="h-64">
                  <LineChart data={data.revenueByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                      className="text-xs"
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      className="text-xs"
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => formatCurrency(Number(value))}
                      />} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-revenue)" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </figure>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No revenue data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.salesByCategory.length > 0 ? (
              <figure aria-label="Sales by category pie chart">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.salesByCategory}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                        labelLine={false}
                      >
                        {data.salesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </figure>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No category data for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomers.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-right">{customer.orderCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(customer.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No customer data for this period</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
