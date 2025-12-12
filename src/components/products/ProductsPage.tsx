/**
 * ProductsPage Component
 * Full-featured product catalog with pagination, search, and filtering.
 * Uses the curated supplier catalog (500 most-ordered products).
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import {
  MagnifyingGlass,
  Package,
  ArrowClockwise,
  X,
  List,
  SquaresFour,
  CaretRight
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ProductDetailPage } from './ProductDetailPage';

// Dashboard API for supplier data (curated 500 products)
const DASHBOARD_API = import.meta.env.VITE_DASHBOARD_API_URL || '';
const PAGE_SIZE = 24; // Items per page

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

interface ProductFilters {
  search: string;
  brand: string;
  category: string;
  color: string;
  supplier: string;
  inStock: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// API Response types for Supplier API
interface SupplierProductResponse {
  sku: string;
  name: string;
  brand: string;
  supplier: string;
  category: string;
  basePrice: number;
  currency: string;
  colors?: Array<{ name: string; code?: string; hex?: string }>;
  sizes?: Array<{ name: string; sortOrder?: number }>;
  priceBreaks?: Array<{ minQty: number; maxQty?: number; price: number }>;
}

const BRANDS = ['All Brands', 'Gildan', 'Bella+Canvas', 'Next Level', 'AS Colour', 'Comfort Colors', 'Champion', 'Hanes', 'Port & Company', 'Port Authority', 'Sport-Tek'];
const CATEGORIES = ['All Categories', 't-shirts', 'hoodies', 'polos', 'sweatshirts', 'jackets', 'hats', 'bags', 'accessories'];
const SUPPLIERS = ['All Suppliers', 'ascolour', 'sanmar', 'ssactivewear'];
const STOCK_OPTIONS = ['All Stock', 'In Stock', 'Out of Stock'];

const SUPPLIER_DISPLAY: Record<string, string> = {
  'ascolour': 'AS Colour',
  'sanmar': 'SanMar',
  'ssactivewear': 'S&S Activewear'
};

const CATEGORY_DISPLAY: Record<string, string> = {
  't-shirts': 'T-Shirts',
  'hoodies': 'Hoodies',
  'polos': 'Polos',
  'sweatshirts': 'Sweatshirts',
  'jackets': 'Jackets',
  'hats': 'Hats',
  'bags': 'Bags',
  'accessories': 'Accessories',
  'other': 'Other'
};

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    brand: 'All Brands',
    category: 'All Categories',
    color: '',
    supplier: 'All Suppliers',
    inStock: 'All Stock',
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: PAGE_SIZE,
    pageCount: 1,
    total: 0,
  });
  const [searchDebounce, setSearchDebounce] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch products with pagination and filters using Supplier API
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // Build query params for supplier API
      const params = new URLSearchParams();
      params.set('limit', '500'); // Get all products for client-side pagination

      // Use search endpoint if searching, otherwise top-products
      let endpoint = `${DASHBOARD_API}/api/supplier/top-products`;

      if (searchDebounce) {
        endpoint = `${DASHBOARD_API}/api/supplier/search`;
        params.set('q', searchDebounce);
      }

      // Add server-side filters if supported
      if (filters.brand !== 'All Brands') {
        params.set('brand', filters.brand);
      }
      if (filters.category !== 'All Categories') {
        params.set('category', filters.category);
      }
      if (filters.supplier !== 'All Suppliers') {
        params.set('supplier', filters.supplier);
      }

      const response = await fetch(`${endpoint}?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();

      // Transform Supplier API response to Product type
      const transformed: Product[] = (data.products || []).map((item: SupplierProductResponse, index: number) => {
        return {
          id: index + 1, // Generate ID since supplier API doesn't have one
          documentId: item.sku,
          name: item.name || 'Unknown Product',
          sku: item.sku || '',
          brand: item.brand || 'Generic',
          category: item.category || 'other',
          description: '',
          basePrice: item.basePrice || 0,
          imageUrl: '', // Supplier API doesn't provide images
          images: [],
          colors: item.colors?.map(c => c.name) || [],
          sizes: item.sizes?.map(s => s.name) || [],
          variants: [] as ProductVariant[],
          supplier: item.supplier || 'Unknown',
          inStock: true, // Assume in stock for curated products
          pricingTiers: item.priceBreaks?.map(pb => ({
            minQty: pb.minQty,
            price: pb.price
          })) || [],
        };
      });

      // Apply client-side filtering for color and stock
      let filteredProducts = transformed;

      // Filter by brand (client-side if not filtered server-side)
      if (filters.brand !== 'All Brands' && !params.has('brand')) {
        filteredProducts = filteredProducts.filter(p =>
          p.brand.toLowerCase() === filters.brand.toLowerCase()
        );
      }

      // Filter by category
      if (filters.category !== 'All Categories' && !params.has('category')) {
        filteredProducts = filteredProducts.filter(p =>
          p.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      // Filter by supplier
      if (filters.supplier !== 'All Suppliers' && !params.has('supplier')) {
        filteredProducts = filteredProducts.filter(p =>
          p.supplier.toLowerCase() === filters.supplier.toLowerCase()
        );
      }

      // Filter by color
      if (filters.color) {
        filteredProducts = filteredProducts.filter(p =>
          p.colors.some(c => c.toLowerCase().includes(filters.color.toLowerCase()))
        );
      }

      // Filter by stock status
      if (filters.inStock === 'In Stock') {
        filteredProducts = filteredProducts.filter(p => p.inStock);
      } else if (filters.inStock === 'Out of Stock') {
        filteredProducts = filteredProducts.filter(p => !p.inStock);
      }

      // Calculate pagination
      const total = filteredProducts.length;
      const pageCount = Math.ceil(total / PAGE_SIZE);
      const startIndex = (page - 1) * PAGE_SIZE;
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);

      setProducts(paginatedProducts);
      setPagination({
        page: page,
        pageSize: PAGE_SIZE,
        pageCount: pageCount,
        total: total,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products from catalog.');
      setProducts([]);
      setPagination({
        page: 1,
        pageSize: PAGE_SIZE,
        pageCount: 1,
        total: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchDebounce, filters.brand, filters.category, filters.supplier, filters.color, filters.inStock]);

  // Fetch on filter/page change
  useEffect(() => {
    fetchProducts(pagination.page);
  }, [fetchProducts, pagination.page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounce, filters.brand, filters.category, filters.supplier, filters.color, filters.inStock]);

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: 'All Brands',
      category: 'All Categories',
      color: '',
      supplier: 'All Suppliers',
      inStock: 'All Stock',
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.brand !== 'All Brands' || 
    filters.category !== 'All Categories' ||
    filters.color ||
    filters.supplier !== 'All Suppliers' ||
    filters.inStock !== 'All Stock';

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const { page, pageCount } = pagination;
    
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (page > 3) pages.push('ellipsis');
      
      for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) {
        pages.push(i);
      }
      
      if (page < pageCount - 2) pages.push('ellipsis');
      
      if (pageCount > 1) pages.push(pageCount);
    }
    
    return pages;
  };

  // If a product is selected, show detail page
  if (selectedProduct) {
    return (
      <ProductDetailPage 
        product={selectedProduct} 
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse products from AS Colour, SanMar, and S&S Activewear
            {pagination.total > 0 && ` · ${pagination.total.toLocaleString()} products`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <SquaresFour size={16} />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List size={16} />
            </Button>
          </div>
          <Button variant="outline" onClick={() => fetchProducts(pagination.page)} disabled={isLoading}>
            <ArrowClockwise className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search products, SKUs..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            {/* Brand */}
            <div className="w-[160px]">
              <Select
                value={filters.brand}
                onValueChange={(v) => setFilters(prev => ({ ...prev, brand: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="w-[160px]">
              <Select
                value={filters.category}
                onValueChange={(v) => setFilters(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue>
                    {filters.category === 'All Categories' ? 'All Categories' : (CATEGORY_DISPLAY[filters.category] || filters.category)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'All Categories' ? cat : (CATEGORY_DISPLAY[cat] || cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supplier */}
            <div className="w-[160px]">
              <Select
                value={filters.supplier}
                onValueChange={(v) => setFilters(prev => ({ ...prev, supplier: v }))}
              >
                <SelectTrigger>
                  <SelectValue>
                    {filters.supplier === 'All Suppliers' ? 'All Suppliers' : (SUPPLIER_DISPLAY[filters.supplier] || filters.supplier)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIERS.map(sup => (
                    <SelectItem key={sup} value={sup}>
                      {sup === 'All Suppliers' ? sup : (SUPPLIER_DISPLAY[sup] || sup)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* In Stock */}
            <div className="w-[140px]">
              <Select
                value={filters.inStock}
                onValueChange={(v) => setFilters(prev => ({ ...prev, inStock: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STOCK_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="w-[140px]">
              <Input
                placeholder="Filter by color"
                value={filters.color}
                onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2" size={14} />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Package size={16} />
          <span>
            {isLoading ? 'Loading...' : `${products.length} of ${pagination.total.toLocaleString()} products`}
          </span>
        </div>
        {pagination.pageCount > 1 && (
          <span>Page {pagination.page} of {pagination.pageCount}</span>
        )}
      </div>

      {/* Product Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {[...Array(8)].map((_, i) => (
            viewMode === 'grid' ? (
              <Card key={i}>
                <Skeleton className="aspect-[3/4]" />
                <CardContent className="pt-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/4" />
                </CardContent>
              </Card>
            ) : (
              <Card key={i} className="flex">
                <Skeleton className="w-32 h-32" />
                <CardContent className="flex-1 py-4 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            )
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={64} className="text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 left-2 right-2 flex justify-between">
                  <Badge variant="secondary">
                    {SUPPLIER_DISPLAY[product.supplier] || product.supplier}
                  </Badge>
                  {product.inStock === false && (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
              </div>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                <h3 className="font-medium line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ${product.basePrice.toFixed(2)}
                  </span>
                  <Badge variant="outline">{CATEGORY_DISPLAY[product.category] || product.category}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.colors.slice(0, 4).map(color => (
                    <Badge key={color} variant="secondary" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                  {product.colors.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{product.colors.length - 4}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex">
                <div className="w-32 h-32 bg-muted flex-shrink-0 relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="flex-1 py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {SUPPLIER_DISPLAY[product.supplier] || product.supplier}
                      </Badge>
                      {product.inStock === false && (
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.brand} · {product.sku} · {CATEGORY_DISPLAY[product.category] || product.category}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {product.colors.slice(0, 6).map(color => (
                        <Badge key={color} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                      {product.colors.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.colors.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">
                        ${product.basePrice.toFixed(2)}
                      </span>
                      <p className="text-xs text-muted-foreground">per unit</p>
                    </div>
                    <CaretRight size={20} className="text-muted-foreground" />
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(pagination.page - 1)}
                className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {getPageNumbers().map((pageNum, idx) => (
              <PaginationItem key={idx}>
                {pageNum === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink 
                    isActive={pageNum === pagination.page}
                    onClick={() => handlePageChange(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(pagination.page + 1)}
                className={pagination.page === pagination.pageCount ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
