import { Crown, Buildings, Users, ShoppingCart } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export type CustomerSegment = 'vip' | 'b2b' | 'middleman' | 'b2c';

interface CustomerSegmentBadgeProps {
  segment: CustomerSegment;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const segmentConfig: Record<CustomerSegment, {
  label: string;
  icon: typeof Crown;
  bgGradient: string;
  iconColor: string;
  textColor: string;
  description: string;
}> = {
  vip: {
    label: 'VIP',
    icon: Crown,
    bgGradient: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500',
    iconColor: 'text-amber-900',
    textColor: 'text-amber-900',
    description: 'High-frequency or high-value customer',
  },
  b2b: {
    label: 'B2B',
    icon: Buildings,
    bgGradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600',
    iconColor: 'text-white',
    textColor: 'text-white',
    description: 'Business customer with repeat orders',
  },
  middleman: {
    label: 'Middleman',
    icon: Users,
    bgGradient: 'bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600',
    iconColor: 'text-white',
    textColor: 'text-white',
    description: 'High-value reseller or wholesaler',
  },
  b2c: {
    label: 'B2C',
    icon: ShoppingCart,
    bgGradient: 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600',
    iconColor: 'text-white',
    textColor: 'text-white',
    description: 'Consumer customer',
  },
};

const sizeConfig = {
  sm: {
    badge: 'px-1.5 py-0.5 text-xs gap-1',
    icon: 12,
  },
  md: {
    badge: 'px-2 py-1 text-sm gap-1.5',
    icon: 14,
  },
  lg: {
    badge: 'px-3 py-1.5 text-base gap-2',
    icon: 18,
  },
};

export function CustomerSegmentBadge({
  segment,
  size = 'md',
  showLabel = true,
  className,
}: CustomerSegmentBadgeProps) {
  const config = segmentConfig[segment] || segmentConfig.b2c;
  const sizeStyle = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold shadow-sm transition-transform hover:scale-105',
        config.bgGradient,
        config.textColor,
        sizeStyle.badge,
        className
      )}
      title={config.description}
    >
      <Icon size={sizeStyle.icon} weight="fill" className={config.iconColor} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

interface CustomerSegmentInfoProps {
  segment: CustomerSegment;
  details?: {
    totalOrders?: number;
    totalSpend?: number;
    avgOrderValue?: number;
    ordersLast30Days?: number;
    repeatSimilarity?: number;
    reason?: string;
  };
  autoDetected?: boolean;
  lastUpdate?: string;
}

export function CustomerSegmentInfo({
  segment,
  details,
  autoDetected = true,
  lastUpdate,
}: CustomerSegmentInfoProps) {
  const config = segmentConfig[segment] || segmentConfig.b2c;

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CustomerSegmentBadge segment={segment} size="lg" />
          <span className="text-xs text-muted-foreground">
            {autoDetected ? 'Auto-detected' : 'Manually set'}
          </span>
        </div>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">
            Updated: {new Date(lastUpdate).toLocaleDateString()}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">{config.description}</p>

      {details && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-border">
          {details.totalOrders !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-lg font-semibold">{details.totalOrders}</p>
            </div>
          )}
          {details.totalSpend !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Total Spend</p>
              <p className="text-lg font-semibold">
                ${details.totalSpend.toLocaleString()}
              </p>
            </div>
          )}
          {details.avgOrderValue !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Avg Order</p>
              <p className="text-lg font-semibold">
                ${details.avgOrderValue.toLocaleString()}
              </p>
            </div>
          )}
          {details.ordersLast30Days !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Orders (30d)</p>
              <p className="text-lg font-semibold">{details.ordersLast30Days}</p>
            </div>
          )}
          {details.repeatSimilarity !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Repeat Rate</p>
              <p className="text-lg font-semibold">
                {(details.repeatSimilarity * 100).toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      )}

      {details?.reason && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          {details.reason}
        </p>
      )}
    </div>
  );
}

export { segmentConfig };
