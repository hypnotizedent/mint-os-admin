import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarBlank, Funnel } from "@phosphor-icons/react"
import { format } from "date-fns"
import type { OrderStatus } from "@/lib/types"

interface OrderFiltersProps {
  onFilterChange: (filters: OrderFilterState) => void
  onClearFilters: () => void
}

export interface OrderFilterState {
  status?: string
  dateFrom?: Date
  dateTo?: Date
}

export function OrderFilters({ onFilterChange, onClearFilters }: OrderFiltersProps) {
  const [status, setStatus] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? undefined : value
    setStatus(newStatus || "")
    onFilterChange({
      status: newStatus,
      dateFrom,
      dateTo,
    })
  }

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date)
    onFilterChange({
      status: status || undefined,
      dateFrom: date,
      dateTo,
    })
  }

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date)
    onFilterChange({
      status: status || undefined,
      dateFrom,
      dateTo: date,
    })
  }

  const handleClearFilters = () => {
    setStatus("")
    setDateFrom(undefined)
    setDateTo(undefined)
    onFilterChange({
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    })
    onClearFilters()
  }

  const hasActiveFilters = status !== "" || dateFrom !== undefined || dateTo !== undefined

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <Funnel size={18} className="text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select value={status || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="quote">Quote</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_production">In Production</SelectItem>
          <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-start">
            <CalendarBlank size={16} className="mr-2" />
            {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFrom}
            onSelect={handleDateFromChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-start">
            <CalendarBlank size={16} className="mr-2" />
            {dateTo ? format(dateTo, "MMM d, yyyy") : "To Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateTo}
            onSelect={handleDateToChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}
