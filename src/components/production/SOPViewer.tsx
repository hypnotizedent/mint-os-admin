import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Star, 
  Printer, 
  ShareNetwork, 
  PencilSimple,
  Clock,
  CheckCircle,
  Warning,
  Lightbulb,
} from "@phosphor-icons/react"
import type { SOP } from "./SOPLibrary"

interface SOPStep {
  order: number
  title: string
  content: string
  images?: string[]
  videos?: string[]
  warnings?: string[]
  tips?: string[]
  checklist?: string[]
}

interface SOPViewerProps {
  sop: SOP
  onBack: () => void
  onEdit: () => void
}

export function SOPViewer({ sop, onBack, onEdit }: SOPViewerProps) {
  const [isFavorite, setIsFavorite] = useState(sop.isFavorite || false)

  // Mock steps data - in real app, this would be part of the SOP data
  const steps: SOPStep[] = [
    {
      order: 1,
      title: "Prepare Screens",
      content: "Gather all screens needed for the job and inspect for any damage or debris.",
      checklist: [
        "Check screen mesh for tears",
        "Clean screens with degreaser",
        "Verify screen IDs match job ticket"
      ],
      warnings: ["Always wear safety glasses when handling screens"],
      tips: ["Use a lint roller to remove dust quickly"],
      images: ["screen-clean.jpg"]
    },
    {
      order: 2,
      title: "Mount Screens to Press",
      content: "Install screens in correct print order (typically lightest to darkest colors).",
      checklist: [
        "Loosen screen clamps",
        "Slide screen into press arms",
        "Center screen over platen",
        "Tighten clamps evenly"
      ],
      images: ["screen-mounting.jpg"],
      videos: ["screen-alignment.mp4"]
    },
    {
      order: 3,
      title: "Register Screens",
      content: "Align all screens to ensure proper registration and color overlay.",
      checklist: [
        "Place registration marks on platen",
        "Adjust screen position to match marks",
        "Test print on transparency",
        "Fine-tune until perfect alignment"
      ],
      tips: ["Use micro-registration screws for fine adjustments"]
    }
  ]

  const relatedSOPs = [
    { id: '2', title: 'Ink Mixing Color Matching' },
    { id: '3', title: 'Test Print Quality Checklist' },
    { id: '4', title: 'Screen Cleaning & Reclaiming' }
  ]

  const toggleFavorite = async () => {
    // TODO: Call API to toggle favorite
    setIsFavorite(!isFavorite)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    // Copy link to clipboard
    navigator.clipboard.writeText(window.location.href)
    // TODO: Show toast notification
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: 'bg-green-600/20 text-green-600 border-green-600/30',
      Intermediate: 'bg-yellow/20 text-yellow border-yellow/30',
      Advanced: 'bg-destructive/20 text-destructive border-destructive/30',
    }
    return colors[difficulty as keyof typeof colors] || 'bg-muted text-foreground'
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft size={18} />
          Back to Library
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleFavorite} className="gap-2">
            <Star size={18} weight={isFavorite ? "fill" : "regular"} className={isFavorite ? "text-yellow" : ""} />
            {isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer size={18} />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <ShareNetwork size={18} />
            Share
          </Button>
          <Button variant="default" size="sm" onClick={onEdit} className="gap-2">
            <PencilSimple size={18} />
            Edit
          </Button>
        </div>
      </div>

      {/* SOP Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{sop.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{sop.category}</Badge>
              {sop.subcategory && (
                <>
                  <span className="text-muted-foreground">›</span>
                  <Badge variant="outline">{sop.subcategory}</Badge>
                </>
              )}
              <Badge variant="outline" className={getDifficultyColor(sop.difficulty)}>
                {sop.difficulty}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock size={16} />
                Est. Time: {sop.estimatedTime} min
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Updated: {new Date(sop.updatedAt).toLocaleDateString()} • Version {sop.version}
            </div>
            <div>
              {sop.viewCount} views
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Summary</h3>
            <p className="text-foreground leading-relaxed">{sop.summary}</p>
          </div>
        </div>
      </Card>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <Card key={step.order} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                  {step.order}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    STEP {step.order}: {step.title.toUpperCase()}
                  </h2>
                  <p className="text-foreground leading-relaxed">{step.content}</p>
                </div>
              </div>

              {/* Checklist */}
              {step.checklist && step.checklist.length > 0 && (
                <div className="space-y-2 ml-12">
                  {step.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle size={18} weight="fill" className="text-green-600 shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Images and Videos */}
              {(step.images || step.videos) && (
                <div className="ml-12 space-y-2">
                  {step.images?.map((image, idx) => (
                    <div key={idx} className="bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Printer size={16} />
                        <span>[Image: {image}]</span>
                      </div>
                    </div>
                  ))}
                  {step.videos?.map((video, idx) => (
                    <div key={idx} className="bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Printer size={16} />
                        <span>[Video: {video}]</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {step.warnings && step.warnings.length > 0 && (
                <div className="ml-12">
                  {step.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 p-3 rounded-lg">
                      <Warning size={20} weight="fill" className="text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-destructive text-sm">WARNING</p>
                        <p className="text-foreground text-sm">{warning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              {step.tips && step.tips.length > 0 && (
                <div className="ml-12">
                  {step.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                      <Lightbulb size={20} weight="fill" className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-500 text-sm">PRO TIP</p>
                        <p className="text-foreground text-sm">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Related SOPs */}
      {relatedSOPs.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Related SOPs</h3>
          <div className="space-y-2">
            {relatedSOPs.map(related => (
              <button
                key={related.id}
                className="w-full text-left text-foreground hover:text-primary transition-colors"
              >
                • {related.title}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Footer */}
      <Card className="p-4 bg-muted/50">
        <div className="text-sm text-muted-foreground text-center">
          <p>Need help? Contact: Production Manager</p>
          <p className="mt-1">
            Last reviewed: {new Date(sop.updatedAt).toLocaleDateString()} • 
            Version {sop.version} • 
            <button className="text-primary hover:underline ml-1">View Version History</button>
          </p>
        </div>
      </Card>
    </div>
  )
}
