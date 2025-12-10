import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Loader2,
  LogIn,
  Lock,
  Mail,
  User,
  MapPin,
  Settings,
  type LucideIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { getActivityLog, type ActivityItem as ApiActivityItem } from '@/lib/portal-customer-api';

interface ActivityItem {
  id: string;
  activityType: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

const activityIcons: Record<string, LucideIcon> = {
  login: LogIn,
  password_changed: Lock,
  email_updated: Mail,
  profile_updated: User,
  address_added: MapPin,
  address_updated: MapPin,
  address_deleted: MapPin,
  preferences_updated: Settings,
  '2fa_enabled': Lock,
  '2fa_disabled': Lock,
};

const activityColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  login: 'outline',
  password_changed: 'default',
  email_updated: 'default',
  profile_updated: 'secondary',
  address_added: 'secondary',
  address_updated: 'secondary',
  address_deleted: 'destructive',
  preferences_updated: 'secondary',
  '2fa_enabled': 'default',
  '2fa_disabled': 'destructive',
};

export function ActivityLog() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await getActivityLog();
      
      if (response.success && response.data) {
        // Map API response to component's ActivityItem interface
        const mappedActivities: ActivityItem[] = response.data.map((item: ApiActivityItem) => ({
          id: item.id,
          activityType: item.activityType,
          description: item.description,
          ipAddress: item.ipAddress,
          createdAt: item.createdAt,
        }));
        setActivities(mappedActivities);
      } else {
        // If no activities or API unavailable, show empty state
        setActivities([]);
      }
    } catch (error) {
      console.error('Failed to load activity log:', error);
      toast.error('Failed to load activity log');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Your account activity will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Recent account activity and changes
      </p>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.activityType] || Settings;
          const badgeVariant = activityColors[activity.activityType] || 'outline';

          return (
            <div key={activity.id}>
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(activity.createdAt), 'PPpp')}
                        </p>
                      </div>
                      <Badge variant={badgeVariant}>
                        {activity.activityType.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {activity.ipAddress && (
                      <p className="text-xs text-muted-foreground">
                        IP: {activity.ipAddress}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
              {index < activities.length - 1 && <Separator className="my-3" />}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <p className="text-sm text-muted-foreground">
          Showing last {activities.length} activities
        </p>
      </div>
    </div>
  );
}
