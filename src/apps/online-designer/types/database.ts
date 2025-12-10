
export interface ShopifyInstallation {
  id: string;
  shop_domain: string;
  access_token: string;
  installed_at: string;
  status: 'active' | 'uninstalled';
  settings?: any;
  created_at: string;
  updated_at: string;
}

export type GarmentType = 't-shirt' | 'hoodie' | 'tank-top' | 'long-sleeve' | 'polo' | 'sweatshirt' | 'hat' | 'jacket';
export type GarmentSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL';
export type PrintMethod = 'screen-print' | 'dtg' | 'embroidery' | 'heat-transfer' | 'sublimation';
export type PrintPlacement = 'front' | 'back' | 'left-chest' | 'right-chest' | 'full-front' | 'full-back' | 'sleeve-left' | 'sleeve-right';

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
}

export interface PricingTier {
  minQty: number;
  maxQty: number;
  pricePerUnit: number;
}

export interface PricingBreakdown {
  basePrice: number;
  garmentCost: number;
  printCost: number;
  setupFee: number;
  colorFees: number;
  rushFee: number;
  discount: number;
  subtotal: number;
  total: number;
  perUnitPrice: number;
}

export interface DesignElement {
  id: string;
  type: 'image' | 'text' | 'shape';
  placement: PrintPlacement;
  data: any;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export interface DesignSession {
  id: string;
  shop_domain?: string;
  product_id?: string;
  customer_id?: string;
  customer_email?: string;
  garment_type: GarmentType;
  garment_color: string;
  garment_size: GarmentSize;
  print_method: PrintMethod;
  quantity: number;
  designs: DesignElement[];
  canvas_data?: any;
  pricing: PricingBreakdown;
  status: 'active' | 'completed' | 'abandoned' | 'draft' | 'quoted' | 'ordered';
  mockup_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomOrder {
  id: string;
  session_id: string;
  shop_domain?: string;
  customer_id?: string;
  customer_email?: string;
  shopify_order_id?: string;
  garment_type: GarmentType;
  garment_color: string;
  garment_size: GarmentSize;
  print_method: PrintMethod;
  quantity: number;
  designs: DesignElement[];
  pricing: PricingBreakdown;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  production_files?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DesignAsset {
  id: string;
  session_id: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface SavedDesign {
  id: string;
  name: string;
  customer_id?: string;
  customer_email?: string;
  thumbnail_url?: string;
  canvas_data: any;
  garment_type: GarmentType;
  garment_color: string;
  created_at: string;
  updated_at: string;
}

// Font options for text editor
export const AVAILABLE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Palatino',
  'Garamond',
  'Bookman',
  'Tahoma',
  'Lucida Console',
] as const;

// Garment colors
export const GARMENT_COLORS: GarmentColor[] = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'navy', name: 'Navy', hex: '#1e3a5f' },
  { id: 'red', name: 'Red', hex: '#dc2626' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#1d4ed8' },
  { id: 'forest-green', name: 'Forest Green', hex: '#166534' },
  { id: 'heather-gray', name: 'Heather Gray', hex: '#9ca3af' },
  { id: 'charcoal', name: 'Charcoal', hex: '#374151' },
  { id: 'maroon', name: 'Maroon', hex: '#7f1d1d' },
  { id: 'orange', name: 'Orange', hex: '#ea580c' },
  { id: 'gold', name: 'Gold', hex: '#ca8a04' },
  { id: 'purple', name: 'Purple', hex: '#7c3aed' },
  { id: 'pink', name: 'Pink', hex: '#ec4899' },
  { id: 'light-blue', name: 'Light Blue', hex: '#38bdf8' },
  { id: 'sand', name: 'Sand', hex: '#d4a574' },
];

// Pricing tiers for quantity discounts
export const QUANTITY_TIERS: PricingTier[] = [
  { minQty: 1, maxQty: 11, pricePerUnit: 0 },      // Base price
  { minQty: 12, maxQty: 35, pricePerUnit: -2 },   // $2 off per unit
  { minQty: 36, maxQty: 71, pricePerUnit: -4 },   // $4 off per unit
  { minQty: 72, maxQty: Infinity, pricePerUnit: -6 }, // $6 off per unit
];

// Base prices by garment type
export const BASE_GARMENT_PRICES: Record<GarmentType, number> = {
  't-shirt': 19.99,
  'hoodie': 39.99,
  'tank-top': 16.99,
  'long-sleeve': 24.99,
  'polo': 29.99,
  'sweatshirt': 34.99,
  'hat': 24.99,
  'jacket': 49.99,
};

// Print method surcharges
export const PRINT_METHOD_PRICES: Record<PrintMethod, { setup: number; perColor: number }> = {
  'screen-print': { setup: 25, perColor: 15 },
  'dtg': { setup: 0, perColor: 0 },
  'embroidery': { setup: 35, perColor: 10 },
  'heat-transfer': { setup: 15, perColor: 5 },
  'sublimation': { setup: 10, perColor: 0 },
};
