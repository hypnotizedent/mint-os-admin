import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Printer, CheckCircle, Warning, XCircle, Wrench, Clock } from "@phosphor-icons/react"
import type { Machine } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MachinesPageProps {
  machines: Machine[]
}

export function MachinesPage({ machines }: MachinesPageProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printing':
        return <Printer size={24} weight="fill" className="text-cyan" />
      case 'idle':
        return <CheckCircle size={24} weight="fill" className="text-green-600" />
      case 'maintenance':
        return <Wrench size={24} weight="fill" className="text-yellow" />
      case 'error':
        return <XCircle size={24} weight="fill" className="text-destructive" />
      default:
        return <Printer size={24} className="text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      printing: 'bg-cyan text-white',
      idle: 'bg-green-600 text-white',
      maintenance: 'bg-yellow text-foreground',
      error: 'bg-destructive text-destructive-foreground',
      offline: 'bg-muted text-muted-foreground'
    }
    return styles[status as keyof typeof styles] || styles.offline
  }

  const onlineMachines = machines.filter(m => m.status !== 'offline').length
  const activeMachines = machines.filter(m => m.status === 'printing').length
  const avgUtilization = Math.round(machines.reduce((acc, m) => acc + m.utilization, 0) / machines.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Machines</h1>
          <p className="text-muted-foreground mt-1">Monitor and control your printing equipment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Online</p>
              <p className="text-3xl font-bold text-foreground mt-2">{onlineMachines}/{machines.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-600/10">
              <CheckCircle size={24} weight="fill" className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Active</p>
              <p className="text-3xl font-bold text-foreground mt-2">{activeMachines}</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan/10">
              <Printer size={24} weight="fill" className="text-cyan" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Avg Utilization</p>
              <p className="text-3xl font-bold text-foreground mt-2">{avgUtilization}%</p>
            </div>
            <div className="p-3 rounded-lg bg-magenta/10">
              <Clock size={24} weight="fill" className="text-magenta" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Card key={machine.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(machine.status)}
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{machine.name}</h3>
                    <p className="text-sm text-muted-foreground">{machine.type}</p>
                  </div>
                </div>
                <Badge className={getStatusBadge(machine.status)}>
                  {machine.status}
                </Badge>
              </div>

              {machine.currentJob && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">CURRENT JOB</p>
                  <p className="text-sm font-semibold text-foreground">{machine.currentJob}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-semibold text-foreground">{machine.utilization}%</span>
                </div>
                <Progress value={machine.utilization} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Jobs</p>
                  <p className="text-lg font-semibold text-foreground">{machine.totalJobs}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Uptime</p>
                  <p className="text-lg font-semibold text-foreground">{machine.uptime}%</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last Maintenance</span>
                  <span className="font-medium text-foreground">{new Date(machine.lastMaintenance).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Next Maintenance</span>
                  <span className="font-medium text-foreground">{new Date(machine.nextMaintenance).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                {machine.status === 'idle' && (
                  <Button size="sm" className="flex-1">
                    Assign Job
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
