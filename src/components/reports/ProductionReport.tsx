import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, Export, Clock, CheckCircle, Timer } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer 
} from "recharts"
import { 
  getProductionReport, 
  exportToCSV, 
  type ProductionReportData 
} from "@/lib/reports-api"

interface ProductionReportProps {
  dateFrom: string
  dateTo: string
}

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

const STATUS_COLORS: Record<string, string> = {
  'QUOTE': '#f59e0b',
  'QUOTE_SENT': '#eab308',
  'PENDING': '#3b82f6',
  'IN_PRODUCTION': '#8b5cf6',
  'READY_TO_SHIP': '#06b6d4',
  'SHIPPED': '#10b981',
  'DELIVERED': '#22c55e',
  'COMPLETED': '#22c55e',
  'INVOICE PAID': '#16a34a',
  'INVOICE_PAID': '#16a34a',
  'CANCELLED': '#ef4444',
}

export function ProductionReport({ dateFrom, dateTo }: ProductionReportProps) {
  const [data, setData] = useState<ProductionReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const report = await getProductionReport(dateFrom, dateTo)
        setData(report)
      } catch (error) {
        console.error('Failed to fetch production report:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [dateFrom, dateTo])

  const handleExport = () => {
    if (!data) return
    
    // Export jobs by status
    exportToCSV(data.jobsByStatus, `production-jobs-by-status-${dateFrom}-to-${dateTo}`)
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
        <p className="text-muted-foreground text-center">Failed to load production report</p>
      </Card>
    )
  }

  const chartConfig = {
    count: {
      label: "Jobs",
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
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={20} className="text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">Jobs Completed</p>
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.jobsCompleted}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.jobsCompletedChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.jobsCompletedChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.jobsCompletedChange)}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={20} className="text-blue-600" />
                <p className="text-sm font-medium text-muted-foreground">Avg Turnaround</p>
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.averageTurnaroundDays} days
              </p>
              <div className="flex items-center gap-1 mt-2">
                {/* Turnaround change is inverted at API level - positive = improvement (faster) */}
                {data.turnaroundChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.turnaroundChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.turnaroundChange)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {data.turnaroundChange >= 0 ? 'faster' : 'slower'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Timer size={20} className="text-purple-600" />
                <p className="text-sm font-medium text-muted-foreground">On-Time Delivery</p>
              </div>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.onTimeDeliveryRate}%
              </p>
              <div className="flex items-center gap-1 mt-2">
                {data.onTimeDeliveryChange >= 0 ? (
                  <ArrowUp size={16} weight="bold" className="text-green-600" />
                ) : (
                  <ArrowDown size={16} weight="bold" className="text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-semibold",
                  data.onTimeDeliveryChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(data.onTimeDeliveryChange)}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs by Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.jobsByStatus.length > 0 ? (
              <figure aria-label="Jobs by status bar chart">
                <ChartContainer config={chartConfig} className="h-64">
                  <BarChart data={data.jobsByStatus} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" className="text-xs" />
                    <YAxis 
                      type="category" 
                      dataKey="status" 
                      width={100}
                      className="text-xs"
                      tickFormatter={(value) => value.replace(/_/g, ' ')}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="count" 
                      radius={[0, 4, 4, 0]}
                    >
                      {data.jobsByStatus.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.status] || CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </figure>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No job data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Production by Method Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Production by Method</CardTitle>
          </CardHeader>
          <CardContent>
            {data.productionByMethod.length > 0 ? (
              <figure aria-label="Production by method pie chart">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.productionByMethod}
                        dataKey="count"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ method, percentage }) => `${method}: ${percentage}%`}
                        labelLine={false}
                      >
                        {data.productionByMethod.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </figure>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No method data for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Production Method Details */}
      <Card>
        <CardHeader>
          <CardTitle>Production Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {data.productionByMethod.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.productionByMethod.map((method, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="font-medium">{method.method}</span>
                  </div>
                  <p className="text-2xl font-bold">{method.count}</p>
                  <p className="text-sm text-muted-foreground">{method.percentage}% of total</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No production data for this period</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
