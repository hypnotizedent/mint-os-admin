/**
 * NotificationPreferences Component
 * Customer settings form for multi-channel notification preferences
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Bell,
  Envelope,
  DeviceMobile,
  Check,
  Warning,
  SpinnerGap,
  PaperPlaneTilt,
} from '@phosphor-icons/react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Notification event types with labels and defaults
const EVENT_TYPES = [
  { type: 'payment_received', label: 'Payment Received', description: 'When payment is processed', defaultEmail: true, defaultSMS: false },
  { type: 'garments_arrived', label: 'Garments Arrived', description: 'When blank garments arrive', defaultEmail: true, defaultSMS: false },
  { type: 'artwork_ready', label: 'Artwork Ready', description: 'When artwork is approved', defaultEmail: true, defaultSMS: false },
  { type: 'in_production', label: 'In Production', description: 'When order enters production', defaultEmail: true, defaultSMS: false },
  { type: 'quality_check', label: 'Quality Check', description: 'When quality check is complete', defaultEmail: true, defaultSMS: false },
  { type: 'ready_for_pickup', label: 'Ready for Pickup', description: 'Order is ready for pickup', defaultEmail: true, defaultSMS: true },
  { type: 'shipped', label: 'Shipped', description: 'Order has been shipped', defaultEmail: true, defaultSMS: true },
] as const;

type EventType = typeof EVENT_TYPES[number]['type'];

interface EventPreference {
  email: boolean;
  sms: boolean;
}

interface NotificationPreferences {
  id?: string;
  documentId?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  smsForPickupOnly: boolean;
  emailAddress: string;
  smsPhone: string;
  preferences: Record<EventType, EventPreference>;
}

interface NotificationPreferencesProps {
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
}

// Phone number validation regex (E.164 format)
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// Normalize phone number to E.164
const normalizePhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  if (phone.startsWith('+')) {
    return phone.replace(/[^\d+]/g, '');
  }
  return phone;
};

export function NotificationPreferences({
  customerId,
  customerEmail,
  customerPhone,
}: NotificationPreferencesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<'email' | 'sms' | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: false,
    smsForPickupOnly: true,
    emailAddress: customerEmail || '',
    smsPhone: customerPhone || '',
    preferences: EVENT_TYPES.reduce((acc, event) => {
      acc[event.type] = { email: event.defaultEmail, sms: event.defaultSMS };
      return acc;
    }, {} as Record<EventType, EventPreference>),
  });
  const [phoneError, setPhoneError] = useState<string>('');

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/notifications/preferences/${customerId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setPreferences({
              ...data.data,
              emailAddress: data.data.emailAddress || customerEmail || '',
              smsPhone: data.data.smsPhone || customerPhone || '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
        toast.error('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [customerId, customerEmail, customerPhone]);

  // Validate phone number
  const validatePhone = useCallback((phone: string): boolean => {
    if (!phone) {
      setPhoneError('');
      return true;
    }
    const normalized = normalizePhoneNumber(phone);
    if (!PHONE_REGEX.test(normalized.replace(/[\s-()]/g, ''))) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  }, []);

  // Handle phone input change
  const handlePhoneChange = (value: string) => {
    setPreferences(prev => ({ ...prev, smsPhone: value }));
    validatePhone(value);
  };

  // Save preferences
  const savePreferences = async () => {
    // Validate phone if SMS is enabled
    if (preferences.smsEnabled && !validatePhone(preferences.smsPhone)) {
      toast.error('Please enter a valid phone number for SMS notifications');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/notifications/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          preferenceId: preferences.documentId || preferences.id,
          emailEnabled: preferences.emailEnabled,
          smsEnabled: preferences.smsEnabled,
          smsForPickupOnly: preferences.smsForPickupOnly,
          emailAddress: preferences.emailAddress,
          smsPhone: normalizePhoneNumber(preferences.smsPhone),
          preferences: preferences.preferences,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreferences(prev => ({
            ...prev,
            id: data.data.id,
            documentId: data.data.documentId,
          }));
          toast.success('Notification preferences saved');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Send test notification
  const sendTestNotification = async (channel: 'email' | 'sms') => {
    setIsTesting(channel);
    try {
      const response = await fetch(`${API_BASE}/api/notifications/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          channel,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Test ${channel.toUpperCase()} sent successfully`);
      } else {
        toast.error(data.error || `Failed to send test ${channel.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error(`Failed to send test ${channel.toUpperCase()}`);
    } finally {
      setIsTesting(null);
    }
  };

  // Toggle event preference
  const toggleEventPreference = (eventType: EventType, channel: 'email' | 'sms') => {
    setPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [eventType]: {
          ...prev.preferences[eventType],
          [channel]: !prev.preferences[eventType]?.[channel],
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>
            Configure how you want to receive order updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Envelope className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="email-enabled" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive order updates via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences.emailEnabled}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, emailEnabled: checked }))
                }
              />
            </div>

            {preferences.emailEnabled && (
              <div className="ml-12 space-y-2">
                <Label htmlFor="email-address">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email-address"
                    type="email"
                    value={preferences.emailAddress}
                    onChange={(e) =>
                      setPreferences(prev => ({ ...prev, emailAddress: e.target.value }))
                    }
                    placeholder="your@email.com"
                    className="max-w-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendTestNotification('email')}
                    disabled={!preferences.emailAddress || isTesting === 'email'}
                  >
                    {isTesting === 'email' ? (
                      <SpinnerGap className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <PaperPlaneTilt className="h-4 w-4 mr-1" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* SMS Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <DeviceMobile className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <Label htmlFor="sms-enabled" className="text-base font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive order updates via text message
                  </p>
                </div>
              </div>
              <Switch
                id="sms-enabled"
                checked={preferences.smsEnabled}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, smsEnabled: checked }))
                }
              />
            </div>

            {preferences.smsEnabled && (
              <div className="ml-12 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 max-w-sm">
                      <Input
                        id="sms-phone"
                        type="tel"
                        value={preferences.smsPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className={phoneError ? 'border-red-500' : ''}
                      />
                      {phoneError && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <Warning className="h-4 w-4" />
                          {phoneError}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendTestNotification('sms')}
                      disabled={!preferences.smsPhone || !!phoneError || isTesting === 'sms'}
                    >
                      {isTesting === 'sms' ? (
                        <SpinnerGap className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <PaperPlaneTilt className="h-4 w-4 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="sms-pickup-only"
                    checked={preferences.smsForPickupOnly}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, smsForPickupOnly: checked }))
                    }
                  />
                  <Label htmlFor="sms-pickup-only" className="text-sm">
                    Only send SMS for pickup and shipping notifications
                    <span className="text-muted-foreground ml-1">(recommended to avoid spam)</span>
                  </Label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-Event Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Events</CardTitle>
          <CardDescription>
            Choose which events trigger notifications and through which channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {EVENT_TYPES.map((event) => {
              const eventPrefs = preferences.preferences[event.type] || {
                email: event.defaultEmail,
                sms: event.defaultSMS,
              };
              const isSMSEvent = event.type === 'ready_for_pickup' || event.type === 'shipped';

              return (
                <div
                  key={event.type}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.label}</span>
                      {isSMSEvent && (
                        <Badge variant="outline" className="text-xs">
                          SMS Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.emailEnabled && eventPrefs.email}
                        onCheckedChange={() => toggleEventPreference(event.type, 'email')}
                        disabled={!preferences.emailEnabled}
                      />
                      <Label className="text-sm w-12">Email</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          preferences.smsEnabled &&
                          (!preferences.smsForPickupOnly || isSMSEvent) &&
                          eventPrefs.sms
                        }
                        onCheckedChange={() => toggleEventPreference(event.type, 'sms')}
                        disabled={
                          !preferences.smsEnabled ||
                          (preferences.smsForPickupOnly && !isSMSEvent)
                        }
                      />
                      <Label className="text-sm w-12">SMS</Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? (
            <>
              <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default NotificationPreferences;
