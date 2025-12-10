import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color?: 'primary' | 'cyan' | 'magenta' | 'yellow'
}

export function StatCard({ title, value, change, icon, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    cyan: 'bg-cyan/10 text-cyan',
    magenta: 'bg-magenta/10 text-magenta',
    yellow: 'bg-yellow/10 text-yellow'
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2 tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ArrowUp size={16} weight="bold" className="text-green-600" />
              ) : (
                <ArrowDown size={16} weight="bold" className="text-red-600" />
              )}
              <span className={cn(
                "text-sm font-semibold",
                change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", colorClasses[color])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
