import { useState, useEffect } from 'react';
import { PageWrapper } from '../shared/PageWrapper';
import { Printer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Machine {
  id: number;
  name: string;
  status: string;
  currentJob: string | null;
}

export function ProductionScheduleView() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMachines();
  }, []);

  async function loadMachines() {
    try {
      setIsLoadingMachines(true);
      setError(null);
      
      // Mock data - TODO: Connect to API
      setMachines([
        { id: 1, name: 'Screen Press 1', status: 'active', currentJob: "Barry's Media Apparel" },
        { id: 2, name: 'Screen Press 2', status: 'idle', currentJob: null },
        { id: 3, name: 'DTG Printer', status: 'maintenance', currentJob: null },
      ]);
    } catch (err) {
      console.error('Failed to load machines:', err);
      setError(err instanceof Error ? err.message : 'Failed to load machines');
      setMachines([]);
    } finally {
      setIsLoadingMachines(false);
    }
  }

  if (isLoadingMachines) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading production schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive mb-1">Error Loading Schedule</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper
      title="Production Schedule"
      action={
        <Button className="gap-2">
          <Printer className="w-4 h-4" />
          Add Machine
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <div key={machine.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Printer className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{machine.name}</h3>
                <span className={`text-sm ${
                  machine.status === 'active' ? 'text-green-600' :
                  machine.status === 'idle' ? 'text-muted-foreground' :
                  'text-orange-600'
                }`}>
                  {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                </span>
              </div>
            </div>
            
            {machine.currentJob ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{machine.currentJob}</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground/60">No active job</div>
            )}
          </div>
        ))}
      </div>

      {machines.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Printer className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No machines configured</p>
          <p className="text-sm mt-2">Add machines to monitor production equipment</p>
        </div>
      )}
    </PageWrapper>
  );
}
