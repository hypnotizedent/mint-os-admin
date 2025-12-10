import { Info, Warning, CheckCircle, XCircle, X } from "@phosphor-icons/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { CustomerNotification } from "@/lib/types"

interface NotificationsProps {
  notifications: CustomerNotification[]
  onDismiss?: (id: string) => void
  onMarkAsRead?: (id: string) => void
}

export function Notifications({ notifications, onDismiss, onMarkAsRead }: NotificationsProps) {
  const getNotificationIcon = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'info':
        return Info
      case 'warning':
        return Warning
      case 'success':
        return CheckCircle
      case 'error':
        return XCircle
      default:
        return Info
    }
  }

  const getNotificationColor = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'info':
        return 'text-blue-500'
      case 'warning':
        return 'text-yellow-500'
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getNotificationBg = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      default:
        return 'bg-muted'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => notifications.filter(n => !n.read).forEach(n => onMarkAsRead?.(n.id))}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                const iconColor = getNotificationColor(notification.type)
                const bgColor = getNotificationBg(notification.type)

                return (
                  <Alert
                    key={notification.id}
                    className={cn(
                      "relative",
                      bgColor,
                      !notification.read && "border-l-4"
                    )}
                    onClick={() => !notification.read && onMarkAsRead?.(notification.id)}
                  >
                    <Icon className={cn("h-4 w-4", iconColor)} weight="fill" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>{notification.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-normal">
                          {formatDate(notification.date)}
                        </span>
                        {onDismiss && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDismiss(notification.id)
                            }}
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    </AlertTitle>
                    <AlertDescription>
                      {notification.message}
                      {notification.actionUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-2"
                          onClick={() => window.location.href = notification.actionUrl!}
                        >
                          View Details
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
