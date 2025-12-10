/**
 * RecordPaymentDialog Component
 * Modal dialog for recording payments against orders
 */
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CurrencyDollar, Warning } from "@phosphor-icons/react"
import { toast } from "sonner"
import { recordPayment } from "@/lib/api/payments"
import { sanitizeTextInput } from "@/lib/utils"
import type { PaymentMethodEnum, PaymentFormData, OrderPayment } from "@/lib/types"

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderDocumentId: string
  orderNumber: string
  amountOutstanding: number
  onPaymentRecorded: (payment: OrderPayment, newAmountPaid: number, newAmountOutstanding: number) => void
}

const PAYMENT_METHODS: { value: PaymentMethodEnum; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "credit_card", label: "Credit Card" },
  { value: "ach", label: "ACH / Bank Transfer" },
  { value: "bank_transfer", label: "Wire Transfer" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
]

// Maximum lengths for text fields
const MAX_REFERENCE_LENGTH = 100
const MAX_NOTES_LENGTH = 500

export function RecordPaymentDialog({
  open,
  onOpenChange,
  orderDocumentId,
  orderNumber,
  amountOutstanding,
  onPaymentRecorded,
}: RecordPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState(amountOutstanding.toFixed(2))
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodEnum>("cash")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || !isFinite(amountNum) || amountNum <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0"
    } else if (amountNum > amountOutstanding) {
      newErrors.amount = `Amount cannot exceed outstanding balance of $${amountOutstanding.toFixed(2)}`
    } else if (amountNum > 999999999.99) {
      newErrors.amount = "Amount exceeds maximum allowed value"
    }

    if (!paymentDate) {
      newErrors.paymentDate = "Please select a payment date"
    } else {
      // Validate date format and reasonable range
      const date = new Date(paymentDate)
      const now = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (isNaN(date.getTime())) {
        newErrors.paymentDate = "Please enter a valid date"
      } else if (date > now) {
        newErrors.paymentDate = "Payment date cannot be in the future"
      } else if (date < oneYearAgo) {
        newErrors.paymentDate = "Payment date cannot be more than 1 year ago"
      }
    }

    if (referenceNumber.length > MAX_REFERENCE_LENGTH) {
      newErrors.referenceNumber = `Reference number cannot exceed ${MAX_REFERENCE_LENGTH} characters`
    }

    if (notes.length > MAX_NOTES_LENGTH) {
      newErrors.notes = `Notes cannot exceed ${MAX_NOTES_LENGTH} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    const paymentData: PaymentFormData = {
      amount: parseFloat(amount),
      paymentMethod,
      referenceNumber: referenceNumber ? sanitizeTextInput(referenceNumber, MAX_REFERENCE_LENGTH) : undefined,
      paymentDate,
      notes: notes ? sanitizeTextInput(notes, MAX_NOTES_LENGTH) : undefined,
    }

    const result = await recordPayment(orderDocumentId, paymentData)

    if (result.success && result.payment && result.newAmountPaid !== undefined && result.newAmountOutstanding !== undefined) {
      toast.success("Payment recorded", {
        description: `$${parseFloat(amount).toFixed(2)} recorded for order #${orderNumber}`,
      })
      onPaymentRecorded(result.payment, result.newAmountPaid, result.newAmountOutstanding)
      onOpenChange(false)
      // Reset form - use the new outstanding amount from the API response
      setAmount(result.newAmountOutstanding.toFixed(2))
      setPaymentMethod("cash")
      setReferenceNumber("")
      setNotes("")
      setErrors({})
    } else {
      toast.error("Failed to record payment", {
        description: result.error || "Please try again",
      })
    }

    setIsSubmitting(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CurrencyDollar size={24} weight="fill" className="text-green-600" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment for order #{orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Outstanding Balance Display */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(amountOutstanding)}
            </p>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={amountOutstanding}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`pl-7 ${errors.amount ? "border-destructive" : ""}`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <Warning size={14} />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: PaymentMethodEnum) => setPaymentMethod(value)}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number</Label>
            <Input
              id="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              maxLength={MAX_REFERENCE_LENGTH}
              placeholder={
                paymentMethod === "check"
                  ? "Check #"
                  : paymentMethod === "credit_card"
                    ? "Transaction ID"
                    : "Reference #"
              }
              className={errors.referenceNumber ? "border-destructive" : ""}
            />
            {errors.referenceNumber ? (
              <p className="text-sm text-destructive flex items-center gap-1">
                <Warning size={14} />
                {errors.referenceNumber}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {paymentMethod === "check" && "Enter the check number"}
                {paymentMethod === "credit_card" && "Enter the transaction ID"}
                {paymentMethod === "ach" && "Enter the ACH reference number"}
                {paymentMethod === "stripe" && "Enter the Stripe payment ID"}
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={errors.paymentDate ? "border-destructive" : ""}
            />
            {errors.paymentDate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <Warning size={14} />
                {errors.paymentDate}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional payment notes..."
              rows={2}
              maxLength={MAX_NOTES_LENGTH}
              className={errors.notes ? "border-destructive" : ""}
            />
            {errors.notes && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <Warning size={14} />
                {errors.notes}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
