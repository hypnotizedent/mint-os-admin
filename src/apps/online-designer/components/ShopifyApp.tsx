import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Store, CheckCircle } from "lucide-react";

interface ShopifyAppProps {
  shopDomain?: string;
}

export const ShopifyApp = ({ shopDomain }: ShopifyAppProps) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<any>(null);

  // TODO: Replace with Strapi integration
  // For now, this is a placeholder - Shopify OAuth will be integrated later

  const handleInstallApp = async () => {
    if (!shopDomain) {
      toast.error("Shop domain is required");
      return;
    }

    setLoading(true);
    try {
      // Placeholder - would redirect to Shopify OAuth in production
      toast.info("Shopify integration coming soon!");
      setTimeout(() => {
        setIsInstalled(true);
        setShop({ shop_domain: shopDomain });
        toast.success("Demo mode: App installed!");
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Installation error:', error);
      toast.error("Failed to install app");
      setLoading(false);
    }
  };

  if (isInstalled) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            App Installed Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Custom Apparel Designer is now active on your store: <strong>{shopDomain}</strong></p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Next Steps:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Configure product templates</li>
                <li>• Set pricing rules</li>
                <li>• Customize design tools</li>
                <li>• Test the customer experience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-blue-600" />
          Install Custom Apparel Designer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Install the Custom Apparel Designer app to enable product customization in your Shopify store.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Features Include:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Interactive design canvas</li>
              <li>• Multiple garment types</li>
              <li>• Real-time pricing</li>
              <li>• Order management</li>
              <li>• Design file handling</li>
            </ul>
          </div>

          <Button 
            onClick={handleInstallApp}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Installing...
              </>
            ) : (
              'Install App'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
