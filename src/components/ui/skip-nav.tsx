import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

interface SkipNavLinkProps extends ComponentProps<"a"> {
  contentId?: string
  label?: string
}

/**
 * Skip navigation link for keyboard accessibility.
 * Allows users to skip repetitive navigation and jump directly to main content.
 * 
 * Usage:
 * 1. Add <SkipNavLink /> as the first focusable element in your app
 * 2. Add <SkipNavContent /> or id="main-content" to your main content area
 * 
 * @example
 * ```tsx
 * <SkipNavLink />
 * <header>Navigation...</header>
 * <SkipNavContent>
 *   <main>Main content...</main>
 * </SkipNavContent>
 * ```
 */
export function SkipNavLink({ 
  contentId = "main-content",
  label = "Skip to main content",
  className,
  ...props 
}: SkipNavLinkProps) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        // Hidden by default, visible on focus
        "sr-only focus:not-sr-only",
        // Positioned at top left
        "focus:fixed focus:top-4 focus:left-4 focus:z-50",
        // Styled like a button
        "focus:inline-flex focus:items-center focus:justify-center",
        "focus:rounded-md focus:bg-primary focus:px-4 focus:py-2",
        "focus:text-sm focus:font-medium focus:text-primary-foreground",
        // Focus ring
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Transition for smooth appearance
        "transition-opacity",
        className
      )}
      {...props}
    >
      {label}
    </a>
  )
}

interface SkipNavContentProps extends ComponentProps<"div"> {
  id?: string
}

/**
 * Container for main content that skip navigation links to.
 * Applies proper focus management and accessibility attributes.
 */
export function SkipNavContent({ 
  id = "main-content",
  className,
  children,
  ...props 
}: SkipNavContentProps) {
  return (
    <div
      id={id}
      tabIndex={-1}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}
