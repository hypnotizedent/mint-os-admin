import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FolderOpen, 
  Clock, 
  Star, 
  Search,
  Trash2,
  Copy,
  MoreVertical,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { SavedDesign } from "../types/database";

interface DesignLibraryProps {
  onLoadDesign: (design: SavedDesign) => void;
  onNewDesign: () => void;
  currentDesignId?: string;
}

// Mock saved designs - in production, these would come from Strapi
const mockSavedDesigns: SavedDesign[] = [
  {
    id: '1',
    name: 'Company Logo Tee',
    thumbnail_url: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Logo',
    canvas_data: {},
    garment_type: 't-shirt',
    garment_color: '#FFFFFF',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    name: 'Team Hoodies',
    thumbnail_url: 'https://via.placeholder.com/150x150/1e3a5f/ffffff?text=Team',
    canvas_data: {},
    garment_type: 'hoodie',
    garment_color: '#1e3a5f',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '3',
    name: 'Event Tank Tops',
    thumbnail_url: 'https://via.placeholder.com/150x150/dc2626/ffffff?text=Event',
    canvas_data: {},
    garment_type: 'tank-top',
    garment_color: '#dc2626',
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString(),
  },
];

export const DesignLibrary = ({ 
  onLoadDesign, 
  onNewDesign,
  currentDesignId 
}: DesignLibraryProps) => {
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(mockSavedDesigns);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('saved');

  // Filter designs based on search
  const filteredDesigns = savedDesigns.filter(design =>
    design.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get recent designs (last 7 days)
  const recentDesigns = savedDesigns.filter(design => {
    const designDate = new Date(design.updated_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return designDate > weekAgo;
  });

  const handleDuplicate = (design: SavedDesign) => {
    const duplicated: SavedDesign = {
      ...design,
      id: `${design.id}-copy-${Date.now()}`,
      name: `${design.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSavedDesigns(prev => [duplicated, ...prev]);
    toast.success('Design duplicated!');
  };

  const handleDelete = (designId: string) => {
    setSavedDesigns(prev => prev.filter(d => d.id !== designId));
    toast.success('Design deleted');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const DesignCard = ({ design }: { design: SavedDesign }) => (
    <div 
      className={`group relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        currentDesignId === design.id 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onLoadDesign(design)}
    >
      {/* Thumbnail */}
      <div 
        className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
        style={{ backgroundColor: design.garment_color || '#f3f4f6' }}
      >
        {design.thumbnail_url ? (
          <img 
            src={design.thumbnail_url} 
            alt={design.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">
            {design.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {/* Info */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-800 truncate">{design.name}</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {design.garment_type.replace('-', ' ')}
          </span>
          <span className="text-xs text-gray-400">{formatDate(design.updated_at)}</span>
        </div>
      </div>

      {/* Actions Dropdown */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/80">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(design); }}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={(e) => { e.stopPropagation(); handleDelete(design.id); }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Current indicator */}
      {currentDesignId === design.id && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            Current
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Design Library
          </CardTitle>
          <Button size="sm" onClick={onNewDesign}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Saved ({savedDesigns.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Recent ({recentDesigns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-4">
            <ScrollArea className="h-[300px]">
              {filteredDesigns.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredDesigns.map((design) => (
                    <DesignCard key={design.id} design={design} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No saved designs found</p>
                  <Button variant="link" onClick={onNewDesign} className="mt-2">
                    Create your first design
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <ScrollArea className="h-[300px]">
              {recentDesigns.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {recentDesigns.map((design) => (
                    <DesignCard key={design.id} design={design} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent designs</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
