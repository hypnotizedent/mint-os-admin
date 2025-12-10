import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';

export interface JobLabelData {
    jobId: string;
    customerId?: string;
    customerName: string;
    jobNickname: string;
    quantity: number;
    sizes?: string;
    dueDate: string;
    notes?: string;
    printavoId?: string;
}

interface LabelPreviewProps {
    job: JobLabelData;
    showBorder?: boolean;
}

export function LabelPreview({ job, showBorder = true }: LabelPreviewProps) {
    // Generate QR code URL - links to job detail page
    const jobUrl = `${window.location.origin}/jobs/${job.jobId}`;

    // Format date
    const formattedDate = new Date(job.dueDate).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    return (
        <Card
            className={`
        relative bg-white text-black p-6
        ${showBorder ? 'border-2 border-gray-800 shadow-lg' : 'border-none shadow-none'}
      `}
            style={{
                width: '4in',
                height: '6in',
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
            }}
        >
            {/* Header with QR Code */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        PrintShop OS
                    </h3>
                    <div className="text-sm text-gray-500 mt-0.5">
                        Job #{job.printavoId || job.jobId}
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <QRCodeSVG
                        value={jobUrl}
                        size={80}
                        level="M"
                        includeMargin={false}
                        className="border-2 border-gray-300 p-1"
                    />
                </div>
            </div>

            {/* Customer Name - Large */}
            <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Customer
                </div>
                <h1 className="text-2xl font-bold leading-tight break-words">
                    {job.customerName}
                </h1>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-gray-300 my-4" />

            {/* Job Nickname - Prominent */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold leading-tight break-words">
                    {job.jobNickname}
                </h2>
            </div>

            {/* Quantity */}
            <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Quantity
                </div>
                <div className="text-lg font-bold">
                    {job.quantity.toLocaleString()} pieces
                </div>
            </div>

            {/* Sizes (if provided) */}
            {job.sizes && (
                <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Sizes
                    </div>
                    <div className="text-sm font-medium break-words">
                        {job.sizes}
                    </div>
                </div>
            )}

            {/* Due Date */}
            <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Due Date
                </div>
                <div className="text-base font-bold text-red-600">
                    {formattedDate}
                </div>
            </div>

            {/* Notes (if provided) */}
            {job.notes && (
                <>
                    <div className="border-t-2 border-gray-300 my-4" />
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Notes
                        </div>
                        <div className="text-sm break-words line-clamp-3">
                            {job.notes}
                        </div>
                    </div>
                </>
            )}

            {/* Footer - Small job ID reference */}
            <div className="absolute bottom-4 right-6 text-xs text-gray-400 font-mono">
                ID: {job.jobId}
            </div>
        </Card>
    );
}
