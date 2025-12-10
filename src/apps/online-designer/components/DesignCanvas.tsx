import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, FabricImage, Rect, FabricText, Circle, FabricObject } from "fabric";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Trash2, 
  Layers,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Download,
  Maximize2
} from "lucide-react";
import type { GarmentType, PrintPlacement } from "../types/database";

interface DesignCanvasProps {
  selectedGarment: GarmentType;
  garmentColor: string;
  designs: any[];
  onDesignChange: (designs: any[]) => void;
  onCanvasDataChange?: (data: any) => void;
  activePlacement?: PrintPlacement;
}

export interface DesignCanvasRef {
  uploadImage: (file: File) => void;
  addText: (text: string, options?: TextOptions) => void;
  addShape: (type: 'rect' | 'circle') => void;
  exportDesign: () => any;
  loadDesign: (data: any) => void;
  getCanvas: () => FabricCanvas | null;
}

interface TextOptions {
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
}

// Canvas history for undo/redo
interface HistoryState {
  json: string;
}

// Canvas configuration constants
const MAX_HISTORY = 50;
const MIN_IMAGE_RESOLUTION = 300; // Minimum recommended resolution in pixels

export const DesignCanvas = forwardRef<DesignCanvasRef, DesignCanvasProps>(({ 
  selectedGarment, 
  garmentColor,
  designs, 
  onDesignChange,
  onCanvasDataChange,
  activePlacement = 'front'
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const isLoadingRef = useRef(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 500,
      backgroundColor: "#f8f9fa",
      preserveObjectStacking: true,
    });

    // Set up selection events
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Track object modifications for undo/redo
    canvas.on('object:modified', () => {
      if (!isLoadingRef.current) {
        saveToHistory(canvas);
        updateDesigns(canvas);
      }
    });

    canvas.on('object:added', () => {
      if (!isLoadingRef.current) {
        saveToHistory(canvas);
        updateDesigns(canvas);
      }
    });

    canvas.on('object:removed', () => {
      if (!isLoadingRef.current) {
        saveToHistory(canvas);
        updateDesigns(canvas);
      }
    });

    setFabricCanvas(canvas);
    updateGarmentSilhouette(canvas, selectedGarment, garmentColor);

    // Save initial state
    saveToHistory(canvas);

    return () => {
      canvas.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update garment when selection changes
  useEffect(() => {
    if (fabricCanvas) {
      updateGarmentSilhouette(fabricCanvas, selectedGarment, garmentColor);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGarment, garmentColor, fabricCanvas]);

  const saveToHistory = useCallback((canvas: FabricCanvas) => {
    const json = JSON.stringify(canvas.toJSON(['isGarment', 'isDesignElement', 'elementType']));
    
    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ json });
      
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const updateDesigns = useCallback((canvas: FabricCanvas) => {
    const designObjects = canvas.getObjects().filter(obj => 
      !(obj as any).isGarment
    );
    onDesignChange(designObjects);
    
    if (onCanvasDataChange) {
      onCanvasDataChange(canvas.toJSON(['isGarment', 'isDesignElement', 'elementType']));
    }
  }, [onDesignChange, onCanvasDataChange]);

  const updateGarmentSilhouette = (canvas: FabricCanvas, garment: GarmentType, color: string) => {
    // Remove existing garment silhouette
    const existingGarment = canvas.getObjects().find(obj => (obj as any).isGarment);
    if (existingGarment) {
      canvas.remove(existingGarment);
    }

    // Create garment silhouette based on selection
    let garmentShape;
    const fillColor = color || '#FFFFFF';
    
    switch (garment) {
      case 'hoodie':
        garmentShape = createHoodieSilhouette(fillColor);
        break;
      case 'tank-top':
        garmentShape = createTankTopSilhouette(fillColor);
        break;
      case 'long-sleeve':
        garmentShape = createLongSleeveSilhouette(fillColor);
        break;
      case 'polo':
        garmentShape = createPoloSilhouette(fillColor);
        break;
      case 'sweatshirt':
        garmentShape = createSweatshirtSilhouette(fillColor);
        break;
      case 'hat':
        garmentShape = createHatSilhouette(fillColor);
        break;
      case 'jacket':
        garmentShape = createJacketSilhouette(fillColor);
        break;
      case 't-shirt':
      default:
        garmentShape = createTShirtSilhouette(fillColor);
    }

    (garmentShape as any).isGarment = true;
    garmentShape.selectable = false;
    garmentShape.evented = false;
    canvas.add(garmentShape);
    canvas.sendObjectToBack(garmentShape);
    canvas.renderAll();
  };

  // Garment silhouette creators
  const createTShirtSilhouette = (fillColor: string) => {
    return new Rect({
      left: 50,
      top: 100,
      width: 300,
      height: 350,
      fill: fillColor,
      stroke: '#e2e8f0',
      strokeWidth: 2,
      rx: 20,
      ry: 20,
    });
  };

  const createHoodieSilhouette = (fillColor: string) => {
    return new Rect({
      left: 50,
      top: 80,
      width: 300,
      height: 380,
      fill: fillColor,
      stroke: '#e2e8f0',
      strokeWidth: 2,
      rx: 25,
      ry: 25,
    });
  };

  const createTankTopSilhouette = (fillColor: string) => {
    return new Rect({
      left: 80,
      top: 100,
      width: 240,
      height: 350,
      fill: fillColor,
      stroke: '#e2e8f0',
      strokeWidth: 2,
      rx: 15,
      ry: 15,
    });
  };

  const createLongSleeveSilhouette = (fillColor: string) => {
    return new Rect({
      left: 30,
      top: 100,
      width: 340,
      height: 350,
      fill: fillColor,
      stroke: '#e2e8f0',
      strokeWidth: 2,
      rx: 20,
      ry: 20,
    });
  };

  const createPoloSilhouette = (fillColor: string) => {
    return new Rect({
      left: 50,
      top: 90,
      width: 300,
      height: 360,
      fill: fillColor,
      stroke: '#e2e8f0',
      strokeWidth: 2,
      rx: 20,
      ry: 20,
    });
  };

  const createSweatshirtSilhouette = (fillColor: string) => {
    return new Rect({
      left: 40,
      top: 90,
      width: 320,
      height: 370,
      fill: fillColor,
      stroke: '#e2e8f0',
      strokeWidth: 2,
      rx: 22,
      ry: 22,
    });
  };

  const createHatSilhouette = (fillColor: string) => {
    return new Rect({
      left: 100,
      top: 150,
      width: 200,
      height: 150,
      fill: fillColor,
      stroke: '#e2e8f0',
      strokeWidth: 2,
      rx: 75,
      ry: 30,
    });
  };

  const createJacketSilhouette = (fillColor: string) => {
    return new Rect({
      left: 30,
      top: 80,
      width: 340,
      height: 390,
      fill: fillColor,
      stroke: '#e2e8f0',
      strokeWidth: 2,
      rx: 25,
      ry: 25,
    });
  };

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (!fabricCanvas || historyIndex <= 0) return;
    
    isLoadingRef.current = true;
    const prevState = history[historyIndex - 1];
    
    fabricCanvas.loadFromJSON(JSON.parse(prevState.json)).then(() => {
      fabricCanvas.renderAll();
      setHistoryIndex(prev => prev - 1);
      updateDesigns(fabricCanvas);
      isLoadingRef.current = false;
    });
  }, [fabricCanvas, history, historyIndex, updateDesigns]);

  const redo = useCallback(() => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    
    isLoadingRef.current = true;
    const nextState = history[historyIndex + 1];
    
    fabricCanvas.loadFromJSON(JSON.parse(nextState.json)).then(() => {
      fabricCanvas.renderAll();
      setHistoryIndex(prev => prev + 1);
      updateDesigns(fabricCanvas);
      isLoadingRef.current = false;
    });
  }, [fabricCanvas, history, historyIndex, updateDesigns]);

  // Zoom functions
  const handleZoom = useCallback((newZoom: number) => {
    if (!fabricCanvas) return;
    
    const clampedZoom = Math.min(Math.max(newZoom, 0.5), 2);
    setZoom(clampedZoom);
    fabricCanvas.setZoom(clampedZoom);
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  // Layer functions
  const bringForward = useCallback(() => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.bringObjectForward(selectedObject);
    fabricCanvas.renderAll();
  }, [fabricCanvas, selectedObject]);

  const sendBackward = useCallback(() => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.sendObjectBackwards(selectedObject);
    fabricCanvas.renderAll();
  }, [fabricCanvas, selectedObject]);

  // Delete selected object
  const deleteSelected = useCallback(() => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvas.renderAll();
  }, [fabricCanvas, selectedObject]);

  // Reset canvas
  const resetCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    
    // Remove all non-garment objects
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if (!(obj as any).isGarment) {
        fabricCanvas.remove(obj);
      }
    });
    
    fabricCanvas.renderAll();
    saveToHistory(fabricCanvas);
    updateDesigns(fabricCanvas);
    toast.success("Canvas cleared!");
  }, [fabricCanvas, saveToHistory, updateDesigns]);

  // Image upload handler
  const uploadImage = useCallback(async (file: File) => {
    if (!fabricCanvas) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PNG, JPG, SVG, or PDF.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = new Image();
      imgElement.onload = () => {
        // Check resolution using configurable constant
        if (imgElement.width < MIN_IMAGE_RESOLUTION || imgElement.height < MIN_IMAGE_RESOLUTION) {
          toast.warning("Low resolution image detected. Print quality may be affected.");
        }

        FabricImage.fromURL(event.target?.result as string).then((fabricImage) => {
          // Scale image to fit within print area
          const maxWidth = 250;
          const maxHeight = MIN_IMAGE_RESOLUTION;
          const scale = Math.min(maxWidth / imgElement.width, maxHeight / imgElement.height, 1);
          
          fabricImage.scale(scale);
          fabricImage.set({
            left: 200 - (imgElement.width * scale) / 2,
            top: 250 - (imgElement.height * scale) / 2,
          });
          
          (fabricImage as unknown as { isDesignElement: boolean }).isDesignElement = true;
          (fabricImage as unknown as { elementType: string }).elementType = 'image';
          
          fabricCanvas.add(fabricImage);
          fabricCanvas.setActiveObject(fabricImage);
          fabricCanvas.renderAll();
          
          toast.success("Image added successfully!");
        });
      };
      imgElement.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [fabricCanvas]);

  // Add text handler
  const addText = useCallback((text: string, options: TextOptions = {}) => {
    if (!fabricCanvas || !text.trim()) return;

    const textObj = new FabricText(text, {
      left: 200,
      top: 250,
      fontFamily: options.fontFamily || 'Arial',
      fontSize: options.fontSize || 24,
      fill: options.fill || '#000000',
      fontWeight: options.fontWeight as any || 'normal',
      fontStyle: options.fontStyle as any || 'normal',
      textAlign: options.textAlign || 'center',
    });

    (textObj as any).isDesignElement = true;
    (textObj as any).elementType = 'text';

    fabricCanvas.add(textObj);
    fabricCanvas.setActiveObject(textObj);
    fabricCanvas.renderAll();
    
    toast.success("Text added!");
  }, [fabricCanvas]);

  // Add shape handler
  const addShape = useCallback((type: 'rect' | 'circle') => {
    if (!fabricCanvas) return;

    let shape;
    if (type === 'rect') {
      shape = new Rect({
        left: 175,
        top: 225,
        width: 50,
        height: 50,
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 1,
      });
    } else {
      shape = new Circle({
        left: 175,
        top: 225,
        radius: 25,
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 1,
      });
    }

    (shape as any).isDesignElement = true;
    (shape as any).elementType = 'shape';

    fabricCanvas.add(shape);
    fabricCanvas.setActiveObject(shape);
    fabricCanvas.renderAll();
    
    toast.success("Shape added!");
  }, [fabricCanvas]);

  // Export design as JSON
  const exportDesign = useCallback(() => {
    if (!fabricCanvas) return null;
    return fabricCanvas.toJSON(['isGarment', 'isDesignElement', 'elementType']);
  }, [fabricCanvas]);

  // Load design from JSON
  const loadDesign = useCallback((data: any) => {
    if (!fabricCanvas || !data) return;
    
    isLoadingRef.current = true;
    fabricCanvas.loadFromJSON(data).then(() => {
      fabricCanvas.renderAll();
      saveToHistory(fabricCanvas);
      updateDesigns(fabricCanvas);
      isLoadingRef.current = false;
      toast.success("Design loaded!");
    });
  }, [fabricCanvas, saveToHistory, updateDesigns]);

  // Download mockup as image
  const downloadMockup = useCallback(() => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.download = `design-mockup-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    toast.success("Mockup downloaded!");
  }, [fabricCanvas]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    uploadImage,
    addText,
    addShape,
    exportDesign,
    loadDesign,
    getCanvas: () => fabricCanvas,
  }), [uploadImage, addText, addShape, exportDesign, loadDesign, fabricCanvas]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Canvas Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 capitalize">
            {selectedGarment.replace('-', ' ')} - {activePlacement.replace('-', ' ')}
          </h3>
          <p className="text-sm text-gray-500">Drag and position your designs</p>
        </div>
        
        {/* View Toggle */}
        <Tabs defaultValue="front" className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Canvas Toolbar */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg flex-wrap">
        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleZoom(zoom - 0.1)}
            disabled={zoom <= 0.5}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-24">
            <Slider
              value={[zoom * 100]}
              min={50}
              max={200}
              step={10}
              onValueChange={([value]) => handleZoom(value / 100)}
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleZoom(zoom + 0.1)}
            disabled={zoom >= 2}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-xs text-gray-500 w-12">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Layer Controls */}
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={bringForward}
            disabled={!selectedObject}
            title="Bring Forward"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={sendBackward}
            disabled={!selectedObject}
            title="Send Backward"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Actions */}
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={deleteSelected}
            disabled={!selectedObject}
            title="Delete Selected"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetCanvas}
            title="Clear Canvas"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />

        {/* Export */}
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={downloadMockup}
            title="Download Mockup"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleZoom(1)}
            title="Fit to Screen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex justify-center">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 overflow-auto">
          <canvas 
            ref={canvasRef} 
            className="border border-gray-200 rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* Selection Info */}
      {selectedObject && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Layers className="h-4 w-4" />
            <span>Selected: {(selectedObject as any).elementType || 'object'}</span>
          </div>
        </div>
      )}
    </div>
  );
});

DesignCanvas.displayName = 'DesignCanvas';
