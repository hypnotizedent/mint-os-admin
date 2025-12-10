import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SignaturePad } from "./SignaturePad"
import type { Quote } from "@/lib/types"

interface QuoteApprovalProps {
  quote: Quote | null
  isOpen: boolean
  onClose: () => void
  onApprove: (approvalData: {
    signature: string
    name: string
    email: string
    termsAccepted: boolean
  }) => Promise<void>
}

export function QuoteApproval({ quote, isOpen, onClose, onApprove }: QuoteApprovalProps) {
  const [signature, setSignature] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!quote) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!signature) {
      setError("Please provide a signature")
      return
    }

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions")
      return
    }

    setIsSubmitting(true)

    try {
      await onApprove({
        signature,
        name,
        email,
        termsAccepted,
      })
      
      // Reset form
      setSignature("")
      setName("")
      setEmail("")
      setTermsAccepted(false)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve quote")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSignature("")
      setName("")
      setEmail("")
      setTermsAccepted(false)
      setError("")
      onClose()
    }
  }

  const calculateDeliveryDate = (createdAt: string): string => {
    const created = new Date(createdAt)
    const delivery = new Date(created)
    delivery.setDate(delivery.getDate() + 10) // 7-10 business days
    return delivery.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approve Quote {quote.quoteNumber}</DialogTitle>
          <DialogDescription>
            By signing below, you approve this quote and authorize us to begin production.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="font-medium text-foreground">Total Amount:</span>
              <span className="text-2xl font-bold text-foreground">
                ${quote.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expected Delivery:</span>
              <span className="text-foreground">
                {calculateDeliveryDate(quote.createdAt)}
              </span>
            </div>
          </div>

          <SignaturePad 
            onSignatureChange={setSignature}
            className="w-full"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label 
                htmlFor="terms"
                className="text-sm font-normal cursor-pointer"
              >
                I agree to the terms and conditions
              </Label>
            </div>
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
              {isSubmitting ? "Approving..." : "Approve & Sign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
