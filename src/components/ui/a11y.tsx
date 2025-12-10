import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

interface VisuallyHiddenProps extends ComponentProps<"span"> {}

/**
 * Hides content visually but keeps it accessible to screen readers.
 * Use for descriptive text that adds context for assistive technologies.
 * 
 * @example
 * ```tsx
 * <button>
 *   <TrashIcon />
 *   <VisuallyHidden>Delete item</VisuallyHidden>
 * </button>
 * ```
 */
export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        "[clip:rect(0,0,0,0)]",
        className
      )}
      {...props}
    />
  )
}

interface FocusRingProps extends ComponentProps<"div"> {
  /**
   * Whether the focus ring is currently visible
   */
  visible?: boolean
  /**
   * Offset from the element edge
   */
  offset?: "none" | "sm" | "md" | "lg"
}

/**
 * A focus ring indicator for custom focus management.
 * Provides consistent focus styling across the application.
 * 
 * Note: Most components should use built-in focus-visible styles.
 * Only use this for custom components that need explicit focus management.
 */
export function FocusRing({ 
  visible = false, 
  offset = "sm",
  className,
  children,
  ...props 
}: FocusRingProps) {
  const offsetClasses = {
    none: "ring-offset-0",
    sm: "ring-offset-1",
    md: "ring-offset-2",
    lg: "ring-offset-4",
  }

  return (
    <div
      className={cn(
        "relative transition-shadow",
        visible && [
          "ring-2 ring-ring",
          offsetClasses[offset],
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
