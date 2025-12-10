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
        <p className="text-muted-foreground mt-1">Configure your PrintShop OS preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Shop Information</h2>
            <div className="space-y-4">
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
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: "Job Status Changes", description: "Get notified when a job status changes" },
                { label: "Low Stock Alerts", description: "Receive alerts for low inventory items" },
                { label: "Machine Errors", description: "Immediate notifications for machine issues" },
                { label: "Customer Messages", description: "Notifications for new customer messages" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
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
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Connected Services</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">No integrations configured yet.</p>
              <Button variant="outline">Add Integration</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
