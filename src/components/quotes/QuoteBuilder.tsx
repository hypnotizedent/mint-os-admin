/**
 * QuoteBuilder Component
 * Modern, fast quote/invoice builder with artwork upload, templates, and real-time pricing.
 * Integrates with ProductSearch for catalog-based product selection.
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash, 
  Calculator, 
  PaperPlaneTilt, 
  FloppyDisk, 
  MagnifyingGlass, 
  Image as ImageIcon, 
  FileText, 
  Copy, 
  Lightning, 
  Check, 
  Upload,
  Eye,
  Package,
  ArrowRight,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ProductSearch } from '@/components/products/ProductSearch';
import type { Product } from '@/components/products/ProductsPage';
import { ordersApi, jobsApi, DEFAULT_JOB_DUE_DAYS } from '@/lib/api-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// Print categories
const PRINT_CATEGORIES = [
  { value: 'screen-printing', label: 'Screen Printing', basePrice: 8, colorPrice: 1.5 },
  { value: 'dtg', label: 'DTG (Direct to Garment)', basePrice: 15, colorPrice: 0 },
  { value: 'embroidery', label: 'Embroidery', basePrice: 12, colorPrice: 2 },
  { value: 'heat-transfer', label: 'Heat Transfer', basePrice: 10, colorPrice: 0 },
  { value: 'sublimation', label: 'Sublimation', basePrice: 18, colorPrice: 0 },
  { value: 'vinyl', label: 'Vinyl', basePrice: 8, colorPrice: 0 },
] as const;

// Common garment types
const GARMENT_TYPES = [
  { value: 't-shirt', label: 'T-Shirt', baseMultiplier: 1 },
  { value: 'hoodie', label: 'Hoodie', baseMultiplier: 1.5 },
  { value: 'polo', label: 'Polo', baseMultiplier: 1.2 },
  { value: 'tank-top', label: 'Tank Top', baseMultiplier: 0.9 },
  { value: 'long-sleeve', label: 'Long Sleeve', baseMultiplier: 1.1 },
  { value: 'crewneck', label: 'Crewneck Sweatshirt', baseMultiplier: 1.4 },
  { value: 'jacket', label: 'Jacket', baseMultiplier: 1.8 },
  { value: 'hat', label: 'Hat', baseMultiplier: 0.8 },
  { value: 'bag', label: 'Bag', baseMultiplier: 0.7 },
  { value: 'other', label: 'Other', baseMultiplier: 1 },
] as const;

// Standard sizes
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

// Print locations
const PRINT_LOCATIONS = [
  { value: 'front-center', label: 'Front Center' },
  { value: 'front-left-chest', label: 'Left Chest' },
  { value: 'front-right-chest', label: 'Right Chest' },
  { value: 'full-front', label: 'Full Front' },
  { value: 'back-center', label: 'Back Center' },
  { value: 'back-neck', label: 'Back Neck' },
  { value: 'full-back', label: 'Full Back' },
  { value: 'left-sleeve', label: 'Left Sleeve' },
  { value: 'right-sleeve', label: 'Right Sleeve' },
] as const;

// Quote templates for quick creation
const QUOTE_TEMPLATES = [
  {
    id: 'basic-tee',
    name: 'Basic T-Shirt Order',
    description: '1-color front print on standard tees',
    items: [{
      garmentType: 't-shirt',
      category: 'screen-printing',
      colors: 1,
      printLocations: ['front-center'],
    }],
  },
  {
    id: 'standard-hoodie',
    name: 'Standard Hoodie',
    description: '2-color front and back print',
    items: [{
      garmentType: 'hoodie',
      category: 'screen-printing',
      colors: 2,
      printLocations: ['front-center', 'back-center'],
    }],
  },
  {
    id: 'premium-dtg',
    name: 'Premium DTG Print',
    description: 'Full-color DTG print on premium tee',
    items: [{
      garmentType: 't-shirt',
      category: 'dtg',
      colors: 1,
      printLocations: ['front-center'],
    }],
  },
  {
    id: 'corporate-polo',
    name: 'Corporate Polo Package',
    description: 'Embroidered polo with left chest logo',
    items: [{
      garmentType: 'polo',
      category: 'embroidery',
      colors: 2,
      printLocations: ['front-left-chest'],
    }],
  },
];

interface ArtworkFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  location?: string;
}

interface LineItem {
  id: string;
  garmentType: string;
  styleNumber: string;
  color: string;
  category: string;
  sizes: Record<string, number>;
  printLocations: string[];
  colors: number;
  unitPrice: number;
  artwork: ArtworkFile[];
  notes: string;
  // Product catalog integration
  selectedProduct?: Product | null;
  productBasePrice?: number;
  availableSizes?: string[];
}

interface CustomerData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface QuoteFormData {
  customer: CustomerData;
  dueDate: string;
  notes: string;
  internalNotes: string;
  lineItems: LineItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  rushOrder: boolean;
  rushFee: number;
}

// UUID generator
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const createEmptyLineItem = (): LineItem => ({
  id: generateId(),
  garmentType: '',
  styleNumber: '',
  color: '',
  category: 'screen-printing',
  sizes: {},
  printLocations: [],
  colors: 1,
  unitPrice: 0,
  artwork: [],
  notes: '',
  selectedProduct: null,
  productBasePrice: 0,
  availableSizes: [],
});

interface CustomerSearchResult {
  id: string;
  documentId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export function QuoteBuilder() {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState<QuoteFormData>({
    customer: { name: '', email: '', phone: '', company: '' },
    dueDate: '',
    notes: '',
    internalNotes: '',
    lineItems: [createEmptyLineItem()],
    discount: 0,
    discountType: 'percentage',
    taxRate: 8.25,
    rushOrder: false,
    rushFee: 0,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [lastSavedOrderId, setLastSavedOrderId] = useState<string | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResult[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkFile | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentItemForUpload, setCurrentItemForUpload] = useState<string | null>(null);

  // Calculate totals in real-time
  const totals = useMemo(() => {
    let subtotal = 0;
    
    for (const item of formData.lineItems) {
      const qty = Object.values(item.sizes).reduce((sum, q) => sum + q, 0);
      if (qty === 0) continue;
      
      const category = PRINT_CATEGORIES.find(c => c.value === item.category);
      const garment = GARMENT_TYPES.find(g => g.value === item.garmentType);
      
      if (!category) continue;
      
      // Start with product base price if selected from catalog, otherwise use print category base
      let basePrice = item.productBasePrice || 0;
      
      // Add print costs
      const printCost = category.basePrice + (item.colors * category.colorPrice);
      basePrice += printCost * (garment?.baseMultiplier || 1);
      
      // Location multiplier
      const locationMultiplier = 1 + (item.printLocations.length - 1) * 0.25;
      
      // Quantity discount (also check product pricing tiers if available)
      let qtyDiscount = 1;
      if (item.selectedProduct?.pricingTiers && item.selectedProduct.pricingTiers.length > 0) {
        // Find applicable tier from product catalog
        const sortedTiers = [...item.selectedProduct.pricingTiers].sort((a, b) => b.minQty - a.minQty);
        const applicableTier = sortedTiers.find(tier => qty >= tier.minQty);
        if (applicableTier && item.productBasePrice) {
          // Calculate discount based on tier price vs base price
          const tierDiscount = applicableTier.price / item.productBasePrice;
          qtyDiscount = Math.min(qtyDiscount, tierDiscount);
        }
      }
      // Apply standard quantity discounts if no product tiers
      if (qtyDiscount === 1) {
        if (qty >= 144) qtyDiscount = 0.7;
        else if (qty >= 72) qtyDiscount = 0.8;
        else if (qty >= 48) qtyDiscount = 0.85;
        else if (qty >= 24) qtyDiscount = 0.9;
        else if (qty >= 12) qtyDiscount = 0.95;
      }
      
      subtotal += basePrice * locationMultiplier * qtyDiscount * qty;
    }
    
    // Apply discount
    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      discountAmount = subtotal * (formData.discount / 100);
    } else {
      discountAmount = formData.discount;
    }
    
    const afterDiscount = subtotal - discountAmount;
    const rushFeeAmount = formData.rushOrder ? formData.rushFee : 0;
    const taxAmount = (afterDiscount + rushFeeAmount) * (formData.taxRate / 100);
    const total = afterDiscount + rushFeeAmount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      rushFee: rushFeeAmount,
      tax: taxAmount,
      total,
    };
  }, [formData]);

  // Customer search with debounce
  useEffect(() => {
    if (customerSearchQuery.length < 2) {
      setCustomerSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const url = `${API_BASE}/api/customers?filters[$or][0][name][$containsi]=${encodeURIComponent(customerSearchQuery)}&filters[$or][1][email][$containsi]=${encodeURIComponent(customerSearchQuery)}&filters[$or][2][company][$containsi]=${encodeURIComponent(customerSearchQuery)}&pagination[limit]=10`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCustomerSearchResults(data.data || []);
        }
      } catch (error) {
        console.error('Customer search failed:', error);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [customerSearchQuery]);

  const selectCustomer = (customer: CustomerSearchResult) => {
    const customerName = customer.name || 'Unknown';
    setFormData(prev => ({
      ...prev,
      customer: {
        id: customer.documentId || customer.id,
        name: customerName,
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
      },
    }));
    setShowCustomerSearch(false);
    setCustomerSearchQuery('');
    toast.success(`Selected customer: ${customerName}`);
  };

  const updateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const addLineItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, createEmptyLineItem()],
    }));
    toast.success('Line item added');
  }, []);

  const duplicateLineItem = useCallback((id: string) => {
    setFormData(prev => {
      const itemToDuplicate = prev.lineItems.find(item => item.id === id);
      if (!itemToDuplicate) return prev;
      
      const newItem: LineItem = {
        ...itemToDuplicate,
        id: generateId(),
        artwork: [],
      };
      
      const index = prev.lineItems.findIndex(item => item.id === id);
      const newItems = [...prev.lineItems];
      newItems.splice(index + 1, 0, newItem);
      
      return { ...prev, lineItems: newItems };
    });
    toast.success('Line item duplicated');
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
  }, []);

  const updateSize = useCallback((itemId: string, size: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id !== itemId) return item;
        const newSizes = { ...item.sizes };
        if (quantity > 0) {
          newSizes[size] = quantity;
        } else {
          delete newSizes[size];
        }
        return { ...item, sizes: newSizes };
      }),
    }));
  }, []);

  const togglePrintLocation = useCallback((itemId: string, location: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id !== itemId) return item;
        const hasLocation = item.printLocations.includes(location);
        return {
          ...item,
          printLocations: hasLocation
            ? item.printLocations.filter(l => l !== location)
            : [...item.printLocations, location],
        };
      }),
    }));
  }, []);

  const getTotalQuantity = (item: LineItem) => {
    return Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
  };

  // Artwork upload handling
  const handleArtworkUpload = useCallback((itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newArtwork: ArtworkFile[] = [];
    
    // Supported file types: images, PDF, AI, PSD
    const isValidFileType = (file: File): boolean => {
      if (file.type.startsWith('image/')) return true;
      if (file.type === 'application/pdf') return true;
      // AI and PSD files may have various MIME types or none
      const ext = file.name.toLowerCase().split('.').pop();
      return ext === 'ai' || ext === 'psd';
    };
    
    Array.from(files).forEach(file => {
      if (!isValidFileType(file)) {
        toast.error(`Invalid file type: ${file.name}`);
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}`);
        return;
      }
      
      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : '/pdf-icon.svg';
      
      newArtwork.push({
        id: generateId(),
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    });
    
    if (newArtwork.length > 0) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, artwork: [...item.artwork, ...newArtwork] };
        }),
      }));
      toast.success(`${newArtwork.length} file(s) uploaded`);
    }
  }, []);

  const removeArtwork = useCallback((itemId: string, artworkId: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id !== itemId) return item;
        const artwork = item.artwork.find(a => a.id === artworkId);
        if (artwork?.preview) {
          URL.revokeObjectURL(artwork.preview);
        }
        return {
          ...item,
          artwork: item.artwork.filter(a => a.id !== artworkId),
        };
      }),
    }));
  }, []);

  // Apply template
  const applyTemplate = useCallback((templateId: string) => {
    const template = QUOTE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    const newItems = template.items.map(templateItem => ({
      ...createEmptyLineItem(),
      garmentType: templateItem.garmentType,
      category: templateItem.category,
      colors: templateItem.colors,
      printLocations: templateItem.printLocations,
    }));
    
    setFormData(prev => ({
      ...prev,
      lineItems: newItems,
    }));
    
    toast.success(`Applied template: ${template.name}`);
  }, []);

  // Save quote
  const saveQuote = async (sendToCustomer = false): Promise<string | null> => {
    if (!formData.customer.name || !formData.customer.email) {
      toast.error('Please fill in customer name and email');
      setActiveTab('details');
      return null;
    }
    
    if (formData.lineItems.every(item => getTotalQuantity(item) === 0)) {
      toast.error('Please add at least one item with quantities');
      setActiveTab('items');
      return null;
    }

    setIsSaving(true);
    try {
      const quoteNumber = `Q-${Date.now().toString(36).toUpperCase()}`;
      
      const items = formData.lineItems
        .filter(item => getTotalQuantity(item) > 0)
        .map(item => ({
          description: `${GARMENT_TYPES.find(g => g.value === item.garmentType)?.label || item.garmentType}${item.styleNumber ? ` (${item.styleNumber})` : ''}`,
          styleNumber: item.styleNumber,
          color: item.color,
          category: item.category,
          quantity: getTotalQuantity(item),
          unitPrice: item.unitPrice,
          sizes: item.sizes,
          printLocations: item.printLocations,
          inkColors: item.colors,
          notes: item.notes,
        }));
      
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            orderNumber: quoteNumber,
            status: sendToCustomer ? 'QUOTE_SENT' : 'QUOTE',
            totalAmount: totals.total,
            dueDate: formData.dueDate || null,
            notes: formData.notes,
            productionNotes: formData.internalNotes,
            items: items,
            customer: formData.customer.id ? { connect: [formData.customer.id] } : null,
            customerNotes: JSON.stringify({
              name: formData.customer.name,
              email: formData.customer.email,
              phone: formData.customer.phone,
              company: formData.customer.company,
            }),
            discount: formData.discount,
            discountType: formData.discountType,
            taxRate: formData.taxRate,
            rushOrder: formData.rushOrder,
            rushFee: formData.rushFee,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quote');
      }

      const result = await response.json();
      const savedOrderId = result.data?.documentId;
      setLastSavedOrderId(savedOrderId);

      toast.success(sendToCustomer ? 'Quote sent to customer!' : 'Quote saved as draft!', {
        description: `Quote #${quoteNumber}`,
      });
      
      return savedOrderId;
      
    } catch (error) {
      toast.error('Failed to save quote');
      console.error(error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Convert quote to order
  const convertToOrder = async () => {
    // If no saved order, save it first
    let orderIdToConvert = lastSavedOrderId;
    
    if (!orderIdToConvert) {
      toast.info('Saving quote first...');
      orderIdToConvert = await saveQuote(false);
      if (!orderIdToConvert) {
        return; // Save failed
      }
    }

    setIsConverting(true);
    try {
      // Update order status to PENDING
      const orderResult = await ordersApi.update(orderIdToConvert, {
        status: 'PENDING',
      });

      if (!orderResult.success || !orderResult.data) {
        toast.error('Failed to convert quote', {
          description: orderResult.error || 'Could not update order status',
        });
        return;
      }

      const order = orderResult.data;

      // Create associated job
      const totalQty = formData.lineItems.reduce(
        (sum, item) => sum + Object.values(item.sizes).reduce((s, q) => s + q, 0),
        0
      );

      const jobResult = await jobsApi.create({
        title: order.orderNumber || `Job ${order.id}`,
        customer: formData.customer.name || 'Unknown Customer',
        customerId: formData.customer.id,
        status: 'design',
        priority: formData.rushOrder ? 'high' : 'normal',
        dueDate: formData.dueDate || new Date(Date.now() + DEFAULT_JOB_DUE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        quantity: totalQty || 1,
        estimatedCost: totals.total,
        order: { connect: [orderIdToConvert] },
      });

      if (jobResult.success) {
        toast.success('Quote converted to order!', {
          description: `Order ${order.orderNumber} created with job in design queue.`,
        });
      } else {
        toast.success('Quote converted to order!', {
          description: `Order ${order.orderNumber} created. Job creation failed: ${jobResult.error}`,
        });
      }

      // Reset form
      setFormData({
        customer: { name: '', email: '', phone: '', company: '' },
        dueDate: '',
        notes: '',
        internalNotes: '',
        lineItems: [createEmptyLineItem()],
        discount: 0,
        discountType: 'percentage',
        taxRate: 8.25,
        rushOrder: false,
        rushFee: 0,
      });
      setLastSavedOrderId(null);
      setActiveTab('details');

    } catch (error) {
      toast.error('Failed to convert quote');
      console.error('Convert to order error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Quote</h1>
          <p className="text-muted-foreground">Build a professional quote quickly</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Estimated Total</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totals.total)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="mr-2" size={16} />
              Preview
            </Button>
            <Button variant="outline" onClick={() => saveQuote(false)} disabled={isSaving || isConverting}>
              <FloppyDisk className="mr-2" size={16} />
              Save Draft
            </Button>
            <Button onClick={() => saveQuote(true)} disabled={isSaving || isConverting}>
              <PaperPlaneTilt className="mr-2" size={16} />
              Send Quote
            </Button>
            <Button 
              variant="default" 
              onClick={convertToOrder} 
              disabled={isSaving || isConverting}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowRight className="mr-2" size={16} />
              {isConverting ? 'Converting...' : 'Convert to Order'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightning size={20} className="text-amber-500" />
            <CardTitle className="text-base">Quick Start Templates</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {QUOTE_TEMPLATES.map(template => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template.id)}
                className="h-auto py-2 px-3"
              >
                <div className="text-left">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details" className="gap-2">
            <FileText size={16} />
            Customer & Details
          </TabsTrigger>
          <TabsTrigger value="items" className="gap-2">
            <Plus size={16} />
            Line Items
            <Badge variant="secondary" className="ml-1">{formData.lineItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="artwork" className="gap-2">
            <ImageIcon size={16} />
            Artwork
            <Badge variant="secondary" className="ml-1">
              {formData.lineItems.reduce((sum, item) => sum + item.artwork.length, 0)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <Calculator size={16} />
            Pricing & Totals
          </TabsTrigger>
        </TabsList>

        {/* Customer & Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Information</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowCustomerSearch(true)}>
                  <MagnifyingGlass className="mr-2" size={16} />
                  Search Existing Customer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customer.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, name: e.target.value },
                    }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customer.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, email: e.target.value },
                    }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customer.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, phone: e.target.value },
                    }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.customer.company}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, company: e.target.value },
                    }))}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.rushOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, rushOrder: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    Rush Order
                  </Label>
                  {formData.rushOrder && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Rush Fee: $</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.rushFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, rushFee: parseFloat(e.target.value) || 0 }))}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Customer Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes visible to customer..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internalNotes">Internal Notes</Label>
                  <Textarea
                    id="internalNotes"
                    value={formData.internalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                    placeholder="Internal notes (not visible to customer)..."
                    rows={3}
                    className="bg-amber-50/50 border-amber-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={addLineItem}>
              <Plus className="mr-2" size={16} />
              Add Line Item
            </Button>
          </div>

          {formData.lineItems.map((item, index) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <CardTitle className="text-base">
                      {item.selectedProduct?.name || GARMENT_TYPES.find(g => g.value === item.garmentType)?.label || 'New Item'}
                    </CardTitle>
                    {item.selectedProduct && (
                      <Badge variant="outline" className="text-xs">
                        {item.selectedProduct.sku}
                      </Badge>
                    )}
                    {getTotalQuantity(item) > 0 && (
                      <Badge variant="secondary">{getTotalQuantity(item)} pcs</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => duplicateLineItem(item.id)}>
                      <Copy size={16} />
                    </Button>
                    {formData.lineItems.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeLineItem(item.id)}>
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Selection from Catalog */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Package size={16} />
                    Select Product from Catalog
                  </Label>
                  <ProductSearch
                    selectedProduct={item.selectedProduct}
                    onSelect={(product) => {
                      // Map product category to garment type
                      const categoryToGarment: Record<string, string> = {
                        't-shirts': 't-shirt',
                        'hoodies': 'hoodie',
                        'polos': 'polo',
                        'sweatshirts': 'crewneck',
                        'jackets': 'jacket',
                        'hats': 'hat',
                        'bags': 'bag',
                      };
                      updateLineItem(item.id, { 
                        selectedProduct: product,
                        styleNumber: product.sku,
                        garmentType: categoryToGarment[product.category] || 'other',
                        productBasePrice: product.basePrice,
                        availableSizes: product.sizes,
                        unitPrice: product.basePrice,
                      });
                      toast.success(`Added ${product.name}`, {
                        description: `$${product.basePrice.toFixed(2)} per unit`,
                      });
                    }}
                    onClear={() => {
                      updateLineItem(item.id, { 
                        selectedProduct: null,
                        productBasePrice: 0,
                        availableSizes: [],
                      });
                    }}
                    placeholder="Search by product name or SKU..."
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Garment Type *</Label>
                    <Select
                      value={item.garmentType}
                      onValueChange={(v) => updateLineItem(item.id, { garmentType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {GARMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Style Number</Label>
                    <Input
                      value={item.styleNumber}
                      onChange={(e) => updateLineItem(item.id, { styleNumber: e.target.value })}
                      placeholder="e.g. G500, PC54"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      value={item.color}
                      onChange={(e) => updateLineItem(item.id, { color: e.target.value })}
                      placeholder="e.g. Black, Navy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Print Method</Label>
                    <Select
                      value={item.category}
                      onValueChange={(v) => updateLineItem(item.id, { category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRINT_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label>Ink Colors</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateLineItem(item.id, { colors: Math.max(1, item.colors - 1) })}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-bold">{item.colors}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateLineItem(item.id, { colors: Math.min(12, item.colors + 1) })}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Size Breakdown</Label>
                  <div className="grid grid-cols-9 gap-2">
                    {SIZES.map(size => (
                      <div key={size} className="space-y-1">
                        <Label className="text-xs text-center block text-muted-foreground">{size}</Label>
                        <Input
                          type="number"
                          min="0"
                          className="text-center px-1 h-9"
                          value={item.sizes[size] || ''}
                          onChange={(e) => updateSize(item.id, size, parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total: <span className="font-bold">{getTotalQuantity(item)}</span> pieces
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Print Locations</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRINT_LOCATIONS.map(location => (
                      <Button
                        key={location.value}
                        type="button"
                        variant={item.printLocations.includes(location.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => togglePrintLocation(item.id, location.value)}
                      >
                        {item.printLocations.includes(location.value) && <Check className="mr-1" size={14} />}
                        {location.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Item Notes</Label>
                  <Input
                    value={item.notes}
                    onChange={(e) => updateLineItem(item.id, { notes: e.target.value })}
                    placeholder="Special instructions for this item..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Artwork Tab */}
        <TabsContent value="artwork" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Artwork Files</CardTitle>
              <CardDescription>
                Upload artwork files for each line item. Supported formats: PNG, JPG, AI, PSD, PDF (max 50MB each)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.lineItems.map((item, index) => (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <h3 className="font-medium">
                        {GARMENT_TYPES.find(g => g.value === item.garmentType)?.label || 'Item ' + (index + 1)}
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentItemForUpload(item.id);
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="mr-2" size={14} />
                      Upload Files
                    </Button>
                  </div>
                  
                  {item.artwork.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {item.artwork.map(artwork => (
                        <div
                          key={artwork.id}
                          className="relative group border rounded-lg overflow-hidden bg-gray-50"
                        >
                          <div 
                            className="aspect-square flex items-center justify-center cursor-pointer"
                            onClick={() => setSelectedArtwork(artwork)}
                          >
                            {artwork.type.startsWith('image/') ? (
                              <img
                                src={artwork.preview}
                                alt={artwork.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="text-center p-4">
                                <FileText size={32} className="mx-auto mb-2 text-gray-400" />
                                <p className="text-xs text-gray-500 truncate">{artwork.name}</p>
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setSelectedArtwork(artwork)}>
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => removeArtwork(item.id, artwork.id)}>
                              <Trash size={14} />
                            </Button>
                          </div>
                          <div className="p-2 bg-white border-t">
                            <p className="text-xs font-medium truncate">{artwork.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(artwork.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => {
                        setCurrentItemForUpload(item.id);
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG, AI, PSD, PDF up to 50MB</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.ai,.psd"
            className="hidden"
            onChange={(e) => {
              if (currentItemForUpload) {
                handleArtworkUpload(currentItemForUpload, e.target.files);
              }
              e.target.value = '';
            }}
          />
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Adjustments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="flex-1"
                    />
                    <Select
                      value={formData.discountType}
                      onValueChange={(v: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, discountType: v }))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">$</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}
                {totals.rushFee > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Rush Fee</span>
                    <span>+{formatCurrency(totals.rushFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax ({formData.taxRate}%)</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totals.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.lineItems.map((item, index) => {
                  const qty = getTotalQuantity(item);
                  if (qty === 0) return null;
                  
                  const category = PRINT_CATEGORIES.find(c => c.value === item.category);
                  const garment = GARMENT_TYPES.find(g => g.value === item.garmentType);
                  
                  if (!category) return null;
                  
                  let basePrice = category.basePrice + (item.colors * category.colorPrice);
                  basePrice *= garment?.baseMultiplier || 1;
                  const locationMultiplier = 1 + (item.printLocations.length - 1) * 0.25;
                  
                  let qtyDiscount = 1;
                  if (qty >= 144) qtyDiscount = 0.7;
                  else if (qty >= 72) qtyDiscount = 0.8;
                  else if (qty >= 48) qtyDiscount = 0.85;
                  else if (qty >= 24) qtyDiscount = 0.9;
                  else if (qty >= 12) qtyDiscount = 0.95;
                  
                  const unitPrice = basePrice * locationMultiplier * qtyDiscount;
                  const itemTotal = unitPrice * qty;
                  
                  return (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">
                            {garment?.label || 'Item'} - {category?.label}
                          </span>
                        </div>
                        <span className="font-bold">{formatCurrency(itemTotal)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="text-xs">Base Price</span>
                          <p>{formatCurrency(basePrice)}</p>
                        </div>
                        <div>
                          <span className="text-xs">Locations ({item.printLocations.length})</span>
                          <p>×{locationMultiplier.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-xs">Qty Discount</span>
                          <p>{((1 - qtyDiscount) * 100).toFixed(0)}% off</p>
                        </div>
                        <div>
                          <span className="text-xs">Quantity</span>
                          <p>{qty} pcs @ {formatCurrency(unitPrice)}/ea</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Search Dialog */}
      <Dialog open={showCustomerSearch} onOpenChange={setShowCustomerSearch}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Search Customers</DialogTitle>
            <DialogDescription>Search by name, email, or company</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search customers..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {isSearchingCustomers ? (
                <p className="text-center text-muted-foreground py-4">Searching...</p>
              ) : customerSearchResults.length > 0 ? (
                customerSearchResults.map(customer => (
                  <div
                    key={customer.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => selectCustomer(customer)}
                  >
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    {customer.company && (
                      <p className="text-sm text-muted-foreground">{customer.company}</p>
                    )}
                  </div>
                ))
              ) : customerSearchQuery.length >= 2 ? (
                <p className="text-center text-muted-foreground py-4">No customers found</p>
              ) : (
                <p className="text-center text-muted-foreground py-4">Type to search...</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Artwork Preview Dialog */}
      <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedArtwork?.name}</DialogTitle>
            <DialogDescription>
              {selectedArtwork && formatFileSize(selectedArtwork.size)}
            </DialogDescription>
          </DialogHeader>
          {selectedArtwork?.type.startsWith('image/') ? (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[400px]">
              <img
                src={selectedArtwork.preview}
                alt={selectedArtwork.name}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8">
              <FileText size={64} className="text-gray-400 mb-4" />
              <p className="text-lg font-medium">{selectedArtwork?.name}</p>
              <p className="text-muted-foreground">Preview not available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Preview</DialogTitle>
            <DialogDescription>How the quote will appear to the customer</DialogDescription>
          </DialogHeader>
          
          <div className="bg-white p-6 rounded-lg border space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">QUOTE</h2>
                <p className="text-muted-foreground">Draft</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">PrintShop OS</p>
                <p className="text-sm text-muted-foreground">Your Business Address</p>
                <p className="text-sm text-muted-foreground">email@example.com</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Bill To:</h3>
                <p>{formData.customer.name || 'Customer Name'}</p>
                {formData.customer.company && <p>{formData.customer.company}</p>}
                <p>{formData.customer.email || 'email@example.com'}</p>
                {formData.customer.phone && <p>{formData.customer.phone}</p>}
              </div>
              <div className="text-right">
                {formData.dueDate && (
                  <p><span className="text-muted-foreground">Due Date:</span> {formData.dueDate}</p>
                )}
                {formData.rushOrder && (
                  <Badge variant="destructive" className="mt-2">Rush Order</Badge>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Description</th>
                    <th className="px-4 py-2 text-center font-medium">Qty</th>
                    <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formData.lineItems.map((item) => {
                    const qty = getTotalQuantity(item);
                    if (qty === 0) return null;
                    
                    const category = PRINT_CATEGORIES.find(c => c.value === item.category);
                    const garment = GARMENT_TYPES.find(g => g.value === item.garmentType);
                    
                    if (!category) return null;
                    
                    let basePrice = category.basePrice + (item.colors * category.colorPrice);
                    basePrice *= garment?.baseMultiplier || 1;
                    const locationMultiplier = 1 + (item.printLocations.length - 1) * 0.25;
                    
                    let qtyDiscount = 1;
                    if (qty >= 144) qtyDiscount = 0.7;
                    else if (qty >= 72) qtyDiscount = 0.8;
                    else if (qty >= 48) qtyDiscount = 0.85;
                    else if (qty >= 24) qtyDiscount = 0.9;
                    else if (qty >= 12) qtyDiscount = 0.95;
                    
                    const unitPrice = basePrice * locationMultiplier * qtyDiscount;
                    const itemTotal = unitPrice * qty;
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{garment?.label || 'Item'}</p>
                          <p className="text-muted-foreground text-xs">
                            {category?.label} • {item.colors} color(s) • {item.printLocations.length} location(s)
                          </p>
                          {item.color && <p className="text-muted-foreground text-xs">Color: {item.color}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">{qty}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(itemTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}
                {totals.rushFee > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Rush Fee</span>
                    <span>+{formatCurrency(totals.rushFee)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({formData.taxRate}%)</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>

            {formData.notes && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.notes}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowPreview(false);
              saveQuote(true);
            }}>
              <PaperPlaneTilt className="mr-2" size={16} />
              Send Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
