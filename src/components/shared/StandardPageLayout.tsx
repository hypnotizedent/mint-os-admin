import { ReactNode } from 'react';

interface StandardPageLayoutProps {
  // Header
  title: string;
  subtitle?: string;
  actions?: ReactNode; // Buttons like "+ Add Customer", "+ New Quote"
  
  // Body
  children: ReactNode;
}

export function StandardPageLayout({ 
  title, 
  subtitle, 
  actions,
  children 
}: StandardPageLayoutProps) {
  return (
    <div className="w-full space-y-6">
      {/* HEADER - consistent on every page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* BODY - full width, consistent spacing */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
