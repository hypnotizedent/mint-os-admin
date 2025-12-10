/**
 * ProductCatalog Component
 * Browse supplier products from AS Colour, SanMar, S&S Activewear.
 * Features search, filtering by brand/category/color, and product details.
 */
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MagnifyingGlass, Funnel, Package, ShoppingCart, ArrowClockwise, X } from '@phosphor-icons/react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

interface ProductVariant {
  sku: string;
  color: string;
  size: string;
  price: number;
  inStock: boolean;
}

interface Product {
  id: number;
  documentId: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  colors: string[];
  sizes: string[];
  variants: ProductVariant[];
  supplier: string;
}

interface FilterState {
  search: string;
  brand: string;
  category: string;
  color: string;
  supplier: string;
}

const BRANDS = ['All Brands', 'Gildan', 'Bella+Canvas', 'Next Level', 'AS Colour', 'Comfort Colors', 'Champion', 'Hanes', 'Port & Company', 'Port Authority', 'Sport-Tek'];
const CATEGORIES = ['All Categories', 't-shirts', 'hoodies', 'polos', 'sweatshirts', 'jackets', 'hats', 'bags', 'accessories'];
const SUPPLIERS = ['All Suppliers', 'ascolour', 'sanmar', 'ssactivewear'];

// Map for display names
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

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    brand: 'All Brands',
    category: 'All Categories',
    color: '',
    supplier: 'All Suppliers',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/products?pagination[limit]=100`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      
      // Transform Strapi response (empty array if no products)
      const transformed: Product[] = (data.data || []).map((item: any) => {
        // Extract colors from variants
        const variantColors = (item.variants || [])
          .map((v: any) => v.color?.name)
          .filter((c: string | undefined) => c);
        const uniqueColors = [...new Set(variantColors)] as string[];
        
        // Extract sizes from variants
        const variantSizes = (item.variants || [])
          .map((v: any) => v.size)
          .filter((s: string | undefined) => s);
        const uniqueSizes = [...new Set(variantSizes)] as string[];
        
        // Get primary image
        const primaryImage = item.images?.[0] || '';
        const imageUrl = primaryImage.startsWith('http') 
          ? primaryImage 
          : primaryImage 
            ? `https://cdnm.sanmar.com/imglib/mresjpg/${primaryImage}`
            : '';
        
        return {
          id: item.id,
          documentId: item.documentId,
          name: item.name || 'Unknown Product',
          sku: item.sku || '',
          brand: item.brand || 'Generic',
          category: item.category || 'Uncategorized',
          description: item.description || '',
          basePrice: parseFloat(item.pricing?.basePrice) || 0,
          imageUrl: imageUrl,
          colors: uniqueColors.length > 0 ? uniqueColors : (item.colors || []),
          sizes: uniqueSizes.length > 0 ? uniqueSizes : (item.sizes || []),
          variants: item.variants || [],
          supplier: item.supplier || 'Unknown',
        };
      });
      
      setProducts(transformed);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products from catalog.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(search) ||
          product.sku.toLowerCase().includes(search) ||
          product.brand.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      
      // Brand filter
      if (filters.brand !== 'All Brands' && product.brand !== filters.brand) {
        return false;
      }
      
      // Category filter
      if (filters.category !== 'All Categories' && product.category !== filters.category) {
        return false;
      }
      
      // Supplier filter
      if (filters.supplier !== 'All Suppliers' && product.supplier !== filters.supplier) {
        return false;
      }

      // Category filter - match against lowercase enum value
      if (filters.category !== 'All Categories') {
        const productCategory = product.category?.toLowerCase();
        const filterCategory = filters.category.toLowerCase();
        if (productCategory !== filterCategory) {
          return false;
        }
      }
      
      // Color filter
      if (filters.color && !product.colors.some(c => 
        c.toLowerCase().includes(filters.color.toLowerCase())
      )) {
        return false;
      }
      
      return true;
    });
  }, [products, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: 'All Brands',
      category: 'All Categories',
      color: '',
      supplier: 'All Suppliers',
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.brand !== 'All Brands' || 
    filters.category !== 'All Categories' ||
    filters.color ||
    filters.supplier !== 'All Suppliers';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse products from AS Colour, SanMar, and S&S Activewear
          </p>
        </div>
        <Button variant="outline" onClick={fetchProducts} disabled={isLoading}>
          <ArrowClockwise className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
          Refresh
        </Button>
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
            <div className="w-[180px]">
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
            <div className="w-[180px]">
              <Select
                value={filters.category}
                onValueChange={(v) => setFilters(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue>{filters.category === 'All Categories' ? 'All Categories' : (CATEGORY_DISPLAY[filters.category] || filters.category)}</SelectValue>
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
            <div className="w-[180px]">
              <Select
                value={filters.supplier}
                onValueChange={(v) => setFilters(prev => ({ ...prev, supplier: v }))}
              >
                <SelectTrigger>
                  <SelectValue>{filters.supplier === 'All Suppliers' ? 'All Suppliers' : (SUPPLIER_DISPLAY[filters.supplier] || filters.supplier)}</SelectValue>
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

            {/* Color */}
            <div className="w-[150px]">
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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Package size={16} />
        <span>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted" />
              <CardContent className="pt-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-5 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Dialog key={product.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group">
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
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      {SUPPLIER_DISPLAY[product.supplier] || product.supplier}
                    </Badge>
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
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{product.name}</DialogTitle>
                  <DialogDescription>
                    {product.brand} · SKU: {product.sku}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={80} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ${product.basePrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Base price per unit</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.description || 'No description available'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available Colors</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.map(color => (
                          <Badge key={color} variant="outline">{color}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available Sizes</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map(size => (
                          <Badge key={size} variant="secondary">{size}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button className="w-full">
                        <ShoppingCart className="mr-2" size={16} />
                        Add to Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
