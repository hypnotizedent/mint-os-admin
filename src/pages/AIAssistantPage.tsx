/**
 * AI Assistant Page
 * Full-page AI chat interface with additional features
 */

import { AIAssistant } from "@/components/ai/AIAssistant"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  ChatCircleDots,
  Image,
  ChartLineUp,
  Lightbulb,
  ClockCounterClockwise,
} from "@phosphor-icons/react"

export function AIAssistantPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground mt-1">
            Get instant answers powered by our knowledge base
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Brain size={14} />
          RAG-Powered
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat */}
        <div className="lg:col-span-2">
          <AIAssistant />
        </div>

        {/* Sidebar Features */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "What's the turnaround time for screen printing?",
                "What file format do you accept for designs?",
                "Do you offer rush orders?",
                "What's the minimum order quantity?",
              ].map((question, i) => (
                <button
                  key={i}
                  className="w-full text-left text-sm p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {question}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">AI Capabilities</CardTitle>
              <CardDescription className="text-xs">
                What our AI can help you with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ChatCircleDots className="text-blue-500" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">Customer Support</p>
                  <p className="text-xs text-muted-foreground">
                    Answer questions about pricing, turnaround, and more
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Image className="text-purple-500" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">Design Analysis</p>
                  <p className="text-xs text-muted-foreground">
                    Check artwork for print compatibility
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ChartLineUp className="text-green-500" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">Smart Pricing</p>
                  <p className="text-xs text-muted-foreground">
                    Get instant quote estimates
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Lightbulb className="text-orange-500" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">Recommendations</p>
                  <p className="text-xs text-muted-foreground">
                    Suggest the best print method for your project
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Topics */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ClockCounterClockwise size={16} className="text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Popular Topics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "Screen Printing",
                  "DTG",
                  "Embroidery",
                  "Rush Orders",
                  "Bulk Pricing",
                  "File Formats",
                  "Color Matching",
                  "Shipping",
                ].map((topic, i) => (
                  <Badge key={i} variant="outline" className="cursor-pointer hover:bg-muted">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
