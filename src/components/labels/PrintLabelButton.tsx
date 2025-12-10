import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { LabelPreview, type JobLabelData } from './LabelPreview';

interface PrintLabelButtonProps {
    job: JobLabelData;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export function PrintLabelButton({
    job,
    variant = 'outline',
    size = 'default',
    className,
}: PrintLabelButtonProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [printing, setPrinting] = useState(false);

    const handlePrint = async () => {
        setPrinting(true);
        try {
            // Give time for dialog to render before printing
            await new Promise(resolve => setTimeout(resolve, 100));

            // Trigger browser print dialog
            window.print();

            toast.success('Label ready to print!', {
                description: 'Use your browser print dialog to print the label.',
            });

            // Close modal after short delay
            setTimeout(() => {
                setShowPreview(false);
            }, 500);
        } catch (error) {
            console.error('Print error:', error);
            toast.error('Failed to print label');
        } finally {
            setPrinting(false);
        }
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={() => setShowPreview(true)}
            >
                <Printer className="h-4 w-4 mr-2" />
                Print Label
            </Button>

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Print Job Label</DialogTitle>
                        <DialogDescription>
                            Preview your 4×6 inch job label. Click "Print" to send to your printer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center py-4">
                        <div className="print-label-container">
                            <LabelPreview job={job} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(false)}
                            disabled={printing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handlePrint} disabled={printing}>
                            {printing ? (
                                <>
                                    <Printer className="mr-2 h-4 w-4 animate-pulse" />
                                    Printing...
                                </>
                            ) : (
                                <>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Print-specific styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-label-container,
          .print-label-container * {
            visibility: visible;
          }
          .print-label-container {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            size: 4in 6in;
            margin: 0;
          }
        }
      `}</style>
        </>
    );
}
