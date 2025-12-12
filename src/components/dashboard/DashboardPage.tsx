/**
 * DashboardPage - Owner Portal Dashboard
 * Modern Vercel/Linear inspired design with cards and charts
 */

import { useState } from "react"
import { motion } from "framer-motion"
import { StatCard } from "./StatCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  CheckCircle2, 
  DollarSign, 
  Printer, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Info, 
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MoreHorizontal,
  Users,
  Calendar,
  Zap
} from "lucide-react"
import { PaymentsSummary } from "@/components/payments"
import type { DashboardStats, Job, Machine, MachineStatus } from "@/lib/types"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}



interface DashboardPageProps {
  stats: DashboardStats
  recentJobs: Job[]
  machines: Machine[]
  onNavigate: (page: string) => void
  onViewOrder?: (orderId: string) => void
}

export function DashboardPage({ stats, recentJobs, machines, onNavigate, onViewOrder }: DashboardPageProps) {
  // State for dismissing low stock alert
  const [showLowStockAlert, setShowLowStockAlert] = useState(true)
  
  // Use real machines data only
  const displayMachines = machines
  const hasNoMachines = machines.length === 0
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      printing: 'bg-blue-500 text-white',
      quote: 'bg-amber-500 text-white',
      design: 'bg-purple-500 text-white',
      prepress: 'bg-violet-500 text-white',
      finishing: 'bg-orange-500 text-white',
      completed: 'bg-green-500 text-white',
      delivery: 'bg-cyan-500 text-white'
    }
    return colors[status] || 'bg-muted text-foreground'
  }

  const getMachineStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      printing: 'text-blue-500',
      idle: 'text-muted-foreground',
      maintenance: 'text-amber-500',
      error: 'text-destructive',
      offline: 'text-muted-foreground'
    }
    return colors[status] || 'text-muted-foreground'
  }

  const getMachineStatusBg = (status: string) => {
    const colors: Record<string, string> = {
      printing: 'bg-blue-500/10',
      idle: 'bg-muted',
      maintenance: 'bg-amber-500/10',
      error: 'bg-destructive/10',
      offline: 'bg-muted'
    }
    return colors[status] || 'bg-muted'
  }

  return (
    <motion.div 
      className="w-full space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button className="gap-2" onClick={() => onNavigate('quotes')}>
          <Plus className="w-4 h-4" />
          New Quote
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: New Quotes (Last 7 Days) */}
        <Card className="bg-card hover:bg-card/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Last 7 days
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stats.newQuotes}</p>
              <p className="text-sm text-muted-foreground">New Quotes</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: In Production */}
        <Card className="bg-card hover:bg-card/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Printer className="w-5 h-5 text-orange-500" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Active jobs
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stats.inProduction}</p>
              <p className="text-sm text-muted-foreground">In Production</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Revenue (MTD) */}
        <Card className="bg-card hover:bg-card/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <Badge variant="secondary" className="text-xs">
                This month
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">${stats.revenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Revenue (MTD)</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Due This Week */}
        <Card className="bg-card hover:bg-card/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <Badge variant={stats.dueThisWeek > 0 ? "destructive" : "secondary"} className="text-xs">
                {stats.dueThisWeek > 0 ? "Action needed" : "All good"}
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stats.dueThisWeek}</p>
              <p className="text-sm text-muted-foreground">Due This Week</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Jobs</CardTitle>
                  <CardDescription className="text-sm">Your latest orders and their status</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => onNavigate('jobs')}>
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {recentJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No recent jobs</p>
                  </div>
                ) : (
                  recentJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                      role="button"
                      tabIndex={0}
                      onClick={() => onViewOrder?.(job.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onViewOrder?.(job.id);
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate text-sm">{job.title}</h3>
                          <Badge className={`${getStatusColor(job.status)} text-xs`}>
                            {job.status}
                          </Badge>
                          {job.priority === 'urgent' && (
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{job.customer}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">{job.quantity} units</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="w-20 hidden md:block">
                        <Progress value={job.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-1 text-center">{job.progress}%</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Machine Status */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Machines</CardTitle>
                  <CardDescription className="text-sm">Equipment status</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onNavigate('machines')}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {hasNoMachines ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Printer className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No machines configured</p>
                  <p className="text-xs mt-1">Add machines to monitor production equipment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayMachines.slice(0, 4).map((machine, index) => (
                  <motion.div 
                    key={machine.id} 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${getMachineStatusBg(machine.status)}`}>
                          <Printer className={`w-4 h-4 ${getMachineStatusColor(machine.status)}`} />
                        </div>
                        <span className="font-medium text-sm">{machine.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {machine.status}
                      </Badge>
                    </div>
                    <Progress value={machine.utilization} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                      <span>{machine.utilization}% util</span>
                      {machine.currentJob && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                  </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payments Summary Widget */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PaymentsSummary onViewOrder={onViewOrder} />
        </div>
      </motion.div>

      {/* Alerts */}
      {stats.lowStockItems > 0 && showLowStockAlert && (
        <motion.div variants={itemVariants}>
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm">Low Stock Alert</h3>
                  <p className="text-xs text-muted-foreground">
                    {stats.lowStockItems} items are below reorder level
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  View Inventory
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setShowLowStockAlert(false)}
                  aria-label="Dismiss low stock alert"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
