import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Type, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Plus
} from "lucide-react";
import { AVAILABLE_FONTS } from "../types/database";

interface TextEditorProps {
  onAddText: (text: string, options: TextOptions) => void;
}

interface TextOptions {
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
}

const colorPresets = [
  '#000000', '#FFFFFF', '#dc2626', '#ea580c', '#ca8a04', 
  '#16a34a', '#0284c7', '#7c3aed', '#db2777', '#64748b'
];

export const TextEditor = ({ onAddText }: TextEditorProps) => {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textAlign, setTextAlign] = useState('center');

  const handleAddText = () => {
    if (!text.trim()) return;
    
    onAddText(text, {
      fontFamily,
      fontSize,
      fill: textColor,
      fontWeight,
      fontStyle,
      textAlign,
    });
    
    setText('');
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Type className="h-5 w-5 text-blue-600" />
          Text Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text-input">Your Text</Label>
          <Input
            id="text-input"
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
          />
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label>Font Family</Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_FONTS.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Font Size</Label>
            <span className="text-sm text-gray-500">{fontSize}px</span>
          </div>
          <Slider
            value={[fontSize]}
            min={12}
            max={72}
            step={1}
            onValueChange={([value]) => setFontSize(value)}
          />
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-wrap">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${
                    textColor === color
                      ? 'ring-2 ring-blue-400 ring-offset-1'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <Input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-10 h-8 p-0 border-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Font Style */}
        <div className="space-y-2">
          <Label>Style</Label>
          <div className="flex gap-2">
            <ToggleGroup type="multiple" className="justify-start">
              <ToggleGroupItem
                value="bold"
                aria-label="Toggle bold"
                pressed={fontWeight === 'bold'}
                onPressedChange={(pressed) => setFontWeight(pressed ? 'bold' : 'normal')}
              >
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="italic"
                aria-label="Toggle italic"
                pressed={fontStyle === 'italic'}
                onPressedChange={(pressed) => setFontStyle(pressed ? 'italic' : 'normal')}
              >
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <Label>Alignment</Label>
          <ToggleGroup 
            type="single" 
            value={textAlign}
            onValueChange={(value) => value && setTextAlign(value)}
            className="justify-start"
          >
            <ToggleGroupItem value="left" aria-label="Align left">
              <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center">
              <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right">
              <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Preview */}
        {text && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <Label className="text-xs text-gray-500 mb-2 block">Preview</Label>
            <p
              style={{
                fontFamily,
                fontSize: `${Math.min(fontSize, 32)}px`,
                color: textColor,
                fontWeight,
                fontStyle,
                textAlign: textAlign as any,
              }}
              className="break-words"
            >
              {text}
            </p>
          </div>
        )}

        {/* Add Button */}
        <Button 
          onClick={handleAddText} 
          className="w-full"
          disabled={!text.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Text to Design
        </Button>
      </CardContent>
    </Card>
  );
};
