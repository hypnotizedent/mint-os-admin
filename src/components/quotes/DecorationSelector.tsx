/**
 * DecorationSelector Component
 * Allows selection of decoration method, colors, and location with real-time pricing
 * from the Job Estimator API
 */
import { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@phosphor-icons/react';
import { pricingApi, type PricingResult } from '@/lib/pricing-api';

interface DecorationSelectorProps {
  quantity: number;
  onPriceChange: (pricing: PricingResult | null) => void;
  initialMethod?: string;
  initialColors?: number;
  initialLocation?: string;
  disabled?: boolean;
}

export function DecorationSelector({
  quantity,
  onPriceChange,
  initialMethod = 'screen-printing',
  initialColors = 1,
  initialLocation = 'front-center',
  disabled = false,
}: DecorationSelectorProps) {
  const [method, setMethod] = useState(initialMethod);
  const [colors, setColors] = useState(initialColors);
  const [location, setLocation] = useState(initialLocation);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState(true);

  const methods = pricingApi.getAvailableMethods();
  const locations = pricingApi.getAvailableLocations();

  // Check API health on mount
  useEffect(() => {
    pricingApi.healthCheck().then(setApiHealthy);
  }, []);

  // Calculate pricing when inputs change
  const calculatePricing = useCallback(async () => {
    if (quantity <= 0) {
      setPricing(null);
      onPriceChange(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await pricingApi.calculate({
        method,
        quantity,
        colors: method === 'screen-printing' || method === 'embroidery' ? colors : undefined,
        locations: [location],
      });

      setPricing(result);
      onPriceChange(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pricing calculation failed');
      setPricing(null);
      onPriceChange(null);
    } finally {
      setLoading(false);
    }
  }, [method, quantity, colors, location, onPriceChange]);

  // Debounce pricing calculation
  useEffect(() => {
    const timer = setTimeout(calculatePricing, 300);
    return () => clearTimeout(timer);
  }, [calculatePricing]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  };

  const showColorSelector = method === 'screen-printing' || method === 'embroidery';

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Decoration Pricing</h4>
        {!apiHealthy && (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Using fallback pricing
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Method selector */}
        <div className="space-y-2">
          <Label htmlFor="decoration-method">Method</Label>
          <Select
            value={method}
            onValueChange={setMethod}
            disabled={disabled}
          >
            <SelectTrigger id="decoration-method">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {methods.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Colors selector (for screen printing / embroidery) */}
        {showColorSelector && (
          <div className="space-y-2">
            <Label htmlFor="decoration-colors">Colors</Label>
            <Select
              value={String(colors)}
              onValueChange={(v) => setColors(Number(v))}
              disabled={disabled}
            >
              <SelectTrigger id="decoration-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} Color{n > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Location selector */}
        <div className="space-y-2">
          <Label htmlFor="decoration-location">Location</Label>
          <Select
            value={location}
            onValueChange={setLocation}
            disabled={disabled}
          >
            <SelectTrigger id="decoration-location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.value} value={loc.value}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing display */}
      <div className="mt-4 p-4 bg-accent/50 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Spinner className="animate-spin" size={16} />
            <span>Calculating...</span>
          </div>
        ) : error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : pricing ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit Price:</span>
              <span className="font-medium">{formatCurrency(pricing.unitPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity:</span>
              <span>{quantity}</span>
            </div>
            {pricing.breakdown.volume_discounts > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Volume Discount:</span>
                <span>-{formatCurrency(pricing.breakdown.volume_discounts)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
              <span>Print Cost:</span>
              <span className="text-primary">{formatCurrency(pricing.totalPrice)}</span>
            </div>
            {pricing.calculationTimeMs > 0 && (
              <div className="text-xs text-muted-foreground text-right">
                Calculated in {pricing.calculationTimeMs}ms
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm text-center">
            Enter quantity to see pricing
          </div>
        )}
      </div>
    </div>
  );
}

export default DecorationSelector;
