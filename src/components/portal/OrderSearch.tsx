import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { MagnifyingGlass } from "@phosphor-icons/react"

interface OrderSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export function OrderSearch({ 
  onSearch, 
  placeholder = "Search by order number, product name, or PO...",
  debounceMs = 300 
}: OrderSearchProps) {
  const [searchValue, setSearchValue] = useState("")

  // Debounce search with cleanup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchValue)
    }, debounceMs)
    
    return () => clearTimeout(timeoutId)
  }, [searchValue, debounceMs, onSearch])

  return (
    <div className="relative flex-1">
      <MagnifyingGlass 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
        size={18} 
      />
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
