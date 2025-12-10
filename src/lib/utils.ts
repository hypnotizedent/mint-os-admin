import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user text input for safe storage and display.
 * 
 * SECURITY NOTE: This function provides defense-in-depth input sanitization.
 * React's JSX automatically escapes content when rendering (the primary XSS defense).
 * This sanitization prevents malformed data from being stored and ensures clean text.
 * It should NOT be relied upon as the sole XSS protection.
 * 
 * For rendering user content as HTML (e.g., with dangerouslySetInnerHTML),
 * use a proper HTML sanitization library like DOMPurify.
 * 
 * @param value - The string to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string or undefined if empty
 */
export function sanitizeTextInput(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined;
  
  let sanitized = value;
  
  // Remove all angle brackets to prevent any HTML tag formation.
  // This is aggressive but safe for plain text fields like reference numbers and notes.
  // Note: This approach ensures no HTML can be formed, even with partial/malformed tags.
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Remove null bytes which can cause issues in some contexts
  sanitized = sanitized.replace(/\0/g, '');
  
  // Trim and limit length
  sanitized = sanitized.slice(0, maxLength).trim();
  
  return sanitized || undefined;
}
