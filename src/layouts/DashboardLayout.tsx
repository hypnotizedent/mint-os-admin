/**
 * DashboardLayout - Modern dashboard layout component
 * Vercel/Linear inspired design with smooth animations
 */

import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  Settings,
  User,
  HelpCircle,
  Printer
} from 'lucide-react';

// Types
export interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  badgeVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
  children?: NavItem[];
}

export interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onLogout?: () => void;
  logo?: ReactNode;
  title?: string;
  subtitle?: string;
}

// Animation variants
const sidebarVariants = {
  expanded: { width: 256 },
  collapsed: { width: 72 }
};

const contentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export function DashboardLayout({
  children,
  navItems,
  user,
  onLogout,
  logo,
  title = 'PrintShop OS',
  subtitle = 'Dashboard'
}: DashboardLayoutProps) {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveRoute = (href: string) => {
    if (href === '/') return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background">
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={isSidebarCollapsed ? 'collapsed' : 'expanded'}
          variants={sidebarVariants}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={cn(
            'fixed top-0 left-0 z-50 h-screen bg-sidebar border-r border-sidebar-border',
            'flex flex-col transition-transform duration-200',
            'lg:translate-x-0',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              {logo || (
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <Printer className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <span className="font-semibold text-sidebar-foreground">{title}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
            
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden ml-auto"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                        'hover:bg-sidebar-accent group',
                        isActive && 'bg-sidebar-accent text-sidebar-primary',
                        !isActive && 'text-sidebar-foreground'
                      )}
                    >
                      <Icon 
                        className={cn(
                          'w-5 h-5 shrink-0 transition-colors',
                          isActive ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                        )} 
                      />
                      <AnimatePresence>
                        {!isSidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-sm font-medium overflow-hidden whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && !isSidebarCollapsed && (
                        <Badge 
                          variant={item.badgeVariant || 'secondary'}
                          className="ml-auto text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isSidebarCollapsed && (
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <Badge variant={item.badgeVariant || 'secondary'} className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-sidebar-border space-y-2">
            {/* Collapse toggle (desktop only) */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex w-full justify-center"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              <ChevronRight 
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isSidebarCollapsed && 'rotate-180'
                )} 
              />
            </Button>

            {/* Theme toggle */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-2',
              isSidebarCollapsed && 'justify-center'
            )}>
              {!isSidebarCollapsed && (
                <span className="text-sm text-muted-foreground">Theme</span>
              )}
              <div className={!isSidebarCollapsed ? 'ml-auto' : ''}>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div 
          className={cn(
            'transition-all duration-200',
            isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
          )}
        >
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-background/80 backdrop-blur-sm border-b border-border">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Page title / Breadcrumb area */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{subtitle}</h1>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden sm:flex" disabled>
                    <Search className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search (Coming Soon)</p>
                </TooltipContent>
              </Tooltip>

              {/* Notifications */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notifications, you have unread notifications" disabled>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications (Coming Soon)</p>
                </TooltipContent>
              </Tooltip>

              {/* Help */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden sm:flex" disabled>
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Help & Documentation (Coming Soon)</p>
                </TooltipContent>
              </Tooltip>

              {/* User menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-sm font-medium">
                        {user.name.split(' ')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        {user.role && (
                          <Badge variant="secondary" className="mt-1 w-fit text-xs">
                            {user.role}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <User className="w-4 h-4 mr-2" />
                      Profile (Coming Soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings (Coming Soon)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={onLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-6">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={contentVariants}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default DashboardLayout;
