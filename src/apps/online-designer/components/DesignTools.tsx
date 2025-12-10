import { useState } from "react";
import { Upload, Type, Square, Circle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DesignToolsProps {
  onUploadImage: (file: File) => void;
  onAddText: (text: string, options?: any) => void;
  onAddShape: (type: 'rect' | 'circle') => void;
}

export const DesignTools = ({ onUploadImage, onAddText, onAddShape }: DesignToolsProps) => {
  const [textInput, setTextInput] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  const handleAddText = () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }
    onAddText(textInput);
    setTextInput('');
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          Quick Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upload" className="text-xs">
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs">
              <Type className="h-3 w-3 mr-1" />
              Text
            </TabsTrigger>
            <TabsTrigger value="shapes" className="text-xs">
              <Square className="h-3 w-3 mr-1" />
              Shapes
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-0">
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-3">Drop files here or</p>
                <Input
                  type="file"
                  accept="image/*,.pdf,.svg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-quick"
                />
                <Button
                  asChild
                  variant="outline"
                  className="cursor-pointer"
                >
                  <label htmlFor="file-upload-quick">Browse Files</label>
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Supported: JPG, PNG, SVG, PDF (Max 10MB)
              </p>
            </div>
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="mt-0">
            <div className="space-y-3">
              <Input 
                placeholder="Enter your text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
              />
              <Button 
                onClick={handleAddText} 
                className="w-full"
                disabled={!textInput.trim()}
              >
                <Type className="h-4 w-4 mr-2" />
                Add Text
              </Button>
              <p className="text-xs text-gray-500">
                Use the Text Editor panel for more styling options
              </p>
            </div>
          </TabsContent>

          {/* Shapes Tab */}
          <TabsContent value="shapes" className="mt-0">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => onAddShape('rect')}
                className="h-16 flex-col"
              >
                <Square className="h-6 w-6 mb-1" />
                <span className="text-xs">Rectangle</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onAddShape('circle')}
                className="h-16 flex-col"
              >
                <Circle className="h-6 w-6 mb-1" />
                <span className="text-xs">Circle</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
