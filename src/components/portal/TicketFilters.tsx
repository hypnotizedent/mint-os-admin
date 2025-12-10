import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MagnifyingGlass } from "@phosphor-icons/react"

interface TicketFiltersProps {
  filters: {
    status: string
    category: string
    search: string
  }
  onFiltersChange: (filters: any) => void
}

export function TicketFilters({ filters, onFiltersChange }: TicketFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search tickets by subject or number..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Open">Open</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Waiting">Waiting</SelectItem>
          <SelectItem value="Resolved">Resolved</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Order Issue">Order Issue</SelectItem>
          <SelectItem value="Art Approval">Art Approval</SelectItem>
          <SelectItem value="Shipping">Shipping</SelectItem>
          <SelectItem value="Billing">Billing</SelectItem>
          <SelectItem value="General">General</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
