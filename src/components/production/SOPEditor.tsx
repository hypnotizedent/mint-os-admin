import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Plus, ArrowLeft } from "@phosphor-icons/react"
import type { SOP } from "./SOPLibrary"

interface SOPEditorProps {
  sop?: SOP
  onSave: (sop: SOP) => void
  onCancel: () => void
}

interface StepData {
  order: number
  title: string
  content: string
}

export function SOPEditor({ sop, onSave, onCancel }: SOPEditorProps) {
  const [title, setTitle] = useState(sop?.title || "")
  const [category, setCategory] = useState<string>(sop?.category || "Machines")
  const [subcategory, setSubcategory] = useState(sop?.subcategory || "")
  const [difficulty, setDifficulty] = useState<string>(sop?.difficulty || "Beginner")
  const [estimatedTime, setEstimatedTime] = useState(sop?.estimatedTime || 30)
  const [summary, setSummary] = useState(sop?.summary || "")
  const [content, setContent] = useState(sop?.content || "")
  const [tags, setTags] = useState<string[]>(sop?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [steps, setSteps] = useState<StepData[]>([
    { order: 1, title: "", content: "" }
  ])

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleAddStep = () => {
    setSteps([...steps, { order: steps.length + 1, title: "", content: "" }])
  }

  const handleRemoveStep = (order: number) => {
    const filtered = steps.filter(s => s.order !== order)
    // Reorder remaining steps
    setSteps(filtered.map((s, idx) => ({ ...s, order: idx + 1 })))
  }

  const handleStepChange = (order: number, field: 'title' | 'content', value: string) => {
    setSteps(steps.map(s => s.order === order ? { ...s, [field]: value } : s))
  }

  const handleSave = () => {
    const sopData: SOP = {
      id: sop?.id || `sop-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: category as any,
      subcategory: subcategory || undefined,
      tags,
      summary,
      content,
      difficulty: difficulty as any,
      estimatedTime,
      viewCount: sop?.viewCount || 0,
      version: sop?.version || 1.0,
      updatedAt: new Date().toISOString(),
    }

    onSave(sopData)
  }

  const isValid = title && category && summary && content

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {sop ? 'Edit SOP' : 'Create New SOP'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {sop ? 'Update the standard operating procedure' : 'Add a new standard operating procedure'}
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel} className="gap-2">
          <ArrowLeft size={18} />
          Cancel
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Screen Press Setup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Machines">Machines</SelectItem>
                    <SelectItem value="Processes">Processes</SelectItem>
                    <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  placeholder="Screen Printing"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  min="0"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add tag and press Enter"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Plus size={16} />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                placeholder="Brief description of what this SOP covers..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Content</h2>
            
            <div className="space-y-2">
              <Label htmlFor="content">Full Content *</Label>
              <Textarea
                id="content"
                placeholder="Detailed instructions and information..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use markdown-style formatting. Rich text editor coming soon.
              </p>
            </div>
          </div>

          <Separator />

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Steps</h2>
              <Button type="button" variant="outline" size="sm" onClick={handleAddStep} className="gap-2">
                <Plus size={16} />
                Add Step
              </Button>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <Card key={step.order} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Step {step.order}</h3>
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStep(step.order)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`step-title-${step.order}`}>Step Title</Label>
                      <Input
                        id={`step-title-${step.order}`}
                        placeholder="Prepare Screens"
                        value={step.title}
                        onChange={(e) => handleStepChange(step.order, 'title', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`step-content-${step.order}`}>Step Content</Label>
                      <Textarea
                        id={`step-content-${step.order}`}
                        placeholder="Detailed instructions for this step..."
                        value={step.content}
                        onChange={(e) => handleStepChange(step.order, 'content', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Additional features (checklists, warnings, tips, media) can be added after saving.
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            onClick={handleSave}
            disabled={!isValid}
          >
            {sop ? 'Update SOP' : 'Create SOP'}
          </Button>
        </div>
      </div>

      {!isValid && (
        <Card className="p-4 bg-yellow/10 border-yellow">
          <p className="text-sm text-foreground">
            Please fill in all required fields: Title, Category, Summary, and Content
          </p>
        </Card>
      )}
    </div>
  )
}
