import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Quote } from "@/lib/types"

interface RequestChangesProps {
  quote: Quote | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (comments: string) => Promise<void>
}

export function RequestChanges({ quote, isOpen, onClose, onSubmit }: RequestChangesProps) {
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!quote) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!comments.trim()) {
      setError("Please provide details about the changes you need")
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(comments)
      setComments("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit change request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setComments("")
      setError("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Changes to Quote {quote.quoteNumber}</DialogTitle>
          <DialogDescription>
            Please describe what changes you would like to make to this quote.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="comments">What changes would you like? *</Label>
            <Textarea
              id="comments"
              placeholder="Please change the back text size from 14&quot; to 12&quot; and adjust pricing"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Be as specific as possible so we can provide an accurate revised quote.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
