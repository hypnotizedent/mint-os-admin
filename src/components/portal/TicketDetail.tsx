import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Paperclip, User, UserCircle, CheckCircle, Clock } from "@phosphor-icons/react"
import type { SupportTicket, TicketComment } from "@/lib/types"

interface TicketDetailProps {
  ticket: SupportTicket
  onBack: () => void
  onAddComment: (message: string, attachments: File[]) => void
  onMarkResolved?: () => void
}

export function TicketDetail({ ticket, onBack, onAddComment, onMarkResolved }: TicketDetailProps) {
  const [comment, setComment] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])

  const handleSubmitComment = () => {
    if (!comment.trim() && attachments.length === 0) return
    onAddComment(comment, attachments)
    setComment("")
    setAttachments([])
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    setAttachments([...attachments, ...Array.from(files)].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      Open: { color: "bg-blue-100 text-blue-800", icon: Clock },
      "In Progress": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Waiting: { color: "bg-purple-100 text-purple-800", icon: Clock },
      Resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      Closed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
    }
    const variant = variants[status] || variants.Open
    const Icon = variant.icon
    return (
      <Badge className={variant.color}>
        <Icon size={14} className="mr-1" weight="fill" />
        {status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      Low: "bg-gray-100 text-gray-800",
      Medium: "bg-blue-100 text-blue-800",
      High: "bg-orange-100 text-orange-800",
      Urgent: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[priority] || colors.Medium}>{priority}</Badge>
  }

  const formatDateTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-sm text-muted-foreground">{ticket.ticketNumber}</span>
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{ticket.subject}</h1>
              {ticket.orderNumber && (
                <p className="text-sm text-muted-foreground">Related to Order #{ticket.orderNumber}</p>
              )}
              {ticket.assignedTo && (
                <p className="text-sm text-muted-foreground">Assigned to: {ticket.assignedTo}</p>
              )}
            </div>
            {onMarkResolved && (ticket.status === "Open" || ticket.status === "In Progress") && (
              <Button onClick={onMarkResolved} className="gap-2">
                <CheckCircle size={18} weight="fill" />
                Mark as Resolved
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-6">
            {/* Initial ticket description */}
            <div className="flex gap-4">
              <div className="p-2 rounded-full bg-primary/10 h-fit">
                <User size={20} className="text-primary" weight="fill" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{ticket.customerName || "You"}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(ticket.createdAt)}
                  </span>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {ticket.attachments.map((file: any, index: number) => (
                        <a
                          key={index}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Paperclip size={16} />
                          {file.fileName}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments/Responses */}
            {ticket.comments && ticket.comments.map((comment: TicketComment) => (
              <div key={comment.id} className="flex gap-4">
                <div className={`p-2 rounded-full h-fit ${
                  comment.userType === 'staff' ? 'bg-blue/10' : 'bg-primary/10'
                }`}>
                  {comment.userType === 'staff' ? (
                    <UserCircle size={20} className="text-blue" weight="fill" />
                  ) : (
                    <User size={20} className="text-primary" weight="fill" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {comment.userType === 'staff' ? 'Support Team' : 'You'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    comment.userType === 'staff' ? 'bg-blue/5' : 'bg-secondary'
                  }`}>
                    <p className="text-foreground whitespace-pre-wrap">{comment.message}</p>
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {comment.attachments.map((file: any, index: number) => (
                          <a
                            key={index}
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Paperclip size={16} />
                            {file.fileName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ticket.status !== "Closed" && (
            <>
              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Add Comment</h3>
                <Textarea
                  placeholder="Type your message here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
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
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.ai,.eps,.psd,.zip"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    id="comment-file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('comment-file-upload')?.click()}
                    className="gap-2"
                  >
                    <Paperclip size={18} />
                    Attach Files
                  </Button>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!comment.trim() && attachments.length === 0}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
