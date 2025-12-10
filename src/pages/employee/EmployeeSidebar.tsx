/**
 * Employee Sidebar
 * Simplified navigation for production floor
 * Touch-friendly design
 */

import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Printer, 
  ClipboardList, 
  Calendar, 
  HelpCircle, 
  LogOut,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmployeeSidebarProps {
  employeeName: string;
  shiftStartTime?: string;
  onLogout: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

export function EmployeeSidebar({ 
  employeeName, 
  shiftStartTime,
  onLogout 
}: EmployeeSidebarProps) {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    { icon: ClipboardList, label: 'My Jobs', href: '/production' },
    { icon: Calendar, label: 'Schedule', href: '/production/schedule' },
    { icon: HelpCircle, label: 'Help', href: '/production/help' },
  ];

  const isActive = (href: string) => {
    if (href === '/production') {
      return location.pathname === '/production' || location.pathname === '/production/jobs';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b h-16 flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Printer className="text-primary-foreground" size={18} />
          </div>
          <span className="font-bold">Production</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{employeeName}</span>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col h-screen fixed top-0 left-0">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Printer className="text-primary-foreground" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Production</h1>
              <p className="text-xs text-muted-foreground">Employee Portal</p>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="p-4 border-b border-border bg-muted/50">
          <p className="font-medium text-sm">{employeeName}</p>
          {shiftStartTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>Clocked in: {shiftStartTime}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Employee navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  // Touch-friendly: minimum 44px height
                  "min-h-[44px]",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon size={24} aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Clock Out Button */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full h-12 text-base gap-2"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5" />
            Clock Out
          </Button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t h-16 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[60px]",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon size={24} aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-muted-foreground min-w-[60px]"
        >
          <LogOut size={24} />
          <span className="text-xs font-medium">Clock Out</span>
        </button>
      </nav>
    </>
  );
}

export default EmployeeSidebar;
