import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({ title, subtitle, action, children }: PageWrapperProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle || today}</p>
          </div>
          {action && <div>{action}</div>}
        </div>

        {/* Page Content */}
        <div className="space-y-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
