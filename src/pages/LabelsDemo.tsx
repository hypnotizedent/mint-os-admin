import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PrintLabelButton, type JobLabelData } from '@/components/labels';
import { Package, Clock, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

export default function LabelsDemo() {
    const [jobs, setJobs] = useState<JobLabelData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/jobs?pagination[limit]=10&populate=*`);
                if (response.ok) {
                    const data = await response.json();
                    const transformedJobs: JobLabelData[] = (data.data || [])
                        .map((job: any) => ({
                            jobId: job.documentId || job.id?.toString() || '',
                            printavoId: job.printavoId || job.jobNumber || '',
                            customerName: job.customer?.name || job.customerName || 'Unknown Customer',
                            jobNickname: job.jobNickname || job.title || 'Untitled Job',
                            quantity: job.quantity || 0,
                            sizes: job.sizes || job.sizeBreakdown || '',
                            dueDate: job.dueDate || new Date().toISOString().split('T')[0],
                            notes: job.productionNotes || job.notes || '',
                        }))
                        .filter((job: JobLabelData) => job.jobId); // Only include jobs with valid IDs
                    
                    setJobs(transformedJobs);
                }
            } catch (error) {
                console.error('Failed to fetch jobs for labels:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <Package className="h-12 w-12 text-primary" />
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Job Labels
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Print professional 4×6 inch labels for your print jobs. Each label includes customer info, job details, and a QR code for easy tracking.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Badge variant="secondary" className="text-sm px-4 py-2">
                            <Package className="h-4 w-4 mr-2" />
                            4×6 inch format
                        </Badge>
                        <Badge variant="secondary" className="text-sm px-4 py-2">
                            <Clock className="h-4 w-4 mr-2" />
                            Instant printing
                        </Badge>
                        <Badge variant="secondary" className="text-sm px-4 py-2">
                            <User className="h-4 w-4 mr-2" />
                            QR code tracking
                        </Badge>
                    </div>
                </div>

                {/* Jobs Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
                        <p className="text-muted-foreground">
                            There are no jobs available to print labels for. Create some jobs first.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                        <Card key={job.jobId} className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground font-medium">
                                            Job #{job.printavoId}
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight">
                                            {job.customerName}
                                        </h3>
                                    </div>
                                    <Badge variant="outline" className="font-mono">
                                        {job.quantity}pc
                                    </Badge>
                                </div>

                                {/* Job Details */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">
                                        {job.jobNickname}
                                    </p>
                                    {job.sizes && (
                                        <p className="text-xs text-muted-foreground">
                                            Sizes: {job.sizes}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Due: {new Date(job.dueDate).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Notes */}
                                {job.notes && (
                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {job.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Print Button */}
                                <PrintLabelButton
                                    job={job}
                                    variant="default"
                                    className="w-full"
                                />
                            </div>
                        </Card>
                        ))}
                    </div>
                )}

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    <Card className="p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">Standard Size</h3>
                        <p className="text-sm text-muted-foreground">
                            4×6 inch labels fit standard label printers and adhesive sheets
                        </p>
                    </Card>

                    <Card className="p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">Instant Preview</h3>
                        <p className="text-sm text-muted-foreground">
                            See exactly how your label will look before printing
                        </p>
                    </Card>

                    <Card className="p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">QR Tracking</h3>
                        <p className="text-sm text-muted-foreground">
                            Scan labels to instantly access job details on any device
                        </p>
                    </Card>
                </div>

                {/* Instructions */}
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
                    <h2 className="text-2xl font-bold mb-4">How to Use</h2>
                    <ol className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <Badge className="shrink-0">1</Badge>
                            <span>Click "Print Label" on any job card above to preview the label</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Badge className="shrink-0">2</Badge>
                            <span>Review the label preview to ensure all details are correct</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Badge className="shrink-0">3</Badge>
                            <span>Click "Print" to open your browser's print dialog</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Badge className="shrink-0">4</Badge>
                            <span>Select your label printer or regular printer with 4×6 paper/labels</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Badge className="shrink-0">5</Badge>
                            <span>Print and attach to your job packaging - done! 🎉</span>
                        </li>
                    </ol>
                </Card>
            </div>
        </div>
    );
}
