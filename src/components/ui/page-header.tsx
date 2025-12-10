/**
 * PageHeader - Reusable page header component with breadcrumbs
 * Modern design with optional actions
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  backHref,
  onBack,
  className
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn('space-y-1', className)}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
              {item.href ? (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Back button */}
          {(backHref || onBack) && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -ml-2"
              onClick={onBack}
              asChild={!!backHref}
            >
              {backHref ? (
                <Link to={backHref}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
            </Button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant || 'secondary'}>
                  {badge.label}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PageHeader;
