import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your Mint OS preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Shop Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input id="shop-name" placeholder="Your Print Shop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-email">Email</Label>
                <Input id="shop-email" type="email" placeholder="contact@yourshop.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-phone">Phone</Label>
                <Input id="shop-phone" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-address">Address</Label>
                <Input id="shop-address" placeholder="123 Main St, City, State" />
              </div>
            </div>
            <div className="mt-6">
              <Button>Save Changes</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Business Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                <Input id="tax-rate" type="number" placeholder="8.25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" placeholder="USD" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: "Job Status Changes", description: "Get notified when a job status changes" },
                { label: "Low Stock Alerts", description: "Receive alerts for low inventory items" },
                { label: "Machine Errors", description: "Immediate notifications for machine issues" },
                { label: "Customer Messages", description: "Notifications for new customer messages" },
                { label: "Payment Received", description: "Get notified when payments are received" },
                { label: "Quote Approved", description: "Notifications when customers approve quotes" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">P</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Printavo</h3>
                  <p className="text-sm text-green-600">Connected</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Sync orders, customers, and invoices with Printavo.</p>
              <Button variant="outline" size="sm">Configure</Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-muted-foreground">S</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Stripe</h3>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Accept online payments from customers.</p>
              <Button variant="outline" size="sm">Connect</Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-muted-foreground">E</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">EasyPost</h3>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Generate shipping labels and track shipments.</p>
              <Button variant="outline" size="sm">Connect</Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
