/**
 * JobCostEntry Component
 * Form to enter all cost types with auto-calculations for job costs
 */

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Trash, CurrencyDollar, Users, Package, Calculator } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface SupplierCost {
  id: string
  supplier: string
  itemName: string
  quantity: number
  unitCost: number
  totalCost: number
  invoiceNumber?: string
}

interface LaborCost {
  id: string
  employeeId: string
  employeeName?: string
  hoursWorked: number
  hourlyRate: number
  totalCost: number
  taskType: 'setup' | 'production' | 'cleanup' | 'rework'
  notes?: string
}

interface MaterialCost {
  inkCost: number
  threadCost: number
  screenCost: number
  vinylCost: number
  otherSupplies: number
  notes?: string
}

interface JobCostData {
  supplierCosts: SupplierCost[]
  laborCosts: LaborCost[]
  materialCosts: MaterialCost
  overheadPercentage: number
  revenue: number
}

interface JobCostEntryProps {
  jobId: string
  jobNumber?: string
  onSave?: (data: JobCostData) => void
  onCancel?: () => void
}

const DEFAULT_MATERIAL_COSTS: MaterialCost = {
  inkCost: 0,
  threadCost: 0,
  screenCost: 0,
  vinylCost: 0,
  otherSupplies: 0,
  notes: ''
}

const TASK_TYPES = [
  { value: 'setup', label: 'Setup' },
  { value: 'production', label: 'Production' },
  { value: 'cleanup', label: 'Cleanup' },
  { value: 'rework', label: 'Rework' }
]

// Parse and validate environment variables with fallbacks
const parseEnvNumber = (value: string | undefined, fallback: number, min = 0, max = 10000): number => {
  const parsed = parseFloat(value || String(fallback))
  if (isNaN(parsed) || parsed < min || parsed > max) return fallback
  return parsed
}

const DEFAULT_HOURLY_RATE = parseEnvNumber(import.meta.env.VITE_DEFAULT_HOURLY_RATE, 25.00, 0, 1000)
const DEFAULT_OVERHEAD_PERCENTAGE = parseEnvNumber(import.meta.env.VITE_OVERHEAD_PERCENTAGE, 15.0, 0, 100)

