import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  House, 
  Package, 
  Receipt, 
  User, 
  ChatCircle, 
  List,
  X,
  Bell,
  MagnifyingGlass,
  SignOut
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CustomerUser } from "@/lib/types"

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: number
  children?: NavItem[]
}

interface NavigationProps {
  user: CustomerUser
  notificationCount?: number
  onSearch?: () => void
  onLogout?: () => void
}

export function Navigation({ user, notificationCount = 0, onSearch, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['orders', 'quotes'])
  const location = useLocation()

  const navItems: NavItem[] = [
    { icon: House, label: "Dashboard", href: "/portal" },
    { 
      icon: Package, 
      label: "Orders", 
      href: "/portal/orders",
      children: [
        { icon: Package, label: "Order History", href: "/portal/orders/history" },
        { icon: Package, label: "Track Orders", href: "/portal/orders/track" }
      ]
    },
    { 
      icon: Receipt, 
      label: "Quotes", 
      href: "/portal/quotes",
      badge: 3,
      children: [
        { icon: Receipt, label: "Request Quote", href: "/portal/quotes/request" },
        { icon: Receipt, label: "Pending Quotes", href: "/portal/quotes/pending" },
        { icon: Receipt, label: "Quote History", href: "/portal/quotes/history" }
      ]
    },
    { 
      icon: User, 
      label: "Account", 
      href: "/portal/account",
      children: [
        { icon: User, label: "Profile Settings", href: "/portal/account/profile" },
        { icon: User, label: "Addresses", href: "/portal/account/addresses" },
        { icon: User, label: "Payment Methods", href: "/portal/account/payment" },
        { icon: User, label: "Notifications", href: "/portal/account/notifications" }
      ]
    },
    { 
      icon: ChatCircle, 
      label: "Support", 
      href: "/portal/support",
      children: [
        { icon: ChatCircle, label: "Contact Us", href: "/portal/support/contact" },
        { icon: ChatCircle, label: "My Tickets", href: "/portal/support/tickets" }
      ]
    }
  ]

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const NavItemComponent = ({ item, isMobile = false }: { item: NavItem, isMobile?: boolean }) => {
    const Icon = item.icon
    const active = isActive(item.href)
    const isExpanded = item.children ? expandedItems.includes(item.label.toLowerCase()) : false

    return (
      <div>
        <Link
          to={item.href}
          onClick={() => {
            if (item.children) {
              toggleExpanded(item.label.toLowerCase())
            }
            if (isMobile) {
              setIsMobileMenuOpen(false)
            }
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
            active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground hover:bg-muted"
          )}
        >
          <Icon size={20} weight={active ? "fill" : "regular"} />
          <span className="font-medium text-sm flex-1">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </Link>
        {item.children && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child) => {
              const ChildIcon = child.icon
              const childActive = isActive(child.href)
              return (
                <Link
                  key={child.href}
                  to={child.href}
                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    childActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <ChildIcon size={16} weight={childActive ? "fill" : "regular"} />
                  {child.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Package className="text-primary-foreground" size={24} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Customer Portal</h1>
              <p className="text-xs text-muted-foreground">PrintShop OS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={onSearch}
          >
            <MagnifyingGlass size={20} />
            <span className="text-sm">Search</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => {}}
          >
            <Bell size={20} />
            <span className="text-sm">Notifications</span>
            {notificationCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {notificationCount}
              </Badge>
            )}
          </Button>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={onLogout}
          >
            <SignOut size={20} />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </Button>
          <h1 className="text-lg font-bold text-foreground">Customer Portal</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSearch}>
              <MagnifyingGlass size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background">
          <div className="pt-20 pb-4 px-4 h-full overflow-y-auto">
            <nav className="space-y-1 mb-6">
              {navItems.map((item) => (
                <NavItemComponent key={item.href} item={item} isMobile />
              ))}
            </nav>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onLogout?.()
                }}
              >
                <SignOut size={20} />
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
