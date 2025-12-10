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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Quote } from "@/lib/types"

interface RejectQuoteProps {
  quote: Quote | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, comments?: string) => Promise<void>
}

const rejectionReasons = [
  { value: "not_in_budget", label: "Not in budget" },
  { value: "wrong_items", label: "Wrong items" },
  { value: "timeline_too_long", label: "Timeline too long" },
  { value: "found_alternative", label: "Found alternative" },
  { value: "other", label: "Other" },
]

export function RejectQuote({ quote, isOpen, onClose, onSubmit }: RejectQuoteProps) {
  const [reason, setReason] = useState("")
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!quote) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    setIsSubmitting(true)

    try {
      const selectedReason = reason || "No reason provided"
      await onSubmit(selectedReason, comments || undefined)
      setReason("")
      setComments("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject quote")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("")
      setComments("")
      setError("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject Quote {quote.quoteNumber}</DialogTitle>
          <DialogDescription>
            Please let us know why you're declining this quote. This helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for rejection (optional)</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {rejectionReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Additional comments (optional)</Label>
            <Textarea
              id="comments"
              placeholder="Any additional details you'd like to share..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
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
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Rejecting..." : "Reject Quote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
