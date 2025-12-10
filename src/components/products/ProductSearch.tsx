/**
 * ProductSearch Component
 * Autocomplete search component for selecting products in QuoteBuilder.
 * Uses the curated supplier catalog (500 most-ordered products).
 * Shows thumbnail, name, SKU, brand and price as you type.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MagnifyingGlass,
  Package,
  X,
  Check,
} from '@phosphor-icons/react';
import type { Product } from './ProductsPage';

// Dashboard API for supplier data (curated 500 products)
const DASHBOARD_API = import.meta.env.VITE_DASHBOARD_API_URL || 'http://localhost:3335';

// Supplier API response types
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

interface ProductSearchProps {
  onSelect: (product: Product) => void;
  selectedProduct?: Product | null;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function ProductSearch({ 
  onSelect, 
  selectedProduct, 
  onClear,
  placeholder = 'Search products by name or SKU...',
  className = '',
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load popular products on initial focus
  const loadPopularProducts = useCallback(async () => {
    if (results.length > 0) return; // Don't reload if we have results
    setIsLoading(true);
    try {
      const response = await fetch(`${DASHBOARD_API}/api/supplier/top-products?limit=8`);
      if (!response.ok) throw new Error('Failed to load popular products');
      const data = await response.json();

      const transformed: Product[] = (data.products || []).map((item: SupplierProductResponse) => ({
        id: 0,
        documentId: item.sku,
        name: item.name,
        sku: item.sku,
        brand: item.brand,
        category: item.category,
        description: '',
        basePrice: item.basePrice,
        imageUrl: '',
        colors: item.colors?.map(c => c.name) || [],
        sizes: item.sizes?.map(s => s.name) || [],
        variants: [],
        supplier: item.supplier,
        inStock: true,
      }));
      setResults(transformed);
    } catch (error) {
      console.error('Failed to load popular products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [results.length]);

  // Search products with debounce using supplier API
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${DASHBOARD_API}/api/supplier/search?q=${encodeURIComponent(query)}&limit=10`
        );

        if (!response.ok) throw new Error('Failed to search products');

        const data = await response.json();

        // Transform supplier API response to Product type
        const transformed: Product[] = (data.products || []).map((item: SupplierProductResponse) => ({
          id: 0,
          documentId: item.sku,
          name: item.name,
          sku: item.sku,
          brand: item.brand,
          category: item.category,
          description: '',
          basePrice: item.basePrice,
          imageUrl: '',
          colors: item.colors?.map(c => c.name) || [],
          sizes: item.sizes?.map(s => s.name) || [],
          variants: [],
          supplier: item.supplier,
          inStock: true,
        }));
        setResults(transformed);
        setIsOpen(true);
        setFocusedIndex(-1);
      } catch (error) {
        console.error('Product search failed:', error);
        setResults([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback((product: Product) => {
    onSelect(product);
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < results.length) {
          handleSelect(results[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }, [isOpen, results, focusedIndex, handleSelect]);

  const handleClear = () => {
    if (onClear) onClear();
    setQuery('');
    inputRef.current?.focus();
  };

  // If a product is selected, show it instead of search
  if (selectedProduct) {
    return (
      <div className={`relative ${className}`}>
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
              {selectedProduct.imageUrl ? (
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={20} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{selectedProduct.name}</span>
                <Check size={16} className="text-green-600 flex-shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedProduct.brand} · {selectedProduct.sku} · ${selectedProduct.basePrice.toFixed(2)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X size={16} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlass 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          size={18} 
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            if (query.length < 2) loadPopularProducts();
          }}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 py-1 max-h-[320px] overflow-auto shadow-lg">
          {isLoading ? (
            <div className="p-2 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-12 h-12 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Package size={32} className="mx-auto mb-2" />
              <p className="text-sm">
                {query.length >= 2
                  ? `No products found for "${query}"`
                  : 'Start typing to search products...'}
              </p>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b">
                {query.length < 2 ? 'Popular Products' : 'Search Results'}
              </div>
              {results.map((product, index) => (
                <button
                  key={product.sku}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left ${
                    focusedIndex === index ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSelect(product)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="w-12 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Package size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{product.name}</span>
                      {product.inStock === false && (
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.brand} · {product.sku}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-primary">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <p className="text-xs text-muted-foreground">per unit</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
