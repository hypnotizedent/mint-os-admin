/**
 * ProfitAnalyticsDashboard Component
 * Overview with charts showing profit trends and analysis
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  TrendUp, 
  TrendDown, 
  CurrencyDollar, 
  ChartLine, 
  ChartPie,
  Warning,
  Trophy,
  CalendarBlank,
  Export
} from "@phosphor-icons/react"
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
  BarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  Legend 
} from "recharts"

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type DatePeriod = 'week' | 'month' | 'quarter' | 'year'

interface ProfitOverview {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  averageProfitMargin: number
  jobCount: number
  profitableJobs: number
  unprofitableJobs: number
  profitTrend: { period: string; profit: number; margin: number }[]
}

interface ProductProfit {
  productType: string
  revenue: number
  cost: number
  profit: number
  profitMargin: number
  jobCount: number
}

interface DepartmentProfit {
  department: string
  revenue: number
  cost: number
  profit: number
  profitMargin: number
  jobCount: number
  laborCost: number
}

interface JobProfitSummary {
  jobId: string
  jobNumber: string
  customerName: string
  revenue: number
  totalCost: number
  profit: number
  profitMargin: number
  completedAt?: string
}

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export function ProfitAnalyticsDashboard() {
  const [period, setPeriod] = useState<DatePeriod>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [overview, setOverview] = useState<ProfitOverview | null>(null)
  const [productProfits, setProductProfits] = useState<ProductProfit[]>([])
  const [departmentProfits, setDepartmentProfits] = useState<DepartmentProfit[]>([])
  const [lossLeaders, setLossLeaders] = useState<JobProfitSummary[]>([])
  const [mostProfitable, setMostProfitable] = useState<JobProfitSummary[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate date range based on period
  // Load all data
  useEffect(() => {
    const getDateRange = () => {
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }
      
      return {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      }
    }

    async function loadData() {
      setIsLoading(true)
      const { start_date, end_date } = getDateRange()
      
      try {
        const [overviewRes, productsRes, deptsRes, lossRes, profitableRes] = await Promise.all([
          fetch(`${API_BASE}/api/analytics/profit/overview?start_date=${start_date}&end_date=${end_date}&period=${period}`),
          fetch(`${API_BASE}/api/analytics/profit/by-product?start_date=${start_date}&end_date=${end_date}`),
          fetch(`${API_BASE}/api/analytics/profit/by-department?start_date=${start_date}&end_date=${end_date}`),
          fetch(`${API_BASE}/api/analytics/profit/loss-leaders?start_date=${start_date}&end_date=${end_date}&limit=10`),
          fetch(`${API_BASE}/api/analytics/profit/most-profitable?start_date=${start_date}&end_date=${end_date}&limit=10`)
        ])

        if (overviewRes.ok) setOverview(await overviewRes.json())
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProductProfits(data.products || [])
        }
        if (deptsRes.ok) {
          const data = await deptsRes.json()
          setDepartmentProfits(data.departments || [])
        }
        if (lossRes.ok) {
          const data = await lossRes.json()
          setLossLeaders(data.lossLeaders || [])
        }
        if (profitableRes.ok) {
          const data = await profitableRes.json()
          setMostProfitable(data.mostProfitable || [])
        }
      } catch (error) {
        console.error('Failed to load profit analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [period])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600 bg-green-100'
    if (margin >= 15) return 'text-yellow-600 bg-yellow-100'
    if (margin >= 0) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const chartConfig = {
    profit: { label: "Profit", color: "hsl(var(--primary))" },
    margin: { label: "Margin", color: "#22c55e" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Profit Analytics</h1>
          <p className="text-muted-foreground mt-1">Track profitability across jobs, products, and departments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarBlank size={20} className="text-muted-foreground" />
            <Select value={period} onValueChange={(value: DatePeriod) => setPeriod(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2">
            <Export size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(overview?.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollar size={24} weight="fill" className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
              <p className={cn(
                "text-3xl font-bold mt-1",
                (overview?.totalProfit || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(overview?.totalProfit || 0)}
              </p>
            </div>
            <div className={cn(
              "p-2 rounded-lg",
              (overview?.totalProfit || 0) >= 0 ? "bg-green-100" : "bg-red-100"
            )}>
              {(overview?.totalProfit || 0) >= 0 
                ? <TrendUp size={24} weight="bold" className="text-green-600" />
                : <TrendDown size={24} weight="bold" className="text-red-600" />
              }
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Profit Margin</p>
              <p className={cn(
                "text-3xl font-bold mt-1",
                (overview?.averageProfitMargin || 0) >= 20 ? "text-green-600" :
                (overview?.averageProfitMargin || 0) >= 10 ? "text-yellow-600" : "text-red-600"
              )}>
                {formatPercent(overview?.averageProfitMargin || 0)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartLine size={24} weight="fill" className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jobs Analyzed</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {overview?.jobCount || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{overview?.profitableJobs || 0} profitable</span>
                {' / '}
                <span className="text-red-600">{overview?.unprofitableJobs || 0} unprofitable</span>
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartPie size={24} weight="fill" className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <ChartLine size={16} />
            Trends
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <ChartPie size={16} />
            By Product
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <ChartPie size={16} />
            By Department
          </TabsTrigger>
          <TabsTrigger value="loss-leaders" className="gap-2">
            <Warning size={16} />
            Loss Leaders
          </TabsTrigger>
          <TabsTrigger value="top-performers" className="gap-2">
            <Trophy size={16} />
            Top Performers
          </TabsTrigger>
        </TabsList>

        {/* Profit Trend */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit Trend</CardTitle>
              <CardDescription>Profit over time with margin tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {overview?.profitTrend && overview.profitTrend.length > 0 ? (
                <figure aria-label="Profit trend line chart">
                  <ChartContainer config={chartConfig} className="h-80">
                    <LineChart data={[...overview.profitTrend].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="period" 
                        tickFormatter={(value) => {
                          try {
                            const date = new Date(value)
                            if (isNaN(date.getTime())) return String(value)
                            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
                          } catch {
                            return String(value)
                          }
                        }}
                        className="text-xs"
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        className="text-xs"
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value}%`}
                        className="text-xs"
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />} 
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="profit" 
                        name="Profit"
                        stroke="var(--color-profit)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="margin" 
                        name="Margin %"
                        stroke="var(--color-margin)" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </figure>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No profit trend data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit by Product */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit by Product Type</CardTitle>
                <CardDescription>Revenue and profit distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {productProfits.length > 0 ? (
                  <figure aria-label="Profit by product pie chart">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={productProfits.filter(p => p.profit > 0)}
                            dataKey="profit"
                            nameKey="productType"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ productType, profitMargin }) => 
                              `${productType}: ${profitMargin.toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {productProfits.map((_, index) => (
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
                    No product profit data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {productProfits.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Type</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                        <TableHead className="text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productProfits.map((product, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{product.productType}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                          <TableCell className={cn(
                            "text-right font-semibold",
                            product.profit >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatCurrency(product.profit)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "px-2 py-1 rounded text-sm font-medium",
                              getProfitMarginColor(product.profitMargin)
                            )}>
                              {formatPercent(product.profitMargin)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No product data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profit by Department */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Profit and labor cost breakdown by department</CardDescription>
            </CardHeader>
            <CardContent>
              {departmentProfits.length > 0 ? (
                <figure aria-label="Department profit bar chart">
                  <ChartContainer config={chartConfig} className="h-80">
                    <BarChart data={departmentProfits} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="department" width={120} />
                      <ChartTooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                      <Bar dataKey="profit" name="Profit" fill="#22c55e" />
                      <Bar dataKey="laborCost" name="Labor Cost" fill="#f59e0b" />
                    </BarChart>
                  </ChartContainer>
                </figure>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No department data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Details</CardTitle>
            </CardHeader>
            <CardContent>
              {departmentProfits.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Labor</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                      <TableHead className="text-right">Jobs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentProfits.map((dept, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium capitalize">{dept.department.replace('-', ' ')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.cost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dept.laborCost)}</TableCell>
                        <TableCell className={cn(
                          "text-right font-semibold",
                          dept.profit >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(dept.profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "px-2 py-1 rounded text-sm font-medium",
                            getProfitMarginColor(dept.profitMargin)
                          )}>
                            {formatPercent(dept.profitMargin)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{dept.jobCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No department data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loss Leaders */}
        <TabsContent value="loss-leaders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warning size={24} weight="fill" className="text-red-600" />
                Loss Leaders
              </CardTitle>
              <CardDescription>Jobs with negative profit that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              {lossLeaders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Loss</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lossLeaders.map((job, idx) => (
                      <TableRow key={idx} className="bg-red-50/50">
                        <TableCell className="font-medium">{job.jobNumber}</TableCell>
                        <TableCell>{job.customerName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(job.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(job.totalCost)}</TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {formatCurrency(job.profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800">
                            {formatPercent(job.profitMargin)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Trophy size={48} weight="fill" className="mx-auto text-green-600 mb-4" />
                  <p className="text-lg font-medium text-green-600">No loss leaders found!</p>
                  <p className="text-muted-foreground">All jobs are profitable for this period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers */}
        <TabsContent value="top-performers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy size={24} weight="fill" className="text-yellow-600" />
                Most Profitable Jobs
              </CardTitle>
              <CardDescription>Top performing jobs by profit</CardDescription>
            </CardHeader>
            <CardContent>
              {mostProfitable.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Job #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mostProfitable.map((job, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {idx < 3 ? (
                            <span className={cn(
                              "inline-flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-sm",
                              idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-gray-400" : "bg-amber-700"
                            )}>
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{idx + 1}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{job.jobNumber}</TableCell>
                        <TableCell>{job.customerName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(job.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(job.totalCost)}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(job.profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "px-2 py-1 rounded text-sm font-medium",
                            getProfitMarginColor(job.profitMargin)
                          )}>
                            {formatPercent(job.profitMargin)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Warning size={48} weight="fill" className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No profitable jobs found for this period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfitAnalyticsDashboard
