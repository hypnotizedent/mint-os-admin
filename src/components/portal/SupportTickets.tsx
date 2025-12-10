import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Ticket, Clock, CheckCircle, XCircle, type Icon } from "@phosphor-icons/react"
import { TicketFilters } from "./TicketFilters"
import type { SupportTicket } from "@/lib/types"

interface SupportTicketsProps {
  tickets: SupportTicket[]
  onCreateTicket: () => void
  onViewTicket: (ticketId: string) => void
}

export function SupportTickets({ tickets, onCreateTicket, onViewTicket }: SupportTicketsProps) {
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: "",
  })

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filters.status === "all" || ticket.status === filters.status
    const matchesCategory = filters.category === "all" || ticket.category === filters.category
    const matchesSearch = filters.search === "" ||
      ticket.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(filters.search.toLowerCase())

    return matchesStatus && matchesCategory && matchesSearch
  })

  const openTickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length
  const resolvedTickets = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: Icon }> = {
      Open: { color: "bg-blue-100 text-blue-800", icon: Clock },
      "In Progress": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Waiting: { color: "bg-purple-100 text-purple-800", icon: Clock },
      Resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      Closed: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    }
    const variant = variants[status] || variants.Open
    const IconComponent = variant.icon
    return (
      <Badge className={variant.color}>
        <IconComponent size={14} className="mr-1" weight="fill" />
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

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return "less than an hour ago"
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Track and manage your support requests</p>
        </div>
        <Button onClick={onCreateTicket} className="gap-2">
          <Plus size={18} weight="bold" />
          New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Open Tickets</p>
              <p className="text-3xl font-bold text-foreground mt-2">{openTickets}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue/10">
              <Ticket size={24} weight="fill" className="text-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Resolved Tickets</p>
              <p className="text-3xl font-bold text-foreground mt-2">{resolvedTickets}</p>
            </div>
            <div className="p-3 rounded-lg bg-green/10">
              <CheckCircle size={24} weight="fill" className="text-green" />
            </div>
          </div>
        </Card>
      </div>

      <TicketFilters filters={filters} onFiltersChange={setFilters} />

      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <Ticket size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tickets found</h3>
            <p className="text-muted-foreground mb-6">
              {filters.status !== "all" || filters.category !== "all" || filters.search !== ""
                ? "Try adjusting your filters"
                : "Create your first support ticket to get started"
              }
            </p>
            {filters.status === "all" && filters.category === "all" && filters.search === "" && (
              <Button onClick={onCreateTicket} className="gap-2">
                <Plus size={18} weight="bold" />
                Create Ticket
              </Button>
            )}
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onViewTicket(ticket.id)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-muted-foreground">{ticket.ticketNumber}</span>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Opened: {formatDate(ticket.createdAt)}</span>
                    <span>Last update: {formatDate(ticket.updatedAt)}</span>
                  </div>
                  {ticket.orderNumber && (
                    <span className="font-medium">Order #{ticket.orderNumber}</span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
