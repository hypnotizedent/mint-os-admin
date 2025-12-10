
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShopifyApp } from "@/components/ShopifyApp";

const ShopifyInstall = () => {
  const [searchParams] = useSearchParams();
  const [shopDomain, setShopDomain] = useState<string>("");

  useEffect(() => {
    // Get shop domain from URL parameters (Shopify OAuth flow)
    const shop = searchParams.get("shop");
    if (shop) {
      setShopDomain(shop);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <ShopifyApp shopDomain={shopDomain} />
    </div>
  );
};

export default ShopifyInstall;
