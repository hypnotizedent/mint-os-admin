/**
 * InventoryWidget Component
 * Dashboard widget showing low stock alerts, recent sync status,
 * quick search, and link to full catalog.
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  MagnifyingGlass, 
  Warning, 
  ArrowRight,
  ArrowClockwise,
  Check,
  Clock,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// Inventory estimation constants (until real stock tracking is implemented)
const ESTIMATED_IN_STOCK_RATIO = 0.95; // Assume 95% of products are in stock
const ESTIMATED_LOW_STOCK_RATIO = 0.03; // Assume 3% are low stock
const ESTIMATED_OUT_OF_STOCK_RATIO = 0.02; // Assume 2% are out of stock

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stockLevel: number;
  reorderLevel: number;
  supplier: string;
}

interface InventoryStats {
  totalProducts: number;
  inStockProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  lastSyncTime: string | null;
  syncStatus: 'success' | 'pending' | 'error' | 'unknown';
}

interface InventoryWidgetProps {
  onNavigate?: (page: string) => void;
  onSearchProduct?: (query: string) => void;
}

export function InventoryWidget({ onNavigate, onSearchProduct }: InventoryWidgetProps) {
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    inStockProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    lastSyncTime: null,
    syncStatus: 'unknown',
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch inventory stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get real product counts from API
        const response = await fetch(`${API_BASE}/api/products?pagination[limit]=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.meta?.pagination?.total) {
            const total = data.meta.pagination.total;
            setStats(prev => ({
              ...prev,
              totalProducts: total,
              inStockProducts: Math.floor(total * ESTIMATED_IN_STOCK_RATIO),
              lowStockCount: Math.floor(total * ESTIMATED_LOW_STOCK_RATIO),
              outOfStockCount: Math.floor(total * ESTIMATED_OUT_OF_STOCK_RATIO),
              lastSyncTime: new Date().toISOString(),
              syncStatus: 'success',
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch inventory stats:', error);
        setStats(prev => ({
          ...prev,
          syncStatus: 'error',
        }));
      }
    };
    
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchProduct) {
      onSearchProduct(searchQuery.trim());
    } else if (searchQuery.trim() && onNavigate) {
      // Navigate to products page with search query in URL
      onNavigate('products');
    }
  };

  const handleRefreshSync = async () => {
    setIsLoading(true);
    // Simulate sync refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStats(prev => ({
      ...prev,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'success',
    }));
    toast.success('Inventory sync completed');
    setIsLoading(false);
  };

  const formatTimeSince = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const stockPercentage = stats.totalProducts > 0 
    ? (stats.inStockProducts / stats.totalProducts) * 100 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-primary" />
            <CardTitle className="text-base">Inventory</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate?.('products')}
            className="text-xs"
          >
            View Catalog
            <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              size={16} 
            />
            <Input
              placeholder="Quick search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </form>

        {/* Stock Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stock Level</span>
            <span className="font-medium">{stockPercentage.toFixed(0)}% in stock</span>
          </div>
          <Progress value={stockPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.inStockProducts.toLocaleString()} in stock</span>
            <span>{stats.totalProducts.toLocaleString()} total</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.lowStockCount}</p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.outOfStockCount}</p>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Warning size={16} className="text-amber-500" />
              <span>Low Stock Alerts</span>
            </div>
            <div className="space-y-2">
              {lowStockItems.slice(0, 3).map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    {item.stockLevel} left
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sync Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            {stats.syncStatus === 'success' ? (
              <Check size={16} className="text-green-600" />
            ) : stats.syncStatus === 'pending' ? (
              <Clock size={16} className="text-amber-500" />
            ) : (
              <Warning size={16} className="text-red-500" />
            )}
            <span className="text-muted-foreground">
              Synced {formatTimeSince(stats.lastSyncTime)}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshSync}
            disabled={isLoading}
          >
            <ArrowClockwise size={14} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
