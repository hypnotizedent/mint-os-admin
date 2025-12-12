import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, CurrencyDollar, Gear, CalendarBlank } from "@phosphor-icons/react"
import { SalesReport } from "./SalesReport"
import { ProductionReport } from "./ProductionReport"
import { CustomerReport } from "./CustomerReport"
import { getDateRange } from "@/lib/reports-api"
import { StandardPageLayout } from "@/components/shared/StandardPageLayout"

type DatePeriod = 'week' | 'month' | 'quarter' | 'year'

export function ReportsPage() {
  const [period, setPeriod] = useState<DatePeriod>('month')
  const [activeTab, setActiveTab] = useState('sales')

  const dateRange = getDateRange(period)

  const reportCards = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Revenue, orders, and top customers',
      icon: CurrencyDollar,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      id: 'production',
      title: 'Production Report',
      description: 'Jobs, turnaround, and delivery metrics',
      icon: Gear,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      id: 'customers',
      title: 'Customer Report',
      description: 'Acquisition, retention, and lifetime value',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
    },
  ]

  return (
    <StandardPageLayout
      title="Reports"
      subtitle="Analytics and insights for your print shop"
      actions={
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
      }
    >
      {/* Date Range Display */}
      <div className="text-sm text-muted-foreground mb-6">
        Showing data from <span className="font-medium text-foreground">{dateRange.dateFrom}</span> to <span className="font-medium text-foreground">{dateRange.dateTo}</span>
      </div>

      {/* Report Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {reportCards.map((report) => (
          <Card 
            key={report.id}
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === report.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab(report.id)}
            role="button"
            tabIndex={0}
            aria-pressed={activeTab === report.id}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveTab(report.id);
              }
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${report.bgColor}`}>
                  <report.icon size={24} weight="fill" className={report.color} />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Report Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="sales" className="gap-2">
            <CurrencyDollar size={16} />
            Sales
          </TabsTrigger>
          <TabsTrigger value="production" className="gap-2">
            <Gear size={16} />
            Production
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users size={16} />
            Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesReport dateFrom={dateRange.dateFrom} dateTo={dateRange.dateTo} />
        </TabsContent>

        <TabsContent value="production">
          <ProductionReport dateFrom={dateRange.dateFrom} dateTo={dateRange.dateTo} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerReport dateFrom={dateRange.dateFrom} dateTo={dateRange.dateTo} />
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  )
}
