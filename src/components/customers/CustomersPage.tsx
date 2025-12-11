import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MagnifyingGlass, Plus, EnvelopeSimple, Phone, Buildings, Package, CurrencyDollar } from "@phosphor-icons/react"
import { toast } from "sonner"
import { customersApi, type CreateCustomerInput } from "@/lib/api-client"
import { EmptyState } from "@/components/ui/states"
import { CustomerSegmentBadge, type CustomerSegment, segmentConfig } from "./CustomerSegmentBadge"
import type { Customer } from "@/lib/types"

interface ExtendedCustomer extends Customer {
  segment?: CustomerSegment;
}

interface CustomersPageProps {
  customers: ExtendedCustomer[]
  onViewCustomer?: (customerId: string) => void
  onNewOrder?: (customerId: string) => void
  onCustomerCreated?: (customer: Customer) => void
}

export function CustomersPage({ customers, onViewCustomer, onNewOrder, onCustomerCreated }: CustomersPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | 'all'>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCustomer, setNewCustomer] = useState<CreateCustomerInput>({
    name: "",
    email: "",
    phone: "",
    company: "",
  })

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === "" ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSegment = segmentFilter === 'all' || 
      customer.segment === segmentFilter ||
      (!customer.segment && segmentFilter === 'b2c') // Default to B2C if no segment
    
    return matchesSearch && matchesSegment
  })

  const totalRevenue = customers.reduce((acc, c) => acc + (c.paidRevenue ?? c.totalRevenue), 0)
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const totalOrders = customers.reduce((acc, c) => acc + c.totalOrders, 0)

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
      toast.error("Please fill in name and email")
      return
    }

    setIsCreating(true)
    try {
      const result = await customersApi.create(newCustomer)
      
      if (result.success && result.data) {
        toast.success("Customer created successfully!", {
          description: `${newCustomer.name} has been added to your customers.`,
        })
        
        // Notify parent component
        onCustomerCreated?.({
          id: result.data.documentId,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || "",
          company: result.data.company || "",
          totalOrders: 0,
          totalRevenue: 0,
          lastOrderDate: new Date().toISOString(),
          status: 'active',
        })
        
        // Reset form and close dialog
        setNewCustomer({ name: "", email: "", phone: "", company: "" })
        setShowAddDialog(false)
      } else {
        toast.error("Failed to create customer", {
          description: result.error || "Please try again.",
        })
      }
    } catch (error) {
      toast.error("Failed to create customer")
      console.error("Create customer error:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships and orders</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus size={18} weight="bold" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Paid Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-2">${(totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-magenta/10">
              <CurrencyDollar size={24} weight="fill" className="text-magenta" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Active Customers</p>
              <p className="text-3xl font-bold text-foreground mt-2">{activeCustomers}</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan/10">
              <Buildings size={24} weight="fill" className="text-cyan" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Orders</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalOrders}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Package size={24} weight="fill" className="text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search customers by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={segmentFilter}
          onValueChange={(value) => setSegmentFilter(value as CustomerSegment | 'all')}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Segments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            {Object.entries(segmentConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                      {customer.name}
                    </h3>
                    {customer.segment && (
                      <CustomerSegmentBadge segment={customer.segment} size="sm" showLabel={false} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{customer.company}</p>
                </div>
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                  {customer.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <EnvelopeSimple size={16} />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone size={16} />
                  <span>{customer.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-lg font-semibold text-foreground">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${((customer.paidRevenue ?? customer.totalRevenue) || 0).toLocaleString()}
                  </p>
                  {(customer.quoteTotal ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +${customer.quoteTotal?.toLocaleString()} pending
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Last order: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewCustomer?.(customer.id);
                  }}
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNewOrder?.(customer.id);
                  }}
                >
                  New Order
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        searchQuery ? (
          <EmptyState
            variant="search"
            title="No customers found"
            description={`No customers match "${searchQuery}". Try adjusting your search.`}
          />
        ) : customers.length === 0 ? (
          <EmptyState
            variant="customers"
            action={{
              label: "Add Customer",
              onClick: () => setShowAddDialog(true)
            }}
          />
        ) : (
          <EmptyState
            variant="search"
            title="No customers found"
            description="Try adjusting your search criteria."
          />
        )
      )}

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer record. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={newCustomer.company}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Inc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
