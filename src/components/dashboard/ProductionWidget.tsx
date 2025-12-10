import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Gear, CheckCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { getDashboardStats, type DashboardStatsData } from "@/lib/reports-api"

interface ProductionWidgetProps {
  className?: string
}

export function ProductionWidget({ className }: ProductionWidgetProps) {
  const [data, setData] = useState<DashboardStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const stats = await getDashboardStats()
        setData(stats)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32" />
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-muted-foreground text-sm">Unable to load production data</p>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6 hover:shadow-lg transition-shadow", className)}>
      <div className="space-y-4">
        {/* Jobs in Production */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-600/10">
                <Gear size={20} weight="fill" className="text-purple-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">In Production</p>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {data.jobsInProduction}
            </p>
            <p className="text-xs text-muted-foreground mt-1">active jobs</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Completed Today */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} weight="fill" className="text-green-600" />
            <span className="text-sm text-muted-foreground">Completed today</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{data.completedToday}</span>
        </div>
      </div>
    </Card>
  )
}
