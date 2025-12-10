/**
 * ShipmentTracking Component
 * View and track shipped orders with tracking numbers
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  MapPin, 
  MagnifyingGlass, 
  ArrowSquareOut, 
  Clock, 
  CheckCircle,
  Warning,
  CaretRight
} from '@phosphor-icons/react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

interface Shipment {
  id: string;
  documentId: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  orderNumber?: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  labelUrl?: string;
  toAddress: {
    name: string;
    city: string;
    state: string;
  };
}

interface TrackingEvent {
  datetime: string;
  message: string;
  status: string;
  location?: string;
}

// Carrier tracking URL patterns
const CARRIER_TRACKING_URLS: Record<string, string> = {
  'USPS': 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  'UPS': 'https://www.ups.com/track?tracknum=',
  'FedEx': 'https://www.fedex.com/fedextrack/?trknbr=',
  'DHL': 'https://www.dhl.com/en/express/tracking.html?AWB=',
};

const getCarrierTrackingUrl = (carrier: string, trackingNumber: string): string => {
  const normalizedCarrier = carrier.toUpperCase();
  for (const [key, url] of Object.entries(CARRIER_TRACKING_URLS)) {
    if (normalizedCarrier.includes(key.toUpperCase())) {
      return url + trackingNumber;
    }
  }
  // Generic fallback - Google search
  return `https://www.google.com/search?q=${encodeURIComponent(trackingNumber + ' tracking')}`;
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending Pickup', variant: 'secondary' },
    in_transit: { label: 'In Transit', variant: 'default' },
    out_for_delivery: { label: 'Out for Delivery', variant: 'default' },
    delivered: { label: 'Delivered', variant: 'outline' },
    exception: { label: 'Exception', variant: 'destructive' },
  };
  const config = statusMap[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export function ShipmentTracking() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch recent shipments from Strapi
  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      // Fetch shipments from Strapi - adjust endpoint as needed
      const response = await fetch(
        `${API_BASE}/api/shipments?` + new URLSearchParams({
          'sort[0]': 'createdAt:desc',
          'pagination[limit]': '50',
          'populate': 'order,customer',
        })
      );

      if (!response.ok) {
        // If shipments endpoint doesn't exist, show empty state
        if (response.status === 404) {
          setShipments([]);
          return;
        }
        throw new Error('Failed to fetch shipments');
      }

      const data = await response.json();
      
      const mapped: Shipment[] = (data.data || []).map((s: any) => ({
        id: s.id,
        documentId: s.documentId,
        trackingNumber: s.trackingNumber || s.trackingCode,
        carrier: s.carrier || 'Unknown',
        service: s.service || '',
        status: s.status || 'pending',
        orderNumber: s.order?.orderNumber || s.orderNumber,
        customerName: s.customer?.name || s.customerName,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        labelUrl: s.labelUrl,
        toAddress: {
          name: s.recipientName || s.toAddress?.name || '',
          city: s.recipientCity || s.toAddress?.city || '',
          state: s.recipientState || s.toAddress?.state || '',
        },
      }));

      setShipments(mapped);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
      // Don't show error toast if it's just that the endpoint doesn't exist
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrackingEvents = async (trackingNumber: string) => {
    setIsLoadingEvents(true);
    try {
      // Try to fetch tracking from EasyPost via our API
      const response = await fetch(`${API_BASE}/api/shipping/track/${trackingNumber}`);
      
      if (!response.ok) {
        // If tracking endpoint doesn't exist, show message
        setTrackingEvents([]);
        toast.info('Live tracking not available - click "Track on Carrier" for updates');
        return;
      }

      const data = await response.json();
      setTrackingEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch tracking:', error);
      setTrackingEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    if (shipment.trackingNumber) {
      fetchTrackingEvents(shipment.trackingNumber);
    }
  };

  const filteredShipments = shipments.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.trackingNumber?.toLowerCase().includes(query) ||
      s.orderNumber?.toLowerCase().includes(query) ||
      s.customerName?.toLowerCase().includes(query) ||
      s.toAddress.name?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shipment Tracking</h1>
        <p className="text-muted-foreground">Track shipped orders and view delivery status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Shipments</CardTitle>
              <div className="relative mt-2">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search tracking, order, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">
                  Loading shipments...
                </div>
              ) : filteredShipments.length === 0 ? (
                <div className="p-6 text-center">
                  <Package size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No shipments match your search' : 'No shipments yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a shipping label to see shipments here
                  </p>
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {filteredShipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedShipment?.id === shipment.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleSelectShipment(shipment)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-medium truncate">
                              {shipment.trackingNumber}
                            </p>
                            <CaretRight size={14} className="text-muted-foreground flex-shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {shipment.toAddress.name}
                            {shipment.toAddress.city && ` • ${shipment.toAddress.city}, ${shipment.toAddress.state}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {shipment.carrier}
                            </span>
                            {shipment.orderNumber && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  #{shipment.orderNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(shipment.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tracking Details */}
        <div className="lg:col-span-2">
          {selectedShipment ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Truck size={20} />
                      Tracking Details
                    </CardTitle>
                    <CardDescription>
                      {selectedShipment.carrier} {selectedShipment.service}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(
                      getCarrierTrackingUrl(selectedShipment.carrier, selectedShipment.trackingNumber),
                      '_blank'
                    )}
                  >
                    Track on Carrier
                    <ArrowSquareOut size={14} className="ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tracking Number */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-mono font-medium text-lg">{selectedShipment.trackingNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedShipment.trackingNumber);
                      toast.success('Copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>

                {/* Shipment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedShipment.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shipped</p>
                    <p className="font-medium">{formatDate(selectedShipment.createdAt)}</p>
                  </div>
                  {selectedShipment.orderNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Order</p>
                      <p className="font-medium">#{selectedShipment.orderNumber}</p>
                    </div>
                  )}
                  {selectedShipment.customerName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">{selectedShipment.customerName}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Destination */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-muted-foreground" />
                    <p className="text-sm font-medium">Destination</p>
                  </div>
                  <p className="text-muted-foreground">
                    {selectedShipment.toAddress.name}
                    {selectedShipment.toAddress.city && (
                      <>, {selectedShipment.toAddress.city}, {selectedShipment.toAddress.state}</>
                    )}
                  </p>
                </div>

                <Separator />

                {/* Tracking Events */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-muted-foreground" />
                    <p className="text-sm font-medium">Tracking History</p>
                  </div>
                  
                  {isLoadingEvents ? (
                    <p className="text-sm text-muted-foreground">Loading tracking events...</p>
                  ) : trackingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {trackingEvents.map((event, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`} />
                            {index < trackingEvents.length - 1 && (
                              <div className="w-0.5 h-full bg-muted-foreground/20 mt-1" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-sm">{event.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(event.datetime)}
                              {event.location && ` • ${event.location}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Package size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tracking events available yet</p>
                      <p className="text-xs mt-1">
                        Click "Track on Carrier" for the latest updates
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedShipment.labelUrl && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedShipment.labelUrl, '_blank')}
                      >
                        View Label
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center p-8">
                <Truck size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">Select a Shipment</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a shipment from the list to view tracking details
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
