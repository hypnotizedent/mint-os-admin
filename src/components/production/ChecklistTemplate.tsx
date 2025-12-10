/**
 * ChecklistTemplate Component
 * 
 * Template builder interface for managers to create and edit checklist templates.
 * Supports adding, editing, deleting, and reordering steps.
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TemplateStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  required: boolean;
  type: 'checkbox' | 'photo' | 'text' | 'signature' | 'number';
}

interface Template {
  id?: string;
  name: string;
  jobType: 'Screen Print' | 'DTG' | 'Embroidery' | 'Other';
  steps: TemplateStep[];
}

interface ChecklistTemplateProps {
  template?: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

export const ChecklistTemplate: React.FC<ChecklistTemplateProps> = ({
  template: initialTemplate,
  onSave,
  onCancel,
}) => {
  const [template, setTemplate] = useState<Template>(
    initialTemplate || {
      name: '',
      jobType: 'Screen Print',
      steps: [],
    }
  );

  const [editingStep, setEditingStep] = useState<number | null>(null);

  const addStep = () => {
    const newStep: TemplateStep = {
      id: `temp-${Date.now()}`,
      order: template.steps.length + 1,
      title: '',
      description: '',
      required: true,
      type: 'checkbox',
    };
    
    setTemplate({
      ...template,
      steps: [...template.steps, newStep],
    });
    
    setEditingStep(template.steps.length);
  };

  const updateStep = (index: number, updates: Partial<TemplateStep>) => {
    const updatedSteps = [...template.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      ...updates,
    };
    
    setTemplate({
      ...template,
      steps: updatedSteps,
    });
  };

  const deleteStep = (index: number) => {
    const updatedSteps = template.steps.filter((_, i) => i !== index);
    // Reorder remaining steps
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setTemplate({
      ...template,
      steps: updatedSteps,
    });
    
    if (editingStep === index) {
      setEditingStep(null);
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= template.steps.length) return;
    
    const updatedSteps = [...template.steps];
    const [movedStep] = updatedSteps.splice(index, 1);
    updatedSteps.splice(newIndex, 0, movedStep);
    
    // Update order numbers
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setTemplate({
      ...template,
      steps: updatedSteps,
    });
    
    if (editingStep === index) {
      setEditingStep(newIndex);
    }
  };

  const handleSave = () => {
    // Validate template
    if (!template.name.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    if (template.steps.length === 0) {
      alert('Please add at least one step');
      return;
    }
    
    const invalidSteps = template.steps.filter(s => !s.title.trim());
    if (invalidSteps.length > 0) {
      alert('All steps must have a title');
      return;
    }
    
    onSave(template);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{template.id ? 'Edit' : 'Create'} Checklist Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Screen Print Setup"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select
                value={template.jobType}
                onValueChange={(value: any) => setTemplate({ ...template, jobType: value })}
              >
                <SelectTrigger id="jobType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Screen Print">Screen Print</SelectItem>
                  <SelectItem value="DTG">DTG</SelectItem>
                  <SelectItem value="Embroidery">Embroidery</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Steps ({template.steps.length})</CardTitle>
            <Button onClick={addStep} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {template.steps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No steps added yet. Click "Add Step" to begin.
            </p>
          ) : (
            <div className="space-y-3">
              {template.steps.map((step, index) => (
                <Card key={step.id} className="p-4">
                  {editingStep === index ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${index}`}>Step Title</Label>
                        <Input
                          id={`title-${index}`}
                          placeholder="e.g., Screens Prepared"
                          value={step.title}
                          onChange={(e) => updateStep(index, { title: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`description-${index}`}>Description (optional)</Label>
                        <Textarea
                          id={`description-${index}`}
                          placeholder="Additional details..."
                          value={step.description}
                          onChange={(e) => updateStep(index, { description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`type-${index}`}>Step Type</Label>
                          <Select
                            value={step.type}
                            onValueChange={(value: any) => updateStep(index, { type: value })}
                          >
                            <SelectTrigger id={`type-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="photo">Photo</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="signature">Signature</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${index}`}
                              checked={step.required}
                              onCheckedChange={(checked) => updateStep(index, { required: !!checked })}
                            />
                            <Label htmlFor={`required-${index}`}>Required</Label>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStep(null)}
                      >
                        Done Editing
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{step.order}. {step.title}</span>
                            {step.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{step.type}</Badge>
                          </div>
                          {step.description && (
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(index, 'down')}
                          disabled={index === template.steps.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStep(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStep(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
