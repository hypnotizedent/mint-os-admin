import { useState } from 'react';
import { useIsMobile } from '../../../hooks/use-mobile';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNavigation = ({ currentPage, onNavigate }: MobileNavigationProps) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'queue', label: 'Job Queue', icon: '📋' },
    { id: 'time-clock', label: 'Time Clock', icon: '⏱️' },
    { id: 'checklists', label: 'Checklists', icon: '✅' },
    { id: 'sops', label: 'SOPs', icon: '📚' },
    { id: 'supervisor', label: 'Supervisor', icon: '👁️' },
    { id: 'team-metrics', label: 'Metrics', icon: '📊' }
  ];

  if (!isMobile) {
    // Tablet view - sidebar
    return (
      <div className="hidden md:flex md:flex-col w-20 bg-gray-900 text-white">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`p-4 flex flex-col items-center gap-2 hover:bg-gray-800 transition-colors touch-manipulation ${
              currentPage === item.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs text-center">{item.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Mobile view - hamburger menu
  return (
    <>
      {/* Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="min-h-[44px] min-w-[44px] text-2xl active:scale-95 transition-transform touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          ☰
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Production</h1>
        <div className="min-h-[44px] min-w-[44px]" /> {/* Spacer for centering */}
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-900 text-white">
              <h2 className="text-xl font-bold">Production Menu</h2>
            </div>
            <nav className="p-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ${
                    currentPage === item.id ? 'bg-blue-100 text-blue-700' : ''
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-lg">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="md:hidden h-16" />
    </>
  );
};
