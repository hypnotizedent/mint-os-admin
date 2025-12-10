import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp,
  Minus, 
  Plus,
  Tag,
  Clock,
  Truck,
  Info,
  Zap
} from "lucide-react";
import { 
  GarmentType, 
  PrintMethod,
  PricingBreakdown,
  BASE_GARMENT_PRICES,
  PRINT_METHOD_PRICES,
  QUANTITY_TIERS 
} from "../types/database";

// Pricing configuration constants
const RUSH_ORDER_MULTIPLIER = 0.25; // 25% extra for rush orders
const DTG_FLAT_RATE = 8; // Flat rate for DTG printing
const SUBLIMATION_FLAT_RATE = 12; // Flat rate for sublimation

interface PricingPanelProps {
  garmentType: GarmentType;
  printMethod: PrintMethod;
  quantity: number;
  numColors: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onSaveDesign?: () => void;
}

// Calculate quantity discount tier
const getQuantityDiscount = (quantity: number): number => {
  const tier = QUANTITY_TIERS.find(t => quantity >= t.minQty && quantity <= t.maxQty);
  return tier?.pricePerUnit || 0;
};

// Get tier label
const getTierLabel = (quantity: number): string => {
  if (quantity >= 72) return 'Wholesale';
  if (quantity >= 36) return 'Bulk';
  if (quantity >= 12) return 'Team';
  return 'Sample';
};

// Get flat rate for print method
const getFlatRate = (method: PrintMethod): number => {
  if (method === 'dtg') return DTG_FLAT_RATE;
  if (method === 'sublimation') return SUBLIMATION_FLAT_RATE;
  return 0;
};

export const PricingPanel = ({ 
  garmentType,
  printMethod,
  quantity,
  numColors,
  onQuantityChange,
  onAddToCart,
  onSaveDesign 
}: PricingPanelProps) => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [rushOrder, setRushOrder] = useState(false);

  // Calculate pricing
  const pricing = useMemo((): PricingBreakdown => {
    const basePrice = BASE_GARMENT_PRICES[garmentType];
    const printPricing = PRINT_METHOD_PRICES[printMethod];
    
    // Per unit costs
    const garmentCost = basePrice;
    const flatRate = getFlatRate(printMethod);
    const printCost = flatRate > 0 
      ? flatRate 
      : printPricing.perColor * Math.max(numColors, 1);
    
    // One-time fees (divided by quantity)
    const setupFee = printPricing.setup;
    const setupPerUnit = setupFee / quantity;
    
    // Quantity discount
    const discount = getQuantityDiscount(quantity);
    
    // Rush order fee using configurable multiplier
    const rushFee = rushOrder ? (garmentCost + printCost) * RUSH_ORDER_MULTIPLIER : 0;
    
    // Calculate totals
    const perUnitBeforeDiscount = garmentCost + printCost + rushFee;
    const perUnitPrice = perUnitBeforeDiscount + discount; // discount is negative
    const subtotal = perUnitPrice * quantity + setupFee;
    const total = subtotal;

    return {
      basePrice,
      garmentCost,
      printCost,
      setupFee,
      colorFees: printPricing.perColor * Math.max(numColors, 1),
      rushFee: rushFee * quantity,
      discount: Math.abs(discount) * quantity,
      subtotal,
      total,
      perUnitPrice: perUnitPrice + setupPerUnit,
    };
  }, [garmentType, printMethod, quantity, numColors, rushOrder]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    onQuantityChange(newQuantity);
  };

  const tierLabel = getTierLabel(quantity);
  const savingsAmount = pricing.discount;

  return (
    <Card className="shadow-lg border-0 sticky top-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5 text-green-600" />
            Live Pricing
          </CardTitle>
          {savingsAmount > 0 && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              Save ${savingsAmount.toFixed(2)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quantity Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Quantity</Label>
            <Badge variant="outline">{tierLabel}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quantity Tier Indicator */}
          <div className="flex justify-between text-xs text-gray-500">
            <span className={quantity >= 1 ? 'font-medium text-blue-600' : ''}>1+</span>
            <span className={quantity >= 12 ? 'font-medium text-blue-600' : ''}>12+</span>
            <span className={quantity >= 36 ? 'font-medium text-blue-600' : ''}>36+</span>
            <span className={quantity >= 72 ? 'font-medium text-blue-600' : ''}>72+</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ 
                width: `${Math.min((quantity / 72) * 100, 100)}%` 
              }}
            />
          </div>
        </div>

        <Separator />

        {/* Quick Price Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Per Unit</span>
            <span className="font-semibold text-lg">
              ${pricing.perUnitPrice.toFixed(2)}
            </span>
          </div>
          
          {/* Price Breakdown Collapsible */}
          <Collapsible open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-sm text-gray-500">Price Breakdown</span>
                {isBreakdownOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="text-sm space-y-1 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Garment ({garmentType})</span>
                  <span>${pricing.garmentCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Print ({printMethod})</span>
                  <span>${pricing.printCost.toFixed(2)}</span>
                </div>
                {pricing.setupFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Setup Fee (one-time)</span>
                    <span>${pricing.setupFee.toFixed(2)}</span>
                  </div>
                )}
                {pricing.rushFee > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Rush Fee</span>
                    <span>+${pricing.rushFee.toFixed(2)}</span>
                  </div>
                )}
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Quantity Discount</span>
                    <span>-${pricing.discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <Separator />

        {/* Rush Order Toggle */}
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600" />
            <div>
              <span className="text-sm font-medium text-amber-800">Rush Order</span>
              <p className="text-xs text-amber-600">1-2 business days (+25%)</p>
            </div>
          </div>
          <Switch
            checked={rushOrder}
            onCheckedChange={setRushOrder}
          />
        </div>

        <Separator />

        {/* Total */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal ({quantity} items)</span>
            <span>${pricing.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total</span>
            <span className="text-blue-600">${pricing.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          
          {onSaveDesign && (
            <Button variant="outline" className="w-full" onClick={onSaveDesign}>
              Save Design for Later
            </Button>
          )}
        </div>

        {/* Order Info */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{rushOrder ? '1-2 business days' : '5-7 business days'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck className="h-4 w-4" />
            <span>{pricing.total >= 100 ? 'Free shipping' : 'Shipping calculated at checkout'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            <span>Minimum order: 1 piece</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
