/**
 * ShippingLabelForm Component
 * Create shipping labels using EasyPost API integration.
 * Features: Multi-box shipments, Order/Customer lookup
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, MapPin, CurrencyDollar, Printer, Download, ArrowRight, CheckCircle, Warning, MagnifyingGlass, Plus, Trash, User } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

interface Address {
  name: string;
  company: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface Parcel {
  length: number;
  width: number;
  height: number;
  weight: number;
}

interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  rate: string;
  currency: string;
  deliveryDays: number | null;
  deliveryDate: string | null;
}

interface Shipment {
  id: string;
  trackingCode: string;
  labelUrl: string;
  labelPdfUrl: string;
  selectedRate: ShippingRate;
}

interface OrderSearchResult {
  id: string;
  documentId: string;
  orderNumber: string;
  orderNickname?: string;
  customerName: string;
  customerEmail?: string;
  shippingAddress?: Address;
}

interface CustomerSearchResult {
  id: string;
  documentId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  shippingAddress?: Address;
}

interface ParcelWithId extends Parcel {
  id: string;
  preset: string;
}

// Simple ID generator
const generateId = (): string => Math.random().toString(36).substring(2, 9);

const PRESET_BOXES: Record<string, Parcel> = {
  'small-box': { length: 8, width: 6, height: 4, weight: 1 },
  'medium-box': { length: 12, width: 10, height: 6, weight: 3 },
  'large-box': { length: 18, width: 14, height: 8, weight: 5 },
  'flat-mailer': { length: 12, width: 9, height: 1, weight: 0.5 },
  'custom': { length: 0, width: 0, height: 0, weight: 0 },
};

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const emptyAddress: Address = {
  name: '',
  company: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  phone: '',
};

// Your shop's return address (customize this)
const SHOP_ADDRESS: Address = {
  name: 'PrintShop OS',
  company: 'Your Print Shop',
  street1: '123 Main Street',
  street2: '',
  city: 'Baltimore',
  state: 'MD',
  zip: '21202',
  country: 'US',
  phone: '(555) 123-4567',
};

// Generate unique ID for parcels
const generateParcelId = () => `parcel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create a new parcel with default values
const createParcel = (preset: string = 'medium-box'): ParcelWithId => ({
  id: generateParcelId(),
  preset,
  ...PRESET_BOXES[preset],
});

export function ShippingLabelForm() {
  const [fromAddress, setFromAddress] = useState<Address>(SHOP_ADDRESS);
  const [toAddress, setToAddress] = useState<Address>(emptyAddress);
  
  // Multi-box support
  const [parcels, setParcels] = useState<ParcelWithId[]>([createParcel()]);
  
  // Order/Customer lookup
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    orders: OrderSearchResult[];
    customers: CustomerSearchResult[];
  }>({ orders: [], customers: [] });
  const [showLookupDialog, setShowLookupDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSearchResult | null>(null);
  
  const [isGettingRates, setIsGettingRates] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [shipmentId, setShipmentId] = useState<string | null>(null);

  // Add a new parcel/box
  const addParcel = () => {
    setParcels(prev => [...prev, createParcel()]);
    toast.success('Added new box');
  };

  // Remove a parcel
  const removeParcel = (id: string) => {
    if (parcels.length === 1) {
      toast.error('Must have at least one box');
      return;
    }
    setParcels(prev => prev.filter(p => p.id !== id));
    toast.success('Removed box');
  };

  // Update a specific parcel
  const updateParcel = (id: string, updates: Partial<ParcelWithId>) => {
    setParcels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Handle box preset change for a specific parcel
  const handleBoxPresetChange = (id: string, preset: string) => {
    if (preset !== 'custom') {
      updateParcel(id, { preset, ...PRESET_BOXES[preset] });
    } else {
      updateParcel(id, { preset });
    }
  };

  // Search for orders/customers
  const searchOrdersAndCustomers = useCallback(async () => {
    if (!lookupQuery.trim()) {
      setSearchResults({ orders: [], customers: [] });
      return;
    }

    setIsSearching(true);
    try {
      // Search orders by number or nickname
      const ordersResponse = await fetch(
        `${API_BASE}/api/orders?` + new URLSearchParams({
          'filters[$or][0][orderNumber][$containsi]': lookupQuery,
          'filters[$or][1][orderNickname][$containsi]': lookupQuery,
          'filters[$or][2][visualId][$containsi]': lookupQuery,
          'populate': 'customer',
          'pagination[limit]': '10',
        })
      );

      // Search customers by name or email
      const customersResponse = await fetch(
        `${API_BASE}/api/customers?` + new URLSearchParams({
          'filters[$or][0][name][$containsi]': lookupQuery,
          'filters[$or][1][email][$containsi]': lookupQuery,
          'filters[$or][2][company][$containsi]': lookupQuery,
          'pagination[limit]': '10',
        })
      );

      const ordersData = await ordersResponse.json();
      const customersData = await customersResponse.json();

      const orders: OrderSearchResult[] = (ordersData.data || []).map((o: any) => ({
        id: o.id,
        documentId: o.documentId,
        orderNumber: o.orderNumber || o.visualId,
        orderNickname: o.orderNickname,
        customerName: o.customer?.name || o.customerName || 'Unknown',
        customerEmail: o.customer?.email,
        shippingAddress: o.shippingAddress ? {
          name: o.shippingAddress.name || o.customer?.name || '',
          company: o.shippingAddress.company || o.customer?.company || '',
          street1: o.shippingAddress.street1 || o.shippingAddress.address1 || '',
          street2: o.shippingAddress.street2 || o.shippingAddress.address2 || '',
          city: o.shippingAddress.city || '',
          state: o.shippingAddress.state || '',
          zip: o.shippingAddress.zip || o.shippingAddress.postalCode || '',
          country: o.shippingAddress.country || 'US',
          phone: o.shippingAddress.phone || o.customer?.phone || '',
        } : undefined,
      }));

      const customers: CustomerSearchResult[] = (customersData.data || []).map((c: any) => ({
        id: c.id,
        documentId: c.documentId,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        shippingAddress: c.shippingAddress ? {
          name: c.name || '',
          company: c.company || '',
          street1: c.shippingAddress.street1 || c.shippingAddress.address1 || '',
          street2: c.shippingAddress.street2 || c.shippingAddress.address2 || '',
          city: c.shippingAddress.city || '',
          state: c.shippingAddress.state || '',
          zip: c.shippingAddress.zip || c.shippingAddress.postalCode || '',
          country: c.shippingAddress.country || 'US',
          phone: c.phone || '',
        } : undefined,
      }));

      setSearchResults({ orders, customers });
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [lookupQuery]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (lookupQuery.length >= 2) {
        searchOrdersAndCustomers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [lookupQuery, searchOrdersAndCustomers]);

  // Select an order and fill address
  const selectOrder = (order: OrderSearchResult) => {
    setSelectedOrder(order);
    if (order.shippingAddress) {
      setToAddress(order.shippingAddress);
      toast.success(`Loaded address for order #${order.orderNumber}`);
    } else {
      toast.warning('No shipping address on this order');
    }
    setShowLookupDialog(false);
  };

  // Select a customer and fill address
  const selectCustomer = (customer: CustomerSearchResult) => {
    if (customer.shippingAddress) {
      setToAddress(customer.shippingAddress);
      toast.success(`Loaded address for ${customer.name}`);
    } else {
      // Use customer info as fallback
      setToAddress({
        ...emptyAddress,
        name: customer.name,
        company: customer.company || '',
        phone: customer.phone || '',
      });
      toast.warning('Customer has no saved shipping address - partial info loaded');
    }
    setShowLookupDialog(false);
  };

  const validateAddresses = (): boolean => {
    const required = ['name', 'street1', 'city', 'state', 'zip'];
    
    for (const field of required) {
      if (!toAddress[field as keyof Address]) {
        toast.error(`Recipient ${field} is required`);
        return false;
      }
    }
    
    // Validate all parcels
    for (let i = 0; i < parcels.length; i++) {
      const parcel = parcels[i];
      const boxNum = parcels.length > 1 ? ` (Box ${i + 1})` : '';
      
      if (parcel.weight <= 0) {
        toast.error(`Package weight is required${boxNum}`);
        return false;
      }
      
      if (parcel.length <= 0 || parcel.width <= 0 || parcel.height <= 0) {
        toast.error(`Package dimensions are required${boxNum}`);
        return false;
      }
    }
    
    return true;
  };

  const getRates = async () => {
    if (!validateAddresses()) return;
    
    setIsGettingRates(true);
    setRates([]);
    setSelectedRateId(null);
    setShipment(null);
    
    try {
      // For multi-box shipments, we get rates for each parcel
      // The API will create multiple shipments if needed
      const primaryParcel = {
        weight: parcels[0].weight,
        length: parcels[0].length,
        width: parcels[0].width,
        height: parcels[0].height,
      };
      
      const response = await fetch(`${API_BASE}/api/shipping/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fromAddress, 
          toAddress, 
          parcel: primaryParcel,
          // Include all parcels for multi-box (backend can use this for future batch)
          parcels: parcels.map(p => ({
            weight: p.weight,
            length: p.length,
            width: p.width,
            height: p.height,
          })),
          boxCount: parcels.length,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to get rates');
      }
      
      if (data.rates && data.rates.length > 0) {
        setRates(data.rates);
        setShipmentId(data.shipmentId);
        toast.success('Rates retrieved successfully');
      } else {
        toast.error('No shipping rates available for this route');
      }
    } catch (error: any) {
      console.error('Failed to get rates:', error);
      toast.error(error.message || 'Failed to get shipping rates');
    } finally {
      setIsGettingRates(false);
    }
  };

  const purchaseLabel = async () => {
    if (!selectedRateId || !shipmentId) {
      toast.error('Please select a shipping rate');
      return;
    }
    
    setIsPurchasing(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/shipping/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId, rateId: selectedRateId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to purchase label');
      }
      
      setShipment({
        id: data.id,
        trackingCode: data.trackingCode,
        labelUrl: data.labelUrl,
        labelPdfUrl: data.labelPdfUrl,
        selectedRate: data.selectedRate,
      });
      
      toast.success('Label purchased successfully!');
    } catch (error: any) {
      console.error('Failed to purchase label:', error);
      toast.error(error.message || 'Failed to purchase label');
    } finally {
      setIsPurchasing(false);
    }
  };

  const printLabel = () => {
    if (shipment?.labelUrl) {
      window.open(shipment.labelUrl, '_blank');
    }
  };

  const downloadLabel = () => {
    if (shipment?.labelPdfUrl) {
      const link = document.createElement('a');
      link.href = shipment.labelPdfUrl;
      link.download = `label-${shipment.trackingCode}.pdf`;
      link.click();
    }
  };

  const resetForm = () => {
    setToAddress(emptyAddress);
    // Reset to single default parcel
    setParcels([{
      id: generateId(),
      preset: 'medium-box',
      ...PRESET_BOXES['medium-box'],
    }]);
    setRates([]);
    setSelectedRateId(null);
    setShipment(null);
    setShipmentId(null);
    setLookupQuery('');
    setSearchResults({ orders: [], customers: [] });
    setShowLookupDialog(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Shipping Label</h1>
          <p className="text-muted-foreground">Generate shipping labels with EasyPost</p>
        </div>
        {shipment && (
          <Button variant="outline" onClick={resetForm}>
            Create Another Label
          </Button>
        )}
      </div>

      {/* Success State */}
      {shipment && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle size={24} className="text-green-600" weight="fill" />
              <CardTitle className="text-green-700 dark:text-green-300">
                Label Created Successfully!
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Tracking Number</Label>
                <p className="font-mono font-medium">{shipment.trackingCode}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Service</Label>
                <p className="font-medium">
                  {shipment.selectedRate.carrier} {shipment.selectedRate.service}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={printLabel}>
                <Printer className="mr-2" size={16} />
                Print Label
              </Button>
              <Button variant="outline" onClick={downloadLabel}>
                <Download className="mr-2" size={16} />
                Download PDF
              </Button>
            </div>
            
            {/* Label Preview */}
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <img
                src={shipment.labelUrl}
                alt="Shipping Label"
                className="max-w-sm mx-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {!shipment && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* From Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                <CardTitle>From Address</CardTitle>
              </div>
              <CardDescription>Your shop's return address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={fromAddress.name}
                    onChange={(e) => setFromAddress(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={fromAddress.company}
                    onChange={(e) => setFromAddress(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  value={fromAddress.street1}
                  onChange={(e) => setFromAddress(prev => ({ ...prev, street1: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Apt, Suite, etc.</Label>
                <Input
                  value={fromAddress.street2}
                  onChange={(e) => setFromAddress(prev => ({ ...prev, street2: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={fromAddress.city}
                    onChange={(e) => setFromAddress(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select
                    value={fromAddress.state}
                    onValueChange={(v) => setFromAddress(prev => ({ ...prev, state: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input
                    value={fromAddress.zip}
                    onChange={(e) => setFromAddress(prev => ({ ...prev, zip: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* To Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck size={20} className="text-primary" />
                  <CardTitle>To Address</CardTitle>
                </div>
                <Dialog open={showLookupDialog} onOpenChange={setShowLookupDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <MagnifyingGlass size={16} />
                      Look Up
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Find Order or Customer</DialogTitle>
                      <DialogDescription>
                        Search by order number, customer name, or email
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search orders or customers..."
                          value={lookupQuery}
                          onChange={(e) => setLookupQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && searchOrdersAndCustomers()}
                        />
                        <Button 
                          onClick={searchOrdersAndCustomers} 
                          disabled={isSearching}
                        >
                          {isSearching ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                      
                      {/* Orders Results */}
                      {searchResults.orders.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Orders</p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {searchResults.orders.map(order => (
                              <div
                                key={order.id}
                                className="p-2 border rounded cursor-pointer hover:bg-muted flex items-center justify-between"
                                onClick={() => selectOrder(order)}
                              >
                                <div>
                                  <p className="font-medium">#{order.orderNumber}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.customerName}
                                    {order.orderNickname && ` • ${order.orderNickname}`}
                                  </p>
                                </div>
                                {order.shippingAddress && (
                                  <Badge variant="outline" className="text-xs">
                                    Has Address
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Customers Results */}
                      {searchResults.customers.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Customers</p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {searchResults.customers.map(customer => (
                              <div
                                key={customer.id}
                                className="p-2 border rounded cursor-pointer hover:bg-muted flex items-center justify-between"
                                onClick={() => selectCustomer(customer)}
                              >
                                <div className="flex items-center gap-2">
                                  <User size={16} className="text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{customer.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {customer.company || customer.email}
                                    </p>
                                  </div>
                                </div>
                                {customer.shippingAddress && (
                                  <Badge variant="outline" className="text-xs">
                                    Has Address
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* No Results */}
                      {lookupQuery && !isSearching && 
                       searchResults.orders.length === 0 && 
                       searchResults.customers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No results found for "{lookupQuery}"
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Recipient's shipping address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={toAddress.name}
                    onChange={(e) => setToAddress(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={toAddress.company}
                    onChange={(e) => setToAddress(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Input
                  value={toAddress.street1}
                  onChange={(e) => setToAddress(prev => ({ ...prev, street1: e.target.value }))}
                  placeholder="456 Market Street"
                />
              </div>
              <div className="space-y-2">
                <Label>Apt, Suite, etc.</Label>
                <Input
                  value={toAddress.street2}
                  onChange={(e) => setToAddress(prev => ({ ...prev, street2: e.target.value }))}
                  placeholder="Suite 100"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={toAddress.city}
                    onChange={(e) => setToAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Los Angeles"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select
                    value={toAddress.state}
                    onValueChange={(v) => setToAddress(prev => ({ ...prev, state: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ZIP *</Label>
                  <Input
                    value={toAddress.zip}
                    onChange={(e) => setToAddress(prev => ({ ...prev, zip: e.target.value }))}
                    placeholder="90001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={toAddress.phone}
                  onChange={(e) => setToAddress(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Package Details - Multi-box support */}
      {!shipment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-primary" />
                <CardTitle>
                  Package Details
                  {parcels.length > 1 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({parcels.length} boxes)
                    </span>
                  )}
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addParcel}
                className="gap-1"
              >
                <Plus size={16} />
                Add Box
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {parcels.map((parcel, index) => (
              <div key={parcel.id} className="relative">
                {parcels.length > 1 && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Box {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParcel(parcel.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Box Size</Label>
                    <Select 
                      value={parcel.preset} 
                      onValueChange={(value) => handleBoxPresetChange(parcel.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small-box">Small Box</SelectItem>
                        <SelectItem value="medium-box">Medium Box</SelectItem>
                        <SelectItem value="large-box">Large Box</SelectItem>
                        <SelectItem value="flat-mailer">Flat Mailer</SelectItem>
                        <SelectItem value="custom">Custom Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Length (in)</Label>
                    <Input
                      type="number"
                      value={parcel.length || ''}
                      onChange={(e) => updateParcel(parcel.id, { length: parseFloat(e.target.value) || 0 })}
                      disabled={parcel.preset !== 'custom'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width (in)</Label>
                    <Input
                      type="number"
                      value={parcel.width || ''}
                      onChange={(e) => updateParcel(parcel.id, { width: parseFloat(e.target.value) || 0 })}
                      disabled={parcel.preset !== 'custom'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (in)</Label>
                    <Input
                      type="number"
                      value={parcel.height || ''}
                      onChange={(e) => updateParcel(parcel.id, { height: parseFloat(e.target.value) || 0 })}
                      disabled={parcel.preset !== 'custom'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (lbs) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={parcel.weight || ''}
                      onChange={(e) => updateParcel(parcel.id, { weight: parseFloat(e.target.value) || 0 })}
                      placeholder="0.0"
                    />
                  </div>
                </div>
                {index < parcels.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
            
            {/* Summary for multi-box */}
            {parcels.length > 1 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Shipment Summary</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {parcels.length} boxes • Total weight: {parcels.reduce((sum, p) => sum + p.weight, 0).toFixed(1)} lbs
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <Button 
                onClick={getRates} 
                disabled={isGettingRates}
                className="w-full md:w-auto"
              >
                {isGettingRates ? (
                  'Getting Rates...'
                ) : (
                  <>
                    Get Shipping Rates
                    <ArrowRight className="ml-2" size={16} />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Rates */}
      {rates.length > 0 && !shipment && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CurrencyDollar size={20} className="text-primary" />
              <CardTitle>Select Shipping Rate</CardTitle>
            </div>
            <CardDescription>
              Choose the best option for your shipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rates
                .sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate))
                .map(rate => (
                  <div
                    key={rate.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRateId === rate.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground'
                    }`}
                    onClick={() => setSelectedRateId(rate.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedRateId === rate.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-medium">
                            {rate.carrier} {rate.service}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {rate.deliveryDays 
                              ? `${rate.deliveryDays} business day${rate.deliveryDays > 1 ? 's' : ''}`
                              : 'Delivery time varies'
                            }
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-bold">
                        ${parseFloat(rate.rate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={purchaseLabel}
                disabled={!selectedRateId || isPurchasing}
                size="lg"
                className="w-full"
              >
                {isPurchasing ? (
                  'Purchasing Label...'
                ) : (
                  <>
                    <Printer className="mr-2" size={18} />
                    Purchase Label
                    {selectedRateId && (
                      <span className="ml-2">
                        (${parseFloat(rates.find(r => r.id === selectedRateId)?.rate || '0').toFixed(2)})
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
