/**
 * Pricing API Client
 * Integrates with the Job Estimator API for accurate decoration pricing
 */

const PRICING_API_URL = import.meta.env.VITE_PRICING_API_URL || 'http://mint-os-job-estimator:3001';

export type DecorationMethod = 'screen' | 'embroidery' | 'heat-transfer' | 'dtf' | 'vinyl' | 'sublimation' | 'dtg';

export interface PricingRequest {
  quantity: number;
  service: DecorationMethod;
  print_locations?: string[];
  color_count?: number;
  stitch_count?: number;
  garment_type?: 'light' | 'dark' | 'poly';
  customer_type?: 'new' | 'repeat_customer';
  rush?: boolean;
  setup_new?: boolean;
}

export interface LineItem {
  description: string;
  unit_cost?: number;
  qty?: number;
  total: number;
  discount?: number;
}

export interface PricingBreakdown {
  base_cost: number;
  location_surcharges: number;
  color_adjustments: number;
  volume_discounts: number;
  margin_amount: number;
}

export interface PricingResponse {
  line_items: LineItem[];
  subtotal: number;
  margin_pct: number;
  total_price: number;
  breakdown: PricingBreakdown;
  rules_applied: string[];
  calculation_time_ms: number;
}

export interface PricingResult {
  unitPrice: number;
  totalPrice: number;
  subtotal: number;
  marginPct: number;
  breakdown: PricingBreakdown;
  lineItems: LineItem[];
  calculationTimeMs: number;
}

/**
 * Map frontend method names to API service names
 */
function mapMethodToService(method: string): DecorationMethod {
  const mapping: Record<string, DecorationMethod> = {
    'screen-printing': 'screen',
    'screenprint': 'screen',
    'screen': 'screen',
    'embroidery': 'embroidery',
    'heat-transfer': 'heat-transfer',
    'dtf': 'dtf',
    'dtg': 'dtg',
    'vinyl': 'vinyl',
    'sublimation': 'sublimation',
  };
  return mapping[method.toLowerCase()] || 'screen';
}

/**
 * Map frontend location names to API location names
 */
function mapLocation(location: string): string {
  const mapping: Record<string, string> = {
    'front-center': 'front',
    'front-left-chest': 'left-chest',
    'front-right-chest': 'chest',
    'full-front': 'front',
    'back-center': 'back',
    'back-neck': 'back-neck',
    'full-back': 'full-back',
    'left-sleeve': 'sleeve',
    'right-sleeve': 'sleeve',
  };
  return mapping[location] || location;
}

export const pricingApi = {
  /**
   * Calculate decoration pricing via the Job Estimator API
   */
  async calculate(request: {
    method: string;
    quantity: number;
    colors?: number;
    locations?: string[];
    stitchCount?: number;
    garmentType?: string;
    customerType?: string;
    rush?: boolean;
    setupNew?: boolean;
  }): Promise<PricingResult> {
    const apiRequest: PricingRequest = {
      quantity: request.quantity,
      service: mapMethodToService(request.method),
      print_locations: request.locations?.map(mapLocation) || ['front'],
      color_count: request.colors || 1,
      stitch_count: request.stitchCount,
      garment_type: request.garmentType as any,
      customer_type: request.customerType as any,
      rush: request.rush,
      setup_new: request.setupNew,
    };

    try {
      const response = await fetch(`${PRICING_API_URL}/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequest),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Pricing API error: ${response.status}`);
      }

      const data: PricingResponse = await response.json();

      return {
        unitPrice: data.total_price / request.quantity,
        totalPrice: data.total_price,
        subtotal: data.subtotal,
        marginPct: data.margin_pct,
        breakdown: data.breakdown,
        lineItems: data.line_items,
        calculationTimeMs: data.calculation_time_ms,
      };
    } catch (error) {
      console.error('Pricing API error:', error);
      // Return fallback pricing if API fails
      return getFallbackPricing(request.method, request.quantity, request.colors || 1);
    }
  },

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${PRICING_API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Get available decoration methods
   */
  getAvailableMethods(): Array<{ value: string; label: string }> {
    return [
      { value: 'screen-printing', label: 'Screen Printing' },
      { value: 'embroidery', label: 'Embroidery' },
      { value: 'dtg', label: 'DTG (Direct to Garment)' },
      { value: 'heat-transfer', label: 'Heat Transfer' },
      { value: 'dtf', label: 'DTF (Direct to Film)' },
      { value: 'sublimation', label: 'Sublimation' },
      { value: 'vinyl', label: 'Vinyl' },
    ];
  },

  /**
   * Get available print locations
   */
  getAvailableLocations(): Array<{ value: string; label: string }> {
    return [
      { value: 'front-center', label: 'Front Center' },
      { value: 'front-left-chest', label: 'Left Chest' },
      { value: 'front-right-chest', label: 'Right Chest' },
      { value: 'full-front', label: 'Full Front' },
      { value: 'back-center', label: 'Back Center' },
      { value: 'back-neck', label: 'Back Neck' },
      { value: 'full-back', label: 'Full Back' },
      { value: 'left-sleeve', label: 'Left Sleeve' },
      { value: 'right-sleeve', label: 'Right Sleeve' },
    ];
  },
};

/**
 * Fallback pricing if API is unavailable
 */
function getFallbackPricing(method: string, quantity: number, colors: number): PricingResult {
  const basePrices: Record<string, number> = {
    'screen-printing': 8,
    'screen': 8,
    'embroidery': 12,
    'dtg': 15,
    'heat-transfer': 10,
    'dtf': 12,
    'sublimation': 18,
    'vinyl': 8,
  };

  const colorPrices: Record<string, number> = {
    'screen-printing': 1.5,
    'screen': 1.5,
    'embroidery': 2,
    'dtg': 0,
    'heat-transfer': 0,
    'dtf': 0,
    'sublimation': 0,
    'vinyl': 0,
  };

  const basePrice = basePrices[method] || 8;
  const colorPrice = colorPrices[method] || 0;
  const unitPrice = basePrice + (colors * colorPrice);
  const subtotal = unitPrice * quantity;
  const marginPct = 35;
  const totalPrice = subtotal * 1.35;

  return {
    unitPrice: totalPrice / quantity,
    totalPrice,
    subtotal,
    marginPct,
    breakdown: {
      base_cost: subtotal,
      location_surcharges: 0,
      color_adjustments: colors * colorPrice * quantity,
      volume_discounts: 0,
      margin_amount: totalPrice - subtotal,
    },
    lineItems: [
      { description: `${method} x${quantity}`, unit_cost: unitPrice, qty: quantity, total: subtotal },
    ],
    calculationTimeMs: 0,
  };
}

export default pricingApi;