export function JobCostEntry({ jobId, jobNumber, onSave, onCancel }: JobCostEntryProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [supplierCosts, setSupplierCosts] = useState<SupplierCost[]>([])
  const [laborCosts, setLaborCosts] = useState<LaborCost[]>([])
  const [materialCosts, setMaterialCosts] = useState<MaterialCost>(DEFAULT_MATERIAL_COSTS)
  const [overheadPercentage, setOverheadPercentage] = useState(DEFAULT_OVERHEAD_PERCENTAGE)
  const [revenue, setRevenue] = useState(0)

  // Load existing cost data
  useEffect(() => {
    async function loadCosts() {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE}/api/jobs/${jobId}/costs`)
        if (response.ok) {
          const data = await response.json()
          setSupplierCosts(data.supplierCosts?.map((sc: SupplierCost, idx: number) => ({ ...sc, id: `sc-${idx}` })) || [])
          setLaborCosts(data.laborCosts?.map((lc: LaborCost, idx: number) => ({ ...lc, id: `lc-${idx}` })) || [])
          setMaterialCosts(data.materialCosts || DEFAULT_MATERIAL_COSTS)
          setOverheadPercentage(data.overheadPercentage || DEFAULT_OVERHEAD_PERCENTAGE)
          setRevenue(data.revenue || 0)
        }
      } catch (error) {
        console.error('Failed to load job costs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCosts()
  }, [jobId])

  // Calculate totals
  const calculations = useMemo(() => {
    const totalSupplierCost = supplierCosts.reduce((sum, sc) => sum + (sc.quantity * sc.unitCost), 0)
    const totalLaborCost = laborCosts.reduce((sum, lc) => sum + (lc.hoursWorked * lc.hourlyRate), 0)
    const totalMaterialCost = 
      (materialCosts.inkCost || 0) +
      (materialCosts.threadCost || 0) +
      (materialCosts.screenCost || 0) +
      (materialCosts.vinylCost || 0) +
      (materialCosts.otherSupplies || 0)
    
    const directCosts = totalSupplierCost + totalLaborCost + totalMaterialCost
    const overheadCost = directCosts * (overheadPercentage / 100)
    const totalCost = directCosts + overheadCost
    const profit = revenue - totalCost
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

    return {
      totalSupplierCost,
      totalLaborCost,
      totalMaterialCost,
      directCosts,
      overheadCost,
      totalCost,
      profit,
      profitMargin
    }
  }, [supplierCosts, laborCosts, materialCosts, overheadPercentage, revenue])

  // Add new supplier cost row
  const addSupplierCost = () => {
    const newCost: SupplierCost = {
      id: `sc-${Date.now()}`,
      supplier: '',
      itemName: '',
      quantity: 0,
      unitCost: 0,
      totalCost: 0
    }
    setSupplierCosts([...supplierCosts, newCost])
  }

  // Add new labor cost row
  const addLaborCost = () => {
    const newCost: LaborCost = {
      id: `lc-${Date.now()}`,
      employeeId: '',
      hoursWorked: 0,
      hourlyRate: DEFAULT_HOURLY_RATE,
      totalCost: 0,
      taskType: 'production'
    }
    setLaborCosts([...laborCosts, newCost])
  }

  // Update supplier cost
  const updateSupplierCost = (id: string, field: keyof SupplierCost, value: string | number) => {
    setSupplierCosts(costs => costs.map(cost => {
      if (cost.id === id) {
        const updated = { ...cost, [field]: value }
        updated.totalCost = updated.quantity * updated.unitCost
        return updated
      }
      return cost
    }))
  }

  // Update labor cost
  const updateLaborCost = (id: string, field: keyof LaborCost, value: string | number) => {
    setLaborCosts(costs => costs.map(cost => {
      if (cost.id === id) {
        const updated = { ...cost, [field]: value }
        updated.totalCost = updated.hoursWorked * updated.hourlyRate
        return updated
      }
      return cost
    }))
  }

  // Remove supplier cost
  const removeSupplierCost = (id: string) => {
    setSupplierCosts(costs => costs.filter(c => c.id !== id))
  }

  // Remove labor cost
  const removeLaborCost = (id: string) => {
    setLaborCosts(costs => costs.filter(c => c.id !== id))
  }

  // Save costs
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE}/api/jobs/${jobId}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierCosts: supplierCosts.map(({ id: _id, ...rest }) => rest),
          laborCosts: laborCosts.map(({ id: _id, ...rest }) => rest),
          materialCosts,
          overheadPercentage,
          revenue
        })
      })

      if (response.ok) {
        toast.success('Job costs saved successfully')
        onSave?.({
          supplierCosts,
          laborCosts,
          materialCosts,
          overheadPercentage,
          revenue
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save job costs')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save job costs')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Job Cost Entry</h1>
          <p className="text-muted-foreground mt-1">
            {jobNumber ? `Job #${jobNumber}` : `Job ID: ${jobId}`}
          </p>
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Costs'}
          </Button>
        </div>
      </div>

      {/* Revenue Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CurrencyDollar size={24} weight="fill" className="text-green-600" />
            Revenue
          </CardTitle>
          <CardDescription>Total revenue for this job</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="revenue" className="w-32">Job Revenue</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="revenue"
                type="number"
                min="0"
                step="0.01"
                value={revenue}
                onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
                className="pl-7 w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Costs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package size={24} weight="fill" className="text-blue-600" />
                Supplier Costs
              </CardTitle>
              <CardDescription>Garments and blanks from vendors</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addSupplierCost}>
              <Plus size={16} className="mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {supplierCosts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-32">Unit Cost</TableHead>
                  <TableHead className="w-32">Total</TableHead>
                  <TableHead className="w-32">Invoice #</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <Input
                        value={cost.supplier}
                        onChange={(e) => updateSupplierCost(cost.id, 'supplier', e.target.value)}
                        placeholder="S&S Activewear"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={cost.itemName}
                        onChange={(e) => updateSupplierCost(cost.id, 'itemName', e.target.value)}
                        placeholder="Gildan 5000"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={cost.quantity}
                        onChange={(e) => updateSupplierCost(cost.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cost.unitCost}
                          onChange={(e) => updateSupplierCost(cost.id, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="pl-5"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(cost.quantity * cost.unitCost)}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={cost.invoiceNumber || ''}
                        onChange={(e) => updateSupplierCost(cost.id, 'invoiceNumber', e.target.value)}
                        placeholder="INV-001"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSupplierCost(cost.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No supplier costs added. Click "Add Item" to get started.
            </div>
          )}
          {supplierCosts.length > 0 && (
            <div className="flex justify-end mt-4 text-lg font-semibold">
              <span>Total: {formatCurrency(calculations.totalSupplierCost)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Labor Costs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users size={24} weight="fill" className="text-purple-600" />
                Labor Costs
              </CardTitle>
              <CardDescription>Employee hours and labor costs</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addLaborCost}>
              <Plus size={16} className="mr-1" />
              Add Labor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {laborCosts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead className="w-28">Hours</TableHead>
                  <TableHead className="w-32">Rate/Hr</TableHead>
                  <TableHead className="w-32">Total</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laborCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <Input
                        value={cost.employeeName || cost.employeeId}
                        onChange={(e) => updateLaborCost(cost.id, 'employeeId', e.target.value)}
                        placeholder="Employee name"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={cost.taskType}
                        onValueChange={(value) => updateLaborCost(cost.id, 'taskType', value as LaborCost['taskType'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.25"
                        value={cost.hoursWorked}
                        onChange={(e) => updateLaborCost(cost.id, 'hoursWorked', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cost.hourlyRate}
                          onChange={(e) => updateLaborCost(cost.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                          className="pl-5"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(cost.hoursWorked * cost.hourlyRate)}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={cost.notes || ''}
                        onChange={(e) => updateLaborCost(cost.id, 'notes', e.target.value)}
                        placeholder="Optional notes"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLaborCost(cost.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No labor costs added. Click "Add Labor" to get started.
            </div>
          )}
          {laborCosts.length > 0 && (
            <div className="flex justify-end mt-4 text-lg font-semibold">
              <span>Total: {formatCurrency(calculations.totalLaborCost)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Material Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={24} weight="fill" className="text-orange-600" />
            Material Costs
          </CardTitle>
          <CardDescription>Ink, thread, screens, vinyl, and other supplies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inkCost">Ink Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="inkCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={materialCosts.inkCost}
                  onChange={(e) => setMaterialCosts({ ...materialCosts, inkCost: parseFloat(e.target.value) || 0 })}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threadCost">Thread Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="threadCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={materialCosts.threadCost}
                  onChange={(e) => setMaterialCosts({ ...materialCosts, threadCost: parseFloat(e.target.value) || 0 })}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="screenCost">Screen Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="screenCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={materialCosts.screenCost}
                  onChange={(e) => setMaterialCosts({ ...materialCosts, screenCost: parseFloat(e.target.value) || 0 })}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vinylCost">Vinyl Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="vinylCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={materialCosts.vinylCost}
                  onChange={(e) => setMaterialCosts({ ...materialCosts, vinylCost: parseFloat(e.target.value) || 0 })}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherSupplies">Other Supplies</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="otherSupplies"
                  type="number"
                  min="0"
                  step="0.01"
                  value={materialCosts.otherSupplies}
                  onChange={(e) => setMaterialCosts({ ...materialCosts, otherSupplies: parseFloat(e.target.value) || 0 })}
                  className="pl-7"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="materialNotes">Notes</Label>
            <Textarea
              id="materialNotes"
              value={materialCosts.notes || ''}
              onChange={(e) => setMaterialCosts({ ...materialCosts, notes: e.target.value })}
              placeholder="Optional notes about materials used"
              rows={2}
            />
          </div>
          <div className="flex justify-end mt-4 text-lg font-semibold">
            <span>Total: {formatCurrency(calculations.totalMaterialCost)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Overhead & Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={24} weight="fill" className="text-gray-600" />
            Cost Summary & Profit
          </CardTitle>
          <CardDescription>Overhead calculation and profit analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Label htmlFor="overhead" className="w-40">Overhead Percentage</Label>
            <div className="relative w-32">
              <Input
                id="overhead"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={overheadPercentage}
                onChange={(e) => setOverheadPercentage(parseFloat(e.target.value) || 0)}
                className="pr-7"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Supplier Costs</span>
              <span className="font-medium">{formatCurrency(calculations.totalSupplierCost)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Labor Costs</span>
              <span className="font-medium">{formatCurrency(calculations.totalLaborCost)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Material Costs</span>
              <span className="font-medium">{formatCurrency(calculations.totalMaterialCost)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Direct Costs</span>
              <span className="font-semibold">{formatCurrency(calculations.directCosts)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Overhead ({overheadPercentage}%)</span>
              <span className="font-medium">{formatCurrency(calculations.overheadCost)}</span>
            </div>
            <div className="flex justify-between py-2 border-b text-lg">
              <span className="font-semibold">Total Cost</span>
              <span className="font-bold">{formatCurrency(calculations.totalCost)}</span>
            </div>
            <div className="flex justify-between py-2 border-b text-lg">
              <span className="font-semibold">Revenue</span>
              <span className="font-bold text-green-600">{formatCurrency(revenue)}</span>
            </div>
            <div className="flex justify-between py-3 text-xl">
              <span className="font-bold">Profit</span>
              <span className={cn(
                "font-bold",
                calculations.profit >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(calculations.profit)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Profit Margin</span>
              <span className={cn(
                "font-bold text-lg px-3 py-1 rounded",
                calculations.profitMargin >= 30 ? "bg-green-100 text-green-800" :
                calculations.profitMargin >= 15 ? "bg-yellow-100 text-yellow-800" :
                calculations.profitMargin >= 0 ? "bg-orange-100 text-orange-800" :
                "bg-red-100 text-red-800"
              )}>
                {calculations.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default JobCostEntry
