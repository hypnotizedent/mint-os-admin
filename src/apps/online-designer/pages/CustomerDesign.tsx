
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CustomerDesignSession } from "@/components/CustomerDesignSession";

const CustomerDesign = () => {
  const [searchParams] = useSearchParams();
  const [shopDomain, setShopDomain] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");

  useEffect(() => {
    // Get parameters from URL (would be passed from Shopify)
    const shop = searchParams.get("shop");
    const product = searchParams.get("product_id");
    const customer = searchParams.get("customer_id");

    if (shop) setShopDomain(shop);
    if (product) setProductId(product);
    if (customer) setCustomerId(customer);
  }, [searchParams]);

  if (!shopDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CustomerDesignSession 
      shopDomain={shopDomain}
      productId={productId}
      customerId={customerId}
    />
  );
};

export default CustomerDesign;
