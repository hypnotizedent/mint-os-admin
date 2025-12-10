/**
 * ProductDetailPage Component
 * Displays full product information including image gallery, pricing tiers,
 * color/size matrix, stock levels, and supplier information.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Package, 
  Truck, 
  Link as LinkIcon,
  Check,
  X as XIcon,
  CaretLeft,
  CaretRight,
  Info,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Product, ProductVariant } from './ProductsPage';

const SUPPLIER_DISPLAY: Record<string, string> = {
  'ascolour': 'AS Colour',
  'sanmar': 'SanMar',
  'ssactivewear': 'S&S Activewear'
};

const SUPPLIER_URLS: Record<string, string> = {
  'ascolour': 'https://www.ascolour.com',
  'sanmar': 'https://www.sanmar.com',
  'ssactivewear': 'https://www.ssactivewear.com',
};

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToQuote?: (product: Product, quantity: number) => void;
}

export function ProductDetailPage({ product, onBack, onAddToQuote }: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Get all images, including main image
  const allImages = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []);

  // Build size/color availability matrix
  const getVariantStock = (color: string, size: string): ProductVariant | undefined => {
    return product.variants.find(v => 
      v.color?.toLowerCase() === color.toLowerCase() && 
      v.size?.toLowerCase() === size.toLowerCase()
    );
  };

  // Get stock status for a color/size combination
  const getStockStatus = (color: string, size: string): 'in-stock' | 'low-stock' | 'out-of-stock' | 'unknown' => {
    const variant = getVariantStock(color, size);
    if (!variant) return 'unknown';
    if (!variant.inStock) return 'out-of-stock';
    if (variant.stockLevel !== undefined && variant.stockLevel < 10) return 'low-stock';
    return 'in-stock';
  };

  const handleAddToQuote = () => {
    if (onAddToQuote) {
      onAddToQuote(product, 1);
    }
    toast.success('Added to quote', {
      description: `${product.name} has been added to your quote.`,
    });
  };

  const openSupplierLink = () => {
    const baseUrl = SUPPLIER_URLS[product.supplier];
    if (baseUrl) {
      // Construct search URL - different for each supplier
      let url = baseUrl;
      if (product.supplier === 'sanmar') {
        url = `${baseUrl}/c/${product.sku}`;
      } else if (product.supplier === 'ssactivewear') {
        url = `${baseUrl}/p/${product.sku}`;
      } else if (product.supplier === 'ascolour') {
        url = `${baseUrl}/us/search?q=${encodeURIComponent(product.sku)}`;
      }
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft size={18} />
        Back to Catalog
      </Button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
            {allImages.length > 0 ? (
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={96} className="text-muted-foreground" />
              </div>
            )}
            
            {/* Image Navigation */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={() => setSelectedImage(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                >
                  <CaretLeft size={20} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={() => setSelectedImage(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                >
                  <CaretRight size={20} />
                </Button>
              </>
            )}
            
            {/* Stock Badge */}
            <div className="absolute top-4 left-4">
              {product.inStock === false ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : (
                <Badge variant="default" className="bg-green-600">In Stock</Badge>
              )}
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {SUPPLIER_DISPLAY[product.supplier] || product.supplier}
              </Badge>
              <Badge variant="outline">{product.brand}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-lg text-muted-foreground mt-1">SKU: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ${product.basePrice.toFixed(2)}
              </span>
              <span className="text-muted-foreground">per unit</span>
            </div>
            {product.pricingTiers && product.pricingTiers.length > 1 && (
              <p className="text-sm text-muted-foreground mt-1">
                Volume discounts available · As low as ${Math.min(...product.pricingTiers.map(t => t.price)).toFixed(2)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Available Colors */}
          <div>
            <h3 className="font-semibold mb-2">Available Colors ({product.colors.length})</h3>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(color => (
                <Badge 
                  key={color} 
                  variant={selectedColor === color ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                >
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          {/* Available Sizes */}
          <div>
            <h3 className="font-semibold mb-2">Available Sizes ({product.sizes.length})</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <Badge 
                  key={size} 
                  variant={selectedSize === size ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button size="lg" className="flex-1" onClick={handleAddToQuote}>
              <ShoppingCart className="mr-2" size={20} />
              Add to Quote
            </Button>
            <Button size="lg" variant="outline" onClick={openSupplierLink}>
              <LinkIcon className="mr-2" size={20} />
              View at Supplier
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs for Additional Info */}
      <Tabs defaultValue="pricing" className="mt-8">
        <TabsList>
          <TabsTrigger value="pricing">Pricing Tiers</TabsTrigger>
          <TabsTrigger value="availability">Size/Color Matrix</TabsTrigger>
          <TabsTrigger value="supplier">Supplier Info</TabsTrigger>
        </TabsList>

        {/* Pricing Tiers Tab */}
        <TabsContent value="pricing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Volume Pricing</CardTitle>
              <CardDescription>
                Prices decrease based on order quantity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.pricingTiers && product.pricingTiers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price per Unit</TableHead>
                      <TableHead>Savings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.pricingTiers
                      .sort((a, b) => a.minQty - b.minQty)
                      .map((tier, idx) => {
                        const savings = product.basePrice - tier.price;
                        const savingsPercent = (savings / product.basePrice) * 100;
                        return (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {tier.minQty}+ units
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              ${tier.price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {savings > 0 ? (
                                <span className="text-green-600">
                                  Save ${savings.toFixed(2)} ({savingsPercent.toFixed(0)}%)
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Base price</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info size={32} className="mx-auto mb-2" />
                  <p>No volume pricing available for this product.</p>
                  <p className="text-sm mt-1">Contact us for bulk order discounts.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Size/Color Matrix Tab */}
        <TabsContent value="availability" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Availability</CardTitle>
              <CardDescription>
                Check availability by color and size
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background">Color</TableHead>
                        {product.sizes.map(size => (
                          <TableHead key={size} className="text-center min-w-[60px]">
                            {size}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.colors.map(color => (
                        <TableRow key={color}>
                          <TableCell className="sticky left-0 bg-background font-medium">
                            {color}
                          </TableCell>
                          {product.sizes.map(size => {
                            const status = getStockStatus(color, size);
                            const variant = getVariantStock(color, size);
                            return (
                              <TableCell key={size} className="text-center">
                                {status === 'in-stock' && (
                                  <Check size={18} className="mx-auto text-green-600" />
                                )}
                                {status === 'low-stock' && (
                                  <span className="text-amber-600 text-xs font-medium">
                                    {variant?.stockLevel || 'Low'}
                                  </span>
                                )}
                                {status === 'out-of-stock' && (
                                  <XIcon size={18} className="mx-auto text-red-500" />
                                )}
                                {status === 'unknown' && (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package size={32} className="mx-auto mb-2" />
                  <p>Stock matrix not available for this product.</p>
                  <p className="text-sm mt-1">Check with supplier for current availability.</p>
                </div>
              )}
              
              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t text-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-600" />
                  <span>In Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-medium text-xs">Low</span>
                  <span>Low Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <XIcon size={16} className="text-red-500" />
                  <span>Out of Stock</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Info Tab */}
        <TabsContent value="supplier" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
              <CardDescription>
                Product sourcing and reordering details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{SUPPLIER_DISPLAY[product.supplier] || product.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{product.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium font-mono">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{product.category}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-4">
                <Truck size={24} className="text-muted-foreground" />
                <div>
                  <p className="font-medium">Reorder from Supplier</p>
                  <p className="text-sm text-muted-foreground">
                    Click below to view this product on the supplier's website
                  </p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" onClick={openSupplierLink}>
                <LinkIcon className="mr-2" size={16} />
                Open {SUPPLIER_DISPLAY[product.supplier] || product.supplier} Website
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
