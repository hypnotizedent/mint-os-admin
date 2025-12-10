import { useState, useEffect, useRef, useCallback } from "react";
import { strapi } from "../lib/strapi";
import { DesignCanvas, DesignCanvasRef } from "./DesignCanvas";
import { ProductSelector } from "./GarmentSelector";
import { DesignTools } from "./DesignTools";
import { TextEditor } from "./TextEditor";
import { ArtworkUploader } from "./ArtworkUploader";
import { PricingPanel } from "./PricingPanel";
import { DesignLibrary } from "./DesignLibrary";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, ShoppingCart, Palette, Type, Upload, FolderOpen } from "lucide-react";
import type { 
  GarmentType, 
  GarmentSize, 
  PrintMethod, 
  SavedDesign
} from "../types/database";

interface DesignObject {
  type: string;
  data: unknown;
}

interface CustomerDesignSessionProps {
  customerEmail?: string;
  customerId?: string;
  productId?: string;
}

export const CustomerDesignSession = ({ 
  customerEmail,
  customerId,
  productId
}: CustomerDesignSessionProps) => {
  // Canvas ref
  const canvasRef = useRef<DesignCanvasRef>(null);
  
  // Product configuration state
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>('t-shirt');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedSize, setSelectedSize] = useState<GarmentSize>('M');
  const [selectedPrintMethod, setSelectedPrintMethod] = useState<PrintMethod>('screen-print');
  const [quantity, setQuantity] = useState(12);
  
  // Design state
  const [designs, setDesigns] = useState<DesignObject[]>([]);
  const [canvasData, setCanvasData] = useState<Record<string, unknown> | null>(null);
  const [numColors, setNumColors] = useState(1);
  
  // Session state
  const [sessionDocumentId, setSessionDocumentId] = useState<string | null>(null);
  const [currentDesignId, setCurrentDesignId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Active tool tab
  const [activeToolTab, setActiveToolTab] = useState('tools');

  // Initialize session
  useEffect(() => {
    createDesignSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track unsaved changes
  useEffect(() => {
    if (designs.length > 0 || canvasData) {
      setHasUnsavedChanges(true);
    }
  }, [designs, canvasData]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const createDesignSession = async () => {
    try {
      const sessionData = {
        customerEmail: customerEmail || '',
        customerId: customerId || '',
        garmentType: selectedGarment,
        designs: [],
        pricing: {
          basePrice: 0,
          garmentCost: 0,
          printCost: 0,
          setupFee: 0,
          colorFees: 0,
          rushFee: 0,
          discount: 0,
          subtotal: 0,
          total: 0,
          perUnitPrice: 0,
        },
        status: 'active' as const,
        productId: productId || '',
      };

      const response = await strapi.createDesignSession(sessionData);
      setSessionDocumentId(response.data.documentId || null);
      toast.success("Design session started!");
    } catch (error) {
      console.error('Error creating design session:', error);
      // Continue without session - allow offline designing
      toast.info("Working offline - designs will be saved locally");
    }
  };

  const handleDesignChange = useCallback((newDesigns: DesignObject[]) => {
    setDesigns(newDesigns);
    // Count unique colors (simplified - in production this would analyze the actual designs)
    setNumColors(Math.max(1, newDesigns.length));
  }, []);

  const handleCanvasDataChange = useCallback((data: Record<string, unknown>) => {
    setCanvasData(data);
  }, []);

  const saveDesignSession = async () => {
    setSaving(true);
    try {
      const designData = canvasRef.current?.exportDesign();
      
      if (sessionDocumentId) {
        await strapi.updateDesignSession(sessionDocumentId, {
          garmentType: selectedGarment,
          designs: designs,
          canvasData: designData,
          pricing: {
            basePrice: 0,
            garmentCost: 0,
            printCost: 0,
            setupFee: 0,
            colorFees: 0,
            rushFee: 0,
            discount: 0,
            subtotal: 0,
            total: 0,
            perUnitPrice: 0,
          },
        });
      }
      
      setHasUnsavedChanges(false);
      toast.success("Design saved!");
    } catch (error) {
      console.error('Error saving design session:', error);
      toast.error("Failed to save design");
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = async () => {
    // Validate design
    if (designs.length === 0) {
      toast.error("Please add at least one design element");
      return;
    }

    try {
      const designData = canvasRef.current?.exportDesign();
      
      // Create custom order in Strapi
      const orderData = {
        sessionId: sessionDocumentId || `local_${Date.now()}`,
        customerEmail: customerEmail || '',
        customerId: customerId || '',
        garmentType: selectedGarment,
        designs: designData,
        pricing: {
          basePrice: 0,
          quantity: quantity,
        },
        status: 'pending' as const,
        notes: `Size: ${selectedSize}, Color: ${selectedColor}, Print Method: ${selectedPrintMethod}`,
      };

      await strapi.createCustomOrder(orderData);
      toast.success("Added to cart!");
      
      // Mark session as completed
      if (sessionDocumentId) {
        await strapi.updateDesignSession(sessionDocumentId, {
          status: 'completed',
        });
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Failed to add to cart");
    }
  };

  const handleUploadImage = useCallback((file: File) => {
    canvasRef.current?.uploadImage(file);
  }, []);

  interface TextOptions {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    fontWeight?: string | number;
    fontStyle?: string;
    textAlign?: string;
  }

  const handleAddText = useCallback((text: string, options?: TextOptions) => {
    canvasRef.current?.addText(text, options);
  }, []);

  const handleAddShape = useCallback((type: 'rect' | 'circle') => {
    canvasRef.current?.addShape(type);
  }, []);

  const handleLoadDesign = useCallback((design: SavedDesign) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Load this design anyway?');
      if (!confirm) return;
    }
    
    canvasRef.current?.loadDesign(design.canvas_data);
    setSelectedGarment(design.garment_type);
    setSelectedColor(design.garment_color);
    setCurrentDesignId(design.id);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges]);

  const handleNewDesign = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Start a new design anyway?');
      if (!confirm) return;
    }
    
    // Reset everything
    setDesigns([]);
    setCanvasData(null);
    setCurrentDesignId(undefined);
    setHasUnsavedChanges(false);
    createDesignSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-none">
            <CardHeader className="py-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="h-6 w-6 text-blue-600" />
                  <span>Custom Design Studio</span>
                  {hasUnsavedChanges && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Unsaved changes
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={saveDesignSession}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Design'}
                  </Button>
                  <Button onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeToolTab} onValueChange={setActiveToolTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tools" className="text-xs">
                  <Upload className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="text" className="text-xs">
                  <Type className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="product" className="text-xs">
                  <Palette className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="library" className="text-xs">
                  <FolderOpen className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tools" className="mt-4 space-y-4">
                <DesignTools 
                  onUploadImage={handleUploadImage}
                  onAddText={handleAddText}
                  onAddShape={handleAddShape}
                />
                <ArtworkUploader onUpload={handleUploadImage} />
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <TextEditor onAddText={handleAddText} />
              </TabsContent>

              <TabsContent value="product" className="mt-4">
                <ProductSelector 
                  selectedGarment={selectedGarment}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  selectedPrintMethod={selectedPrintMethod}
                  onGarmentChange={setSelectedGarment}
                  onColorChange={setSelectedColor}
                  onSizeChange={setSelectedSize}
                  onPrintMethodChange={setSelectedPrintMethod}
                />
              </TabsContent>

              <TabsContent value="library" className="mt-4">
                <DesignLibrary 
                  onLoadDesign={handleLoadDesign}
                  onNewDesign={handleNewDesign}
                  currentDesignId={currentDesignId}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-6">
            <DesignCanvas 
              ref={canvasRef}
              selectedGarment={selectedGarment}
              garmentColor={selectedColor}
              designs={designs}
              onDesignChange={handleDesignChange}
              onCanvasDataChange={handleCanvasDataChange}
            />
          </div>

          {/* Right Sidebar - Pricing */}
          <div className="lg:col-span-3">
            <PricingPanel 
              garmentType={selectedGarment}
              printMethod={selectedPrintMethod}
              quantity={quantity}
              numColors={numColors}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onSaveDesign={saveDesignSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
