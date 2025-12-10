import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Paperclip, WarningCircle } from "@phosphor-icons/react"

interface CreateTicketProps {
  onSubmit: (ticket: TicketFormData) => void
  onCancel: () => void
}

export interface TicketFormData {
  category: string
  priority: string
  subject: string
  description: string
  orderNumber?: string
  attachments: File[]
}

export function CreateTicket({ onSubmit, onCancel }: CreateTicketProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    category: "General",
    priority: "Medium",
    subject: "",
    description: "",
    orderNumber: "",
    attachments: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.subject.trim()) newErrors.subject = "Subject is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (formData.attachments.length > 5) newErrors.attachments = "Maximum 5 files allowed"
    
    const oversizedFile = formData.attachments.find(f => f.size > 10 * 1024 * 1024)
    if (oversizedFile) newErrors.attachments = "Files must be under 10MB"
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onSubmit(formData)
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip',
      'application/postscript', 'application/x-photoshop', 'image/vnd.adobe.photoshop']
    
    const newFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      return validTypes.includes(file.type) || ['ai', 'eps', 'psd'].includes(ext || '')
    })
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles].slice(0, 5)
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Create Support Ticket</h1>
          <p className="text-muted-foreground mt-1">Describe your issue and we'll help you resolve it</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => {
                  setFormData({ ...formData, subject: e.target.value })
                  setErrors({ ...errors, subject: "" })
                }}
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <WarningCircle size={14} weight="fill" />
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Order Issue">Order Issue</SelectItem>
                    <SelectItem value="Art Approval">Art Approval</SelectItem>
                    <SelectItem value="Shipping">Shipping</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNumber">Related Order (optional)</Label>
              <Input
                id="orderNumber"
                placeholder="Order #12345"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide details about your issue..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  setErrors({ ...errors, description: "" })
                }}
                rows={6}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <WarningCircle size={14} weight="fill" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                } ${errors.attachments ? "border-red-500" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Paperclip size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.ai,.eps,.psd,.zip"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Max 10MB per file, 5 files max (JPG, PNG, PDF, AI, EPS, PSD, ZIP)
                </p>
              </div>
              {errors.attachments && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <WarningCircle size={14} weight="fill" />
                  {errors.attachments}
                </p>
              )}

              {formData.attachments.length > 0 && (
                <div className="space-y-2 mt-4">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip size={18} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Submit Ticket
          </Button>
        </div>
      </form>
    </div>
  )
}
