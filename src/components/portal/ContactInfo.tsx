import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useCustomerAuthContext } from '@/hooks/useCustomerAuth';
import { updateCustomerProfile } from '@/lib/portal-api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ContactInfo() {
  const { customer, refreshCustomer } = useCustomerAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    // Populate form with customer data from auth context
    if (customer) {
      setValue('name', customer.name || '');
      setValue('email', customer.email || '');
      setValue('phone', customer.phone || '');
      setValue('company', customer.company || '');
      setFetchingData(false);
    } else {
      // No customer logged in
      setFetchingData(false);
    }
  }, [customer, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!customer?.documentId) {
      toast.error('Not logged in');
      return;
    }

    setLoading(true);
    try {
      const result = await updateCustomerProfile(customer.documentId, {
        name: data.name,
        phone: data.phone,
        company: data.company,
      });

      if (!result.success) {
        throw new Error(result.error || 'Update failed');
      }

      // Refresh customer data from API
      await refreshCustomer();
      
      toast.success('Profile updated successfully');
      reset(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john@example.com"
          disabled
          className="bg-muted"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Contact support to change your email address
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          {...register('company')}
          placeholder="Acme Inc"
        />
        {errors.company && (
          <p className="text-sm text-destructive">{errors.company.message}</p>
        )}
      </div>

      {/* Show Printavo ID if available */}
      {customer.printavoId && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Printavo Customer ID: <span className="font-mono">{customer.printavoId}</span>
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={!isDirty || loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!isDirty || loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
