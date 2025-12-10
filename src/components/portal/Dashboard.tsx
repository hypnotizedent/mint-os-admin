/**
 * Customer Portal Dashboard
 * Modern design with order tracking, quick actions, and notifications
 */

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  FileText,
  MessageSquare,
  Download,
  RefreshCw,
  AlertTriangle,
  Bell,
  Eye
} from "lucide-react"
import { DashboardWidgets } from "./DashboardWidgets"
import { QuickActions } from "./QuickActions"
import { RecentOrders } from "./RecentOrders"
import { Notifications } from "./Notifications"
import { searchPortal, type SearchResult } from "@/lib/portal-customer-api"
import type { CustomerDashboardStats, CustomerOrder, CustomerNotification, QuoteRequest } from "@/lib/types"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

interface DashboardProps {
  stats: CustomerDashboardStats
  recentOrders: CustomerOrder[]
  notifications: CustomerNotification[]
  pendingQuotes: QuoteRequest[]
  userName?: string
}

export function Dashboard({ 
  stats, 
  recentOrders, 
  notifications,
  pendingQuotes,
  userName = "Customer"
}: DashboardProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [notificationList, setNotificationList] = useState(notifications)

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const response = await searchPortal(query)
      if (response.success && response.data) {
        setSearchResults(response.data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      const result = searchResults[0]
      if (result.type === 'order') {
        navigate(`/portal/orders/${result.id}`)
      } else if (result.type === 'quote') {
        navigate(`/portal/quotes/${result.id}`)
      }
      setSearchQuery("")
      setSearchResults([])
    }
  }

  const handleDismissNotification = (id: string) => {
    setNotificationList(prev => prev.filter(n => n.id !== id))
  }

  const handleMarkAsRead = (id: string) => {
    setNotificationList(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Welcome back, {userName}!
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Here's an overview of your account
            </p>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders, quotes..."
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {/* Search Results Dropdown */}
            {searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                        onClick={() => {
                          if (result.type === 'order') {
                            navigate(`/portal/orders/${result.id}`)
                          } else {
                            navigate(`/portal/quotes/${result.id}`)
                          }
                          setSearchQuery("")
                          setSearchResults([])
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                          <span className="text-sm font-medium">{result.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {result.description}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No results found
                  </div>
                )}
              </div>
            )}
          </form>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Package className="w-4 h-4 text-blue-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
              <p className="text-2xl font-semibold">{stats.activeOrders}</p>
              <p className="text-xs text-muted-foreground">Active Orders</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <Badge variant="secondary" className="text-xs">{pendingQuotes.length}</Badge>
              </div>
              <p className="text-2xl font-semibold">{stats.pendingQuotes}</p>
              <p className="text-xs text-muted-foreground">Pending Quotes</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <Badge variant="secondary" className="text-xs gap-1">
                  <TrendingUp className="w-3 h-3" />
                  12%
                </Badge>
              </div>
              <p className="text-2xl font-semibold">{stats.completedOrders}</p>
              <p className="text-xs text-muted-foreground">Completed Orders</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              <p className="text-2xl font-semibold">${stats.totalSpent?.toLocaleString() || '0'}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <CardDescription className="text-sm">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/designer')}>
                  <Plus className="w-5 h-5 text-primary" />
                  <span className="text-xs">New Order</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/portal/orders')}>
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs">Track Orders</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/portal/invoices')}>
                  <Download className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs">Invoices</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/portal/support')}>
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs">Support</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Quotes Alert */}
        {pendingQuotes.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm">
                      {pendingQuotes.length} Quote{pendingQuotes.length === 1 ? '' : 's'} Awaiting Approval
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Review and approve to proceed with your orders
                    </p>
                    <div className="mt-3 space-y-2">
                      {pendingQuotes.slice(0, 2).map(quote => (
                        <div key={quote.id} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Quote #{quote.quoteNumber}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {quote.description}
                            </span>
                          </div>
                          {quote.estimatedTotal && (
                            <span className="text-sm font-semibold">
                              ${quote.estimatedTotal.toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0 gap-1" onClick={() => navigate('/portal/quotes')}>
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Orders and Notifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <RecentOrders orders={recentOrders} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Notifications 
              notifications={notificationList}
              onDismiss={handleDismissNotification}
              onMarkAsRead={handleMarkAsRead}
            />
          </motion.div>
        </div>

        {/* Reorder Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Reorder Previous Jobs</CardTitle>
                  <CardDescription className="text-sm">Quick reorder from your history</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/portal/orders')}>
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {recentOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/portal/orders/${order.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/portal/orders/${order.id}`);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Order #{order.orderNumber}</span>
                        <Badge variant="secondary" className="text-xs">{order.itemCount} items</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 truncate">
                        {order.items?.[0]?.name || 'Custom Order'}
                      </p>
                      <Button size="sm" variant="outline" className="w-full gap-1 text-xs">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reorder
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No previous orders yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
