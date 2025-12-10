
import { ShoppingBag, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Palette className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Custom Apparel Studio
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              My Designs
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Save & Order
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
