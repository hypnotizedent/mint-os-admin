import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shirt, Palette, Ruler, Printer } from "lucide-react";
import { 
  GarmentType, 
  GarmentSize, 
  PrintMethod, 
  GarmentColor,
  GARMENT_COLORS,
  BASE_GARMENT_PRICES,
  PRINT_METHOD_PRICES 
} from "../types/database";

interface ProductSelectorProps {
  selectedGarment: GarmentType;
  selectedColor: string;
  selectedSize: GarmentSize;
  selectedPrintMethod: PrintMethod;
  onGarmentChange: (garment: GarmentType) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: GarmentSize) => void;
  onPrintMethodChange: (method: PrintMethod) => void;
}

const garments: { id: GarmentType; name: string; description: string; popular?: boolean }[] = [
  { id: 't-shirt', name: 'T-Shirt', description: 'Classic cotton tee', popular: true },
  { id: 'hoodie', name: 'Hoodie', description: 'Cozy pullover hoodie', popular: true },
  { id: 'tank-top', name: 'Tank Top', description: 'Sleeveless comfort' },
  { id: 'long-sleeve', name: 'Long Sleeve', description: 'Full sleeve tee' },
  { id: 'polo', name: 'Polo', description: 'Classic polo shirt' },
  { id: 'sweatshirt', name: 'Sweatshirt', description: 'Crew neck sweatshirt' },
  { id: 'hat', name: 'Hat', description: 'Baseball cap' },
  { id: 'jacket', name: 'Jacket', description: 'Zip-up jacket' },
];

const sizes: GarmentSize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const printMethods: { id: PrintMethod; name: string; description: string; best?: string }[] = [
  { id: 'screen-print', name: 'Screen Print', description: 'Best for bulk orders', best: 'bulk' },
  { id: 'dtg', name: 'DTG Print', description: 'Best for detailed designs', best: 'detail' },
  { id: 'embroidery', name: 'Embroidery', description: 'Professional stitched look' },
  { id: 'heat-transfer', name: 'Heat Transfer', description: 'Quick turnaround' },
  { id: 'sublimation', name: 'Sublimation', description: 'All-over prints' },
];

export const ProductSelector = ({ 
  selectedGarment, 
  selectedColor,
  selectedSize,
  selectedPrintMethod,
  onGarmentChange,
  onColorChange,
  onSizeChange,
  onPrintMethodChange 
}: ProductSelectorProps) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shirt className="h-5 w-5 text-blue-600" />
          Product Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="garment" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="garment" className="text-xs">
              <Shirt className="h-3 w-3 mr-1" />
              Type
            </TabsTrigger>
            <TabsTrigger value="color" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Color
            </TabsTrigger>
            <TabsTrigger value="size" className="text-xs">
              <Ruler className="h-3 w-3 mr-1" />
              Size
            </TabsTrigger>
            <TabsTrigger value="print" className="text-xs">
              <Printer className="h-3 w-3 mr-1" />
              Print
            </TabsTrigger>
          </TabsList>

          {/* Garment Type */}
          <TabsContent value="garment" className="space-y-3 mt-0">
            {garments.map((garment) => (
              <div
                key={garment.id}
                onClick={() => onGarmentChange(garment.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                  selectedGarment === garment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-800">{garment.name}</h4>
                  <div className="flex items-center gap-2">
                    {garment.popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                    <span className="font-semibold text-blue-600">
                      ${BASE_GARMENT_PRICES[garment.id].toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{garment.description}</p>
              </div>
            ))}
          </TabsContent>

          {/* Color Picker */}
          <TabsContent value="color" className="mt-0">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {GARMENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onColorChange(color.hex)}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedColor === color.hex
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.hex && (
                      <span className="flex items-center justify-center">
                        <svg 
                          className={`h-5 w-5 ${color.hex === '#FFFFFF' || color.hex === '#ca8a04' || color.hex === '#d4a574' ? 'text-gray-800' : 'text-white'}`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Selected: <span className="font-medium">
                    {GARMENT_COLORS.find(c => c.hex === selectedColor)?.name || 'White'}
                  </span>
                </span>
              </div>
            </div>
          </TabsContent>

          {/* Size Selector */}
          <TabsContent value="size" className="mt-0">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Size</Label>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => onSizeChange(size)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="text-center text-sm text-gray-500">
                Size guide available at checkout
              </div>
            </div>
          </TabsContent>

          {/* Print Method */}
          <TabsContent value="print" className="space-y-3 mt-0">
            {printMethods.map((method) => {
              const pricing = PRINT_METHOD_PRICES[method.id];
              return (
                <div
                  key={method.id}
                  onClick={() => onPrintMethodChange(method.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                    selectedPrintMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-800">{method.name}</h4>
                    <div className="flex items-center gap-2">
                      {method.best && (
                        <Badge variant="outline" className="text-xs">
                          {method.best === 'bulk' ? 'Best for Bulk' : 'Best for Detail'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{method.description}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    {pricing.setup > 0 && `Setup: $${pricing.setup}`}
                    {pricing.setup > 0 && pricing.perColor > 0 && ' • '}
                    {pricing.perColor > 0 && `Per color: $${pricing.perColor}`}
                    {pricing.setup === 0 && pricing.perColor === 0 && 'No additional fees'}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
