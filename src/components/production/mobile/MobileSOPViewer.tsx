import { useState, useEffect } from 'react';
import { cacheSOP, getCachedSOP, getAllCachedSOPs, type SOPCache } from '../../../offline/offline-storage';
import { useOffline } from '../../../hooks/useOffline';

interface SOP {
  id: string;
  title: string;
  category: string;
  content: string;
}

const mockSOPs: SOP[] = [
  {
    id: '1',
    title: 'Offset Press Setup',
    category: 'Press Operations',
    content: `# Offset Press Setup

## Safety First
- Wear safety glasses
- Secure loose clothing
- Check emergency stop button

## Setup Steps
1. Check paper stock alignment
2. Load ink cartridges
3. Adjust print registration
4. Run test print
5. Check color accuracy

## Quality Checklist
- Color density check
- Registration marks aligned
- No ink smudging
- Paper feed smooth`
  },
  {
    id: '2',
    title: 'Digital Press Maintenance',
    category: 'Maintenance',
    content: `# Digital Press Maintenance

## Daily Maintenance
- Clean print heads
- Check toner levels
- Verify paper path clear
- Clean feed rollers

## Weekly Tasks
- Full system diagnostics
- Calibrate color settings
- Clean corona wires
- Check waste toner container

## Monthly Tasks
- Replace worn parts
- Deep clean system
- Update firmware
- Full calibration`
  },
  {
    id: '3',
    title: 'Bindery Operations',
    category: 'Finishing',
    content: `# Bindery Operations

## Equipment Setup
- Check cutting blade sharpness
- Verify folding settings
- Test stapler function
- Adjust trimmer guides

## Quality Standards
- Cut accuracy: ±0.5mm
- Fold alignment perfect
- No torn pages
- Consistent staple placement

## Safety Procedures
- Blade guard in place
- No hands near cutter
- Emergency stop accessible
- Clear work area`
  }
];

export const MobileSOPViewer = () => {
  const { isOnline } = useOffline();
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [cachedSOPs, setCachedSOPs] = useState<SOPCache[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load cached SOPs
    getAllCachedSOPs().then(setCachedSOPs);
    
    // Cache mock SOPs for offline use
    mockSOPs.forEach(sop => {
      cacheSOP({
        id: sop.id,
        title: sop.title,
        content: sop.content,
        cachedAt: Date.now()
      });
    });
  }, []);

  const handleSelectSOP = async (sopId: string) => {
    // Try to get from cache first
    const cached = await getCachedSOP(sopId);
    
    if (cached) {
      const sop = mockSOPs.find(s => s.id === sopId);
      if (sop) {
        setSelectedSOP(sop);
      }
    } else if (isOnline) {
      // Fetch from API if online
      const sop = mockSOPs.find(s => s.id === sopId);
      if (sop) {
        setSelectedSOP(sop);
        // Cache for offline use
        await cacheSOP({
          id: sop.id,
          title: sop.title,
          content: sop.content,
          cachedAt: Date.now()
        });
      }
    } else {
      alert('This SOP is not available offline. Please connect to the internet to download it.');
    }
  };

  const filteredSOPs = mockSOPs.filter(sop =>
    sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sop.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSOP) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 z-10">
          <button
            onClick={() => setSelectedSOP(null)}
            className="min-h-[48px] min-w-[48px] text-blue-600 font-semibold active:scale-95 transition-transform touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            ← Back
          </button>
          <h1 className="text-xl sm:text-2xl font-bold mt-2">{selectedSOP.title}</h1>
          <p className="text-gray-600 text-sm">{selectedSOP.category}</p>
          {!isOnline && (
            <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-xs inline-block">
              📥 Cached Offline
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="prose max-w-none">
            {selectedSOP.content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-2xl font-bold mb-4 mt-6">{line.substring(2)}</h1>;
              } else if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold mb-3 mt-5">{line.substring(3)}</h2>;
              } else if (line.startsWith('- ')) {
                return <li key={index} className="ml-6 mb-2">{line.substring(2)}</li>;
              } else if (line.match(/^\d+\./)) {
                return <li key={index} className="ml-6 mb-2 list-decimal">{line}</li>;
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else {
                return <p key={index} className="mb-2">{line}</p>;
              }
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">SOP Library</h1>
        {!isOnline && (
          <div className="mb-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm">
            ⚠️ Offline Mode - Showing cached SOPs only
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search SOPs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[48px] px-4 py-2 border-2 border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* SOP List */}
      <div className="space-y-3">
        {filteredSOPs.map((sop) => {
          const isCached = cachedSOPs.some(cached => cached.id === sop.id);
          
          return (
            <button
              key={sop.id}
              onClick={() => handleSelectSOP(sop.id)}
              className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-5 text-left hover:border-blue-400 active:bg-gray-50 active:scale-[0.99] transition-all touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{sop.title}</h3>
                {isCached && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    📥 Offline
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{sop.category}</p>
            </button>
          );
        })}
      </div>

      {filteredSOPs.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No SOPs found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};
