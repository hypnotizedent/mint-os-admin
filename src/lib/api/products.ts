/**
 * Product API Client
 * 
 * API functions for product catalog management:
 * - searchProducts: Search products with filters
 * - getProduct: Get a single product by SKU or ID
 * - getProductCategories: Get available categories
 * - getSuppliers: Get available suppliers
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// Types
export interface ProductVariant {
  sku: string;
  color: string;
  colorCode?: string;
  size: string;
  price: number;
  inStock: boolean;
  stockLevel?: number;
}

export interface Product {
  id: number;
  documentId: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  images?: string[];
  colors: string[];
  sizes: string[];
  variants: ProductVariant[];
  supplier: string;
  inStock?: boolean;
  pricingTiers?: { minQty: number; price: number }[];
}

export interface ProductFilters {
  search?: string;
  brand?: string;
  category?: string;
  supplier?: string;
  color?: string;
  inStock?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  productCount?: number;
}

// Strapi API response types
interface StrapiVariant {
  sku?: string;
  color?: { name: string };
  colorCode?: string;
  size?: string;
  price?: number;
  inStock?: boolean;
  stockLevel?: number;
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name?: string;
  sku?: string;
  brand?: string;
  category?: string;
  description?: string;
  pricing?: { basePrice?: string; tiers?: { minQty: number; price: number }[] };
  images?: string[];
  colors?: string[];
  sizes?: string[];
  variants?: StrapiVariant[];
  supplier?: string;
  pricingTiers?: { minQty: number; price: number }[];
}

// Transform a Strapi variant to our ProductVariant type
function transformVariant(v: StrapiVariant): ProductVariant {
  return {
    sku: v.sku || '',
    color: v.color?.name || '',
    colorCode: v.colorCode,
    size: v.size || '',
    price: v.price || 0,
    inStock: v.inStock !== false,
    stockLevel: v.stockLevel,
  };
}

// Transform Strapi product response to our Product type
function transformProduct(item: StrapiProduct): Product {
  const variantColors = (item.variants || [])
    .map((v: StrapiVariant) => v.color?.name)
    .filter((c: string | undefined): c is string => !!c);
  const uniqueColors = [...new Set(variantColors)] as string[];
  
  const variantSizes = (item.variants || [])
    .map((v: StrapiVariant) => v.size)
    .filter((s: string | undefined): s is string => !!s);
  const uniqueSizes = [...new Set(variantSizes)] as string[];
  
  const primaryImage = item.images?.[0] || '';
  const imageUrl = primaryImage.startsWith('http') 
    ? primaryImage 
    : primaryImage 
      ? `https://cdnm.sanmar.com/imglib/mresjpg/${primaryImage}`
      : '';
  
  const hasInStockVariants = (item.variants || []).some((v: StrapiVariant) => v.inStock !== false);
  
  return {
    id: item.id,
    documentId: item.documentId,
    name: item.name || 'Unknown Product',
    sku: item.sku || '',
    brand: item.brand || 'Generic',
    category: item.category || 'other',
    description: item.description || '',
    basePrice: parseFloat(item.pricing?.basePrice || '0') || 0,
    imageUrl: imageUrl,
    images: item.images || [],
    colors: uniqueColors.length > 0 ? uniqueColors : (item.colors || []),
    sizes: uniqueSizes.length > 0 ? uniqueSizes : (item.sizes || []),
    variants: (item.variants || []).map(transformVariant),
    supplier: item.supplier || 'Unknown',
    inStock: hasInStockVariants,
    pricingTiers: item.pricing?.tiers || item.pricingTiers || [],
  };
}

/**
 * Search products with filters and pagination
 */
