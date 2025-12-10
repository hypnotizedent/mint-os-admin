import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText } from '@phosphor-icons/react';
import { toast } from 'sonner';

type ReportType =
  | 'productivity-summary'
  | 'employee-performance'
  | 'team-analytics'
  | 'job-throughput'
  | 'efficiency-trends';

type ReportFormat = 'pdf' | 'csv' | 'excel';

export function ReportExport() {
  const [reportType, setReportType] = useState<ReportType>('productivity-summary');
  const [dateFrom, setDateFrom] = useState('2025-11-01');
  const [dateTo, setDateTo] = useState('2025-11-23');
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeEmployeeBreakdown, setIncludeEmployeeBreakdown] = useState(true);
  const [includeJobTypeAnalysis, setIncludeJobTypeAnalysis] = useState(false);
  const [includeCostAnalysis, setIncludeCostAnalysis] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    try {
      const config = {
        reportType,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        includeExecutiveSummary,
        includeCharts,
        includeEmployeeBreakdown,
        includeJobTypeAnalysis,
        includeCostAnalysis,
        format,
      };

      // Mock report generation
      console.log('Generating report with config:', config);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Report generated successfully as ${format.toUpperCase()}`);
      
      // In a real implementation, this would trigger a file download
      const filename = `production-report-${Date.now()}.${format}`;
      console.log(`Download report: ${filename}`);
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const reportTypeOptions = [
    { value: 'productivity-summary', label: 'Productivity Summary' },
    { value: 'employee-performance', label: 'Employee Performance' },
    { value: 'team-analytics', label: 'Team Analytics' },
    { value: 'job-throughput', label: 'Job Throughput' },
    { value: 'efficiency-trends', label: 'Efficiency Trends' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText size={32} weight="fill" className="text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Generate Report</h2>
          <p className="text-muted-foreground">Export production metrics and analytics</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
            >
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include in Report</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="executiveSummary"
                  checked={includeExecutiveSummary}
                  onCheckedChange={(checked) =>
                    setIncludeExecutiveSummary(checked as boolean)
                  }
                />
                <label
                  htmlFor="executiveSummary"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Executive Summary
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <label
                  htmlFor="charts"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Charts & Graphs
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="employeeBreakdown"
                  checked={includeEmployeeBreakdown}
                  onCheckedChange={(checked) =>
                    setIncludeEmployeeBreakdown(checked as boolean)
                  }
                />
                <label
                  htmlFor="employeeBreakdown"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Employee Breakdown
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jobTypeAnalysis"
                  checked={includeJobTypeAnalysis}
                  onCheckedChange={(checked) =>
                    setIncludeJobTypeAnalysis(checked as boolean)
                  }
                />
                <label
                  htmlFor="jobTypeAnalysis"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Job Type Analysis
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="costAnalysis"
                  checked={includeCostAnalysis}
                  onCheckedChange={(checked) =>
                    setIncludeCostAnalysis(checked as boolean)
                  }
                />
                <label
                  htmlFor="costAnalysis"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Cost Analysis
                </label>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="flex gap-3">
              <Button
                variant={format === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('pdf')}
              >
                PDF
              </Button>
              <Button
                variant={format === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('csv')}
              >
                CSV
              </Button>
              <Button
                variant={format === 'excel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('excel')}
              >
                Excel
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleGenerateReport}
            disabled={generating}
          >
            <Download size={20} weight="bold" />
            {generating ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </div>
      </Card>

      {/* Report Preview Info */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold text-foreground mb-3">Report Preview</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Report Type:</span>
            <span className="font-medium text-foreground">
              {reportTypeOptions.find((opt) => opt.value === reportType)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Date Range:</span>
            <span className="font-medium text-foreground">
              {dateFrom} to {dateTo}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Format:</span>
            <span className="font-medium text-foreground uppercase">{format}</span>
          </div>
          <div className="flex justify-between">
            <span>Sections:</span>
            <span className="font-medium text-foreground">
              {[
                includeExecutiveSummary && 'Summary',
                includeCharts && 'Charts',
                includeEmployeeBreakdown && 'Employee Data',
                includeJobTypeAnalysis && 'Job Types',
                includeCostAnalysis && 'Costs',
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
