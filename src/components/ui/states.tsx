import { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"
import { Card } from "./card"
import { Button } from "./button"
import { 
  CircleNotch, 
  Warning, 
  Package, 
  MagnifyingGlass, 
  WifiSlash,
  ArrowCounterClockwise,
  FolderOpen,
  Users,
  FileText
} from "@phosphor-icons/react"

// ==================== LOADING STATES ====================

interface LoadingSpinnerProps extends ComponentProps<"div"> {
  size?: "sm" | "md" | "lg"
  label?: string
}

/**
 * A simple loading spinner with optional label.
 * Provides visual feedback during async operations.
 */
export function LoadingSpinner({ 
  size = "md", 
  label = "Loading...",
  className,
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-6", 
    lg: "size-8"
  }

  return (
    <div 
      role="status" 
      aria-live="polite"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <CircleNotch 
        className={cn("animate-spin text-primary", sizeClasses[size])} 
        weight="bold"
        aria-hidden="true"
      />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface PageLoadingProps {
  message?: string
}

/**
 * Full page loading state with centered spinner.
 * Use for initial page loads or route transitions.
 */
export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[400px] gap-4"
      role="status"
      aria-live="polite"
    >
      <CircleNotch 
        className="size-10 animate-spin text-primary" 
        weight="bold"
        aria-hidden="true"
      />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

interface CardSkeletonProps {
  count?: number
  className?: string
}

/**
 * Skeleton loading state for card grids.
 * Provides a visual placeholder while content loads.
 */
export function CardSkeleton({ count = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </Card>
      ))}
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

/**
 * Skeleton loading state for tables.
 * Shows placeholder rows while data loads.
 */
export function TableSkeleton({ rows = 5, columns = 6, className }: TableSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className={cn(
                  "h-4 flex-1",
                  colIndex === 0 && "w-1/4",
                  colIndex === columns - 1 && "w-1/6"
                )} 
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

interface StatCardSkeletonProps {
  count?: number
  className?: string
}

/**
 * Skeleton loading state for stat/metric cards.
 */
export function StatCardSkeleton({ count = 4, className }: StatCardSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="size-12 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ==================== EMPTY STATES ====================

type EmptyStateVariant = "default" | "search" | "jobs" | "customers" | "files" | "orders"

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: ReactNode
  className?: string
}

const emptyStateConfig: Record<EmptyStateVariant, { icon: ReactNode; title: string; description: string }> = {
  default: {
    icon: <Package size={48} weight="thin" className="text-muted-foreground" />,
    title: "Nothing here yet",
    description: "Get started by creating your first item.",
  },
  search: {
    icon: <MagnifyingGlass size={48} weight="thin" className="text-muted-foreground" />,
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
  },
  jobs: {
    icon: <FileText size={48} weight="thin" className="text-muted-foreground" />,
    title: "No jobs yet",
    description: "Create your first print job to get started.",
  },
  customers: {
    icon: <Users size={48} weight="thin" className="text-muted-foreground" />,
    title: "No customers yet",
    description: "Add your first customer to start managing orders.",
  },
  files: {
    icon: <FolderOpen size={48} weight="thin" className="text-muted-foreground" />,
    title: "No files uploaded",
    description: "Upload artwork files to get started.",
  },
  orders: {
    icon: <Package size={48} weight="thin" className="text-muted-foreground" />,
    title: "No orders yet",
    description: "Your order history will appear here.",
  },
}

/**
 * Empty state component for when there's no data to display.
 * Provides clear messaging and optional action button.
 */
export function EmptyState({
  variant = "default",
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  const config = emptyStateConfig[variant]
  
  return (
    <Card className={cn("p-12", className)}>
      <div className="flex flex-col items-center text-center gap-4">
        {icon || config.icon}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title || config.title}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {description || config.description}
          </p>
        </div>
        {action && (
          <Button onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  )
}

// ==================== ERROR STATES ====================

type ErrorStateVariant = "default" | "network" | "notFound" | "serverError"

interface ErrorStateProps {
  variant?: ErrorStateVariant
  title?: string
  description?: string
  error?: Error | string
  onRetry?: () => void
  className?: string
}

const errorStateConfig: Record<ErrorStateVariant, { icon: ReactNode; title: string; description: string }> = {
  default: {
    icon: <Warning size={48} weight="thin" className="text-destructive" />,
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
  },
  network: {
    icon: <WifiSlash size={48} weight="thin" className="text-destructive" />,
    title: "Connection error",
    description: "Unable to connect to the server. Please check your internet connection.",
  },
  notFound: {
    icon: <MagnifyingGlass size={48} weight="thin" className="text-muted-foreground" />,
    title: "Not found",
    description: "The requested resource could not be found.",
  },
  serverError: {
    icon: <Warning size={48} weight="thin" className="text-destructive" />,
    title: "Server error",
    description: "The server encountered an error. Please try again later.",
  },
}

/**
 * Error state component for handling API failures and errors.
 * Provides clear error messaging and optional retry action.
 */
export function ErrorState({
  variant = "default",
  title,
  description,
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  const config = errorStateConfig[variant]
  const errorMessage = error instanceof Error ? error.message : error
  
  return (
    <Card className={cn("p-12 border-destructive/20 bg-destructive/5", className)}>
      <div className="flex flex-col items-center text-center gap-4">
        {config.icon}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title || config.title}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {description || config.description}
          </p>
          {errorMessage && (
            <p className="text-sm text-destructive/80 font-mono bg-destructive/10 px-3 py-2 rounded-md max-w-md break-words">
              {errorMessage}
            </p>
          )}
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-2 gap-2">
            <ArrowCounterClockwise size={16} weight="bold" />
            Try again
          </Button>
        )}
      </div>
    </Card>
  )
}

// ==================== INLINE STATES ====================

interface InlineLoadingProps {
  label?: string
  className?: string
}

/**
 * Inline loading indicator for smaller UI elements.
 */
export function InlineLoading({ label = "Loading", className }: InlineLoadingProps) {
  return (
    <span 
      className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <CircleNotch className="size-3 animate-spin" weight="bold" aria-hidden="true" />
      {label}
    </span>
  )
}

interface InlineErrorProps {
  message: string
  className?: string
}

/**
 * Inline error message for form fields or small UI elements.
 */
export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <span 
      className={cn("inline-flex items-center gap-1.5 text-sm text-destructive", className)}
      role="alert"
    >
      <Warning size={14} weight="fill" aria-hidden="true" />
      {message}
    </span>
  )
}
