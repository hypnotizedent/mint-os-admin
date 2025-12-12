import { House, FolderOpen, Users, Package, Printer, ChartBar, Gear, Bell, ClockAfternoon, FileText, ShoppingCart, Truck, Receipt, Robot, UserCircle, SignOut } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useAuth } from "@/contexts/AuthContext"

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: number
}

interface AppSidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const { user, logout } = useAuth()
  
  const navItems: NavItem[] = [
    { icon: House, label: "Dashboard", href: "dashboard" },
    { icon: ClockAfternoon, label: "Production", href: "production" },
    { icon: Package, label: "Jobs", href: "jobs", badge: 12 },
    { icon: FileText, label: "Quotes", href: "quotes" },
    { icon: Receipt, label: "Invoices", href: "invoices" },
    { icon: ShoppingCart, label: "Products", href: "products" },
    { icon: Truck, label: "Shipping", href: "shipping" },
    { icon: Robot, label: "AI Assistant", href: "ai-assistant" },
    { icon: FolderOpen, label: "Files", href: "files" },
    { icon: Users, label: "Customers", href: "customers" },
    { icon: Printer, label: "Schedule", href: "machines" },
    { icon: ChartBar, label: "Reports", href: "reports" },
    { icon: Gear, label: "Settings", href: "settings" },
  ]

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Printer className="text-primary-foreground" size={24} weight="bold" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Mint OS</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.href
          
          return (
            <button
              key={item.href}
              onClick={() => { console.log("CLICK: item.label=", item.label, "item.href=", item.href); onNavigate(item.href); }}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} aria-hidden="true" />
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <span 
                  className={cn(
                    "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
                    isActive 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-accent text-accent-foreground"
                  )}
                  aria-label={`${item.badge} items`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
        
        {/* External Links */}
        <div className="pt-4 mt-4 border-t border-border" role="group" aria-label="External links">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            External
          </p>
          <a
            href="http://docker-host:3334"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-foreground hover:bg-muted"
          >
            <UserCircle size={20} />
            <span className="font-medium text-sm">Customer Portal</span>
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        {/* User info */}
        {user && (
          <div className="px-3 py-2 text-sm">
            <p className="font-medium text-foreground">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.userType}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors">
          <Bell size={20} />
          <span className="font-medium text-sm">Notifications</span>
          <span className="ml-auto w-2 h-2 bg-accent rounded-full"></span>
        </button>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <SignOut size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
