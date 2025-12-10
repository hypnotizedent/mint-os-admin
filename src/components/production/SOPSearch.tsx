import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MagnifyingGlass, FunnelSimple } from "@phosphor-icons/react"
import type { SOP } from "./SOPLibrary"

interface SOPSearchProps {
  onSearch: (results: SOP[]) => void
  allSOPs: SOP[]
}

export function SOPSearch({ onSearch, allSOPs }: SOPSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)

  const categories = ["Machines", "Processes", "Troubleshooting", "Safety"]
  const difficulties = ["Beginner", "Intermediate", "Advanced"]

  const handleSearch = () => {
    let results = allSOPs

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      results = results.filter(sop => 
        sop.title.toLowerCase().includes(lowerQuery) ||
        sop.summary.toLowerCase().includes(lowerQuery) ||
        sop.content.toLowerCase().includes(lowerQuery) ||
        sop.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      results = results.filter(sop => selectedCategories.includes(sop.category))
    }

    // Filter by difficulties
    if (selectedDifficulties.length > 0) {
      results = results.filter(sop => selectedDifficulties.includes(sop.difficulty))
    }

    // Sort results
    switch (sortBy) {
      case "relevance":
        // Already sorted by relevance (query match)
        break
      case "popular":
        results = [...results].sort((a, b) => b.viewCount - a.viewCount)
        break
      case "recent":
        results = [...results].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        break
      case "alphabetical":
        results = [...results].sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    onSearch(results)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedDifficulties([])
    setSortBy("relevance")
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search SOPs by title, tags, or content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} className="gap-2">
            <MagnifyingGlass size={18} weight="bold" />
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <FunnelSimple size={18} />
            Filters
          </Button>
        </div>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Categories</Label>
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label
                      htmlFor={`cat-${category}`}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Difficulty</Label>
                {difficulties.map(difficulty => (
                  <div key={difficulty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`diff-${difficulty}`}
                      checked={selectedDifficulties.includes(difficulty)}
                      onCheckedChange={() => toggleDifficulty(difficulty)}
                    />
                    <label
                      htmlFor={`diff-${difficulty}`}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {difficulty}
                    </label>
                  </div>
                ))}
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategories.length > 0 || selectedDifficulties.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedCategories.map(cat => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
                {selectedDifficulties.map(diff => (
                  <Badge key={diff} variant="secondary">
                    {diff}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
