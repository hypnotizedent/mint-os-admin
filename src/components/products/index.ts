/**
 * Products Module Exports
 * 
 * Components for product catalog management:
 * - ProductsPage: Full product catalog with pagination, search, filters
 * - ProductDetailPage: Detailed product view with pricing tiers
 * - ProductSearch: Autocomplete search for QuoteBuilder integration
 * - ProductCatalog: Legacy catalog component (deprecated - use ProductsPage)
 */

export { ProductsPage } from './ProductsPage';
export { ProductDetailPage } from './ProductDetailPage';
export { ProductSearch } from './ProductSearch';
export { ProductCatalog } from './ProductCatalog';

// Re-export types
export type { Product, ProductVariant } from './ProductsPage';