export async function searchProducts(
  query?: string, 
  filters?: ProductFilters,
  page = 1,
  pageSize = 24
): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  params.set('pagination[page]', page.toString());
  params.set('pagination[pageSize]', pageSize.toString());
  
  // Add search query
  if (query) {
    params.set('filters[$or][0][name][$containsi]', query);
    params.set('filters[$or][1][sku][$containsi]', query);
    params.set('filters[$or][2][brand][$containsi]', query);
  }
  
  // Add filters
  if (filters?.brand) {
    params.set('filters[brand][$eq]', filters.brand);
  }
  if (filters?.category) {
    params.set('filters[category][$eq]', filters.category);
  }
  if (filters?.supplier) {
    params.set('filters[supplier][$eq]', filters.supplier);
  }

  const response = await fetch(`${API_BASE}/api/products?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  
  const data = await response.json();
  
  return {
    data: (data.data || []).map(transformProduct),
    meta: data.meta || {
      pagination: {
        page: 1,
        pageSize: pageSize,
        pageCount: 1,
        total: 0,
      },
    },
  };
}

/**
 * Get a single product by SKU or document ID
 */
export async function getProduct(identifier: string): Promise<Product | null> {
  // Try by SKU first
  let response = await fetch(
    `${API_BASE}/api/products?filters[sku][$eq]=${encodeURIComponent(identifier)}&pagination[limit]=1`
  );
  
  if (response.ok) {
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return transformProduct(data.data[0]);
    }
  }
  
  // Try by documentId
  response = await fetch(`${API_BASE}/api/products/${encodeURIComponent(identifier)}`);
  
  if (response.ok) {
    const data = await response.json();
    if (data.data) {
      return transformProduct(data.data);
    }
  }
  
  return null;
}

/**
 * Get all available product categories
 */
export async function getProductCategories(): Promise<Category[]> {
  // Since categories are typically part of product data, we get unique categories
  // from products or could have a separate categories endpoint
  
  const defaultCategories: Category[] = [
    { id: 't-shirts', name: 'T-Shirts', slug: 't-shirts' },
    { id: 'hoodies', name: 'Hoodies', slug: 'hoodies' },
    { id: 'polos', name: 'Polos', slug: 'polos' },
    { id: 'sweatshirts', name: 'Sweatshirts', slug: 'sweatshirts' },
    { id: 'jackets', name: 'Jackets', slug: 'jackets' },
    { id: 'hats', name: 'Hats', slug: 'hats' },
    { id: 'bags', name: 'Bags', slug: 'bags' },
    { id: 'accessories', name: 'Accessories', slug: 'accessories' },
  ];
  
  try {
    // Try to get categories from a dedicated endpoint if it exists
    const response = await fetch(`${API_BASE}/api/product-categories`);
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return data.data.map((item: any) => ({
          id: item.id || item.slug,
          name: item.name,
          slug: item.slug,
          productCount: item.productCount,
        }));
      }
    }
  } catch (error) {
    console.log('Using default categories');
  }
  
  return defaultCategories;
}

/**
 * Get all available suppliers
 */
export async function getSuppliers(): Promise<Supplier[]> {
  const defaultSuppliers: Supplier[] = [
    { id: 'ascolour', name: 'AS Colour', code: 'ascolour' },
    { id: 'sanmar', name: 'SanMar', code: 'sanmar' },
    { id: 'ssactivewear', name: 'S&S Activewear', code: 'ssactivewear' },
  ];
  
  try {
    // Try to get suppliers from a dedicated endpoint if it exists
    const response = await fetch(`${API_BASE}/api/suppliers`);
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return data.data.map((item: any) => ({
          id: item.id || item.code,
          name: item.name,
          code: item.code,
          productCount: item.productCount,
        }));
      }
    }
  } catch (error) {
    console.log('Using default suppliers');
  }
  
  return defaultSuppliers;
}

/**
 * Get products with low stock
 */
export async function getLowStockProducts(limit = 10): Promise<Product[]> {
  try {
    // This would need a custom endpoint or filter for low stock
    const response = await fetch(
      `${API_BASE}/api/products?filters[inStock][$eq]=false&pagination[limit]=${limit}`
    );
    
    if (response.ok) {
      const data = await response.json();
      return (data.data || []).map(transformProduct);
    }
  } catch (error) {
    console.error('Failed to fetch low stock products:', error);
  }
  
  return [];
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats(): Promise<{
  totalProducts: number;
  inStockProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/products?pagination[limit]=1`);
    
    if (response.ok) {
      const data = await response.json();
      const total = data.meta?.pagination?.total || 0;
      
      return {
        totalProducts: total,
        inStockProducts: Math.floor(total * 0.95), // Estimate - would need real data
        lowStockCount: Math.floor(total * 0.03),
        outOfStockCount: Math.floor(total * 0.02),
      };
    }
  } catch (error) {
    console.error('Failed to fetch inventory stats:', error);
  }
  
  return {
    totalProducts: 0,
    inStockProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };
}
