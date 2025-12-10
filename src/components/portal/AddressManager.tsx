import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, MapPin, Pencil, Trash2, Star, Loader2 } from 'lucide-react';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  country: z.string().default('US'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address extends AddressFormData {
  id: string;
  isDefault: boolean;
}

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/customer-addresses', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();

      // Mock data
      const mockAddresses: Address[] = [
        {
          id: '1',
          label: 'Home',
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          address2: 'Apt 4B',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'US',
          phone: '555-1234',
          isDefault: true,
        },
        {
          id: '2',
          label: 'Office',
          firstName: 'John',
          lastName: 'Doe',
          company: 'Acme Inc',
          address1: '456 Business Ave',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'US',
          phone: '555-5678',
          isDefault: false,
        },
      ];

      setAddresses(mockAddresses);
    } catch (error) {
      toast.error('Failed to load addresses');
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    setLoading(true);
    try {
      if (editingAddress) {
        // Update existing address
        // await fetch(`/api/customer-addresses/${editingAddress.id}`, {
        //   method: 'PATCH',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${token}`,
        //   },
        //   body: JSON.stringify(data),
        // });

        setAddresses(addresses.map(addr =>
          addr.id === editingAddress.id ? { ...addr, ...data } : addr
        ));
        toast.success('Address updated successfully');
      } else {
        // Create new address
        // const response = await fetch('/api/customer-addresses', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${token}`,
        //   },
        //   body: JSON.stringify(data),
        // });

        const newAddress: Address = {
          ...data,
          id: Date.now().toString(),
          isDefault: addresses.length === 0,
        };
        setAddresses([...addresses, newAddress]);
        toast.success('Address added successfully');
      }

      setDialogOpen(false);
      reset();
      setEditingAddress(null);
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // await fetch(`/api/customer-addresses/${addressId}/default`, {
      //   method: 'PATCH',
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      })));
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      // await fetch(`/api/customer-addresses/${addressId}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    reset(address);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    reset({
      label: '',
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      phone: '',
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Manage your shipping and billing addresses
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Address Label *</Label>
                <Input
                  id="label"
                  {...register('label')}
                  placeholder="Home, Office, Warehouse, etc."
                />
                {errors.label && (
                  <p className="text-sm text-destructive">{errors.label.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register('company')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input id="address1" {...register('address1')} />
                {errors.address1 && (
                  <p className="text-sm text-destructive">{errors.address1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input id="address2" {...register('address2')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" {...register('state')} placeholder="IL" />
                  {errors.state && (
                    <p className="text-sm text-destructive">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input id="zipCode" {...register('zipCode')} />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingAddress(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAddress ? 'Update' : 'Add'} Address
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{address.label}</span>
                {address.isDefault && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(address)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(address.id)}
                  disabled={address.isDefault}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>{address.firstName} {address.lastName}</p>
              {address.company && <p>{address.company}</p>}
              <p>{address.address1}</p>
              {address.address2 && <p>{address.address2}</p>}
              <p>
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p>{address.phone}</p>
            </div>
            {!address.isDefault && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => handleSetDefault(address.id)}
              >
                Set as Default
              </Button>
            )}
          </Card>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold">No addresses yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first shipping address to get started
          </p>
        </div>
      )}
    </div>
  );
}
