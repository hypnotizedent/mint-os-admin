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
import { ArrowUp, ArrowDown, Export, UserPlus, UsersThree, Repeat } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { 
  getCustomerReport, 
  exportToCSV, 
  type CustomerReportData 
} from "@/lib/reports-api"

interface CustomerReportProps {
  dateFrom: string
  dateTo: string
}

export function CustomerReport({ dateFrom, dateTo }: CustomerReportProps) {
  const [data, setData] = useState<CustomerReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const report = await getCustomerReport(dateFrom, dateTo)
        setData(report)
      } catch (error) {
        console.error('Failed to fetch customer report:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [dateFrom, dateTo])

  const handleExport = () => {
    if (!data) return
    
    // Export top customers by revenue
    exportToCSV(data.topCustomersByRevenue, `customers-by-revenue-${dateFrom}-to-${dateTo}`)
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">Failed to load customer report</p>
      </Card>
    )
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={20} className="text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">New Customers</p>
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.newCustomers}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.newCustomersChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.newCustomersChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.newCustomersChange)}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <UsersThree size={20} className="text-blue-600" />
                <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.customerRetentionRate}%
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.retentionChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.retentionChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.retentionChange)}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Repeat size={20} className="text-purple-600" />
                <p className="text-sm font-medium text-muted-foreground">Repeat Order Rate</p>
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.repeatOrderRate}%
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.repeatOrderChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.repeatOrderChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.repeatOrderChange)}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg Lifetime Value</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(data.averageLifetimeValue)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Average revenue per customer
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Metrics Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <UserPlus size={24} className="text-green-600 shrink-0" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">New Customers</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Customers who placed their first order during this period
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <UsersThree size={24} className="text-blue-600 shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Retention Rate</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Percentage of previous period customers who ordered again
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <Repeat size={24} className="text-purple-600 shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100">Repeat Order Rate</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Percentage of customers with multiple orders this period
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topCustomersByRevenue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomersByRevenue.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.company || '-'}
                    </TableCell>
                    <TableCell className="text-right">{customer.orderCount}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.revenue)}
                    </TableCell>
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
