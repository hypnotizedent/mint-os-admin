import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CreditCard, Bank, Plus, Trash } from "@phosphor-icons/react"
import type { PaymentMethod, PaymentMethodType } from "@/lib/types"

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
  onAddPaymentMethod?: () => void
  onRemovePaymentMethod?: (methodId: string) => void
  onSetDefault?: (methodId: string) => void
}

export function PaymentMethods({
  paymentMethods,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefault,
}: PaymentMethodsProps) {
  const [methodToRemove, setMethodToRemove] = useState<string | null>(null)

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case 'Card':
        return <CreditCard size={24} weight="fill" className="text-magenta" />
      case 'Bank ACH':
        return <Bank size={24} weight="fill" className="text-blue-500" />
      case 'PayPal':
        return <CreditCard size={24} weight="fill" className="text-blue-600" />
      default:
        return <CreditCard size={24} weight="fill" className="text-gray-500" />
    }
  }

  const getMethodLabel = (method: PaymentMethod) => {
    if (method.type === 'Card') {
      return `ending in ${method.last4}`
    }
    return `ending in ${method.last4}`
  }

  const formatExpiry = (method: PaymentMethod) => {
    if (method.expiryMonth && method.expiryYear) {
      return `Expires: ${method.expiryMonth.toString().padStart(2, '0')}/${method.expiryYear}`
    }
    return null
  }

  const handleRemove = (methodId: string) => {
    setMethodToRemove(methodId)
  }

  const confirmRemove = () => {
    if (methodToRemove && onRemovePaymentMethod) {
      onRemovePaymentMethod(methodToRemove)
    }
    setMethodToRemove(null)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Payment Methods</h2>
            <p className="text-muted-foreground mt-1">Manage your payment methods</p>
          </div>
          {onAddPaymentMethod && (
            <Button className="gap-2" onClick={onAddPaymentMethod}>
              <Plus size={18} weight="bold" />
              Add Payment Method
            </Button>
          )}
        </div>

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <Card className="p-12 text-center">
              <CreditCard size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No payment methods added yet</p>
              {onAddPaymentMethod && (
                <Button variant="outline" className="gap-2" onClick={onAddPaymentMethod}>
                  <Plus size={18} weight="bold" />
                  Add Your First Payment Method
                </Button>
              )}
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      {getMethodIcon(method.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {method.type} {getMethodLabel(method)}
                        </h3>
                        {method.isDefault && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Default
                          </Badge>
                        )}
                      </div>
                      {formatExpiry(method) && (
                        <p className="text-sm text-muted-foreground">{formatExpiry(method)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!method.isDefault && onSetDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    {onRemovePaymentMethod && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleRemove(method.id)}
                      >
                        <Trash size={16} weight="bold" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Security Notice */}
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CreditCard size={20} weight="fill" className="text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Secure Payment Processing
              </h4>
              <p className="text-xs text-muted-foreground">
                All payment methods are securely tokenized and encrypted. We never store your full
                card number or sensitive payment information. All transactions are PCI DSS compliant.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={methodToRemove !== null} onOpenChange={() => setMethodToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-red-500 hover:bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
