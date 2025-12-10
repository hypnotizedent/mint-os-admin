import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MagnifyingGlass, Star, Book, Wrench, FirstAidKit, Warning, Plus } from "@phosphor-icons/react"
import { SOPViewer } from "./SOPViewer"
import { SOPEditor } from "./SOPEditor"
import { SOPSearch } from "./SOPSearch"
import { SOPCategories } from "./SOPCategories"

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

export interface SOP {
  id: string
  title: string
  slug: string
  category: 'Machines' | 'Processes' | 'Troubleshooting' | 'Safety'
  subcategory?: string
  tags: string[]
  summary: string
  content: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: number
  viewCount: number
  version: number
  updatedAt: string
  isFavorite?: boolean
}

interface SOPLibraryProps {
  onNavigate?: (page: string) => void
}

export function SOPLibrary({ onNavigate }: SOPLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [sops, setSOPs] = useState<SOP[]>([])
  const [favorites, setFavorites] = useState<SOP[]>([])
  const [mostViewed, setMostViewed] = useState<SOP[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSOPs()
  }, [])

  const fetchSOPs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/sops?pagination[limit]=100&sort=updatedAt:desc`)
      if (!response.ok) {
        throw new Error(`Failed to fetch SOPs: ${response.status}`)
      }
      const data = await response.json()
      
      // Transform Strapi response to SOP format
      const transformedSOPs: SOP[] = (data.data || []).map((item: any) => ({
        id: item.documentId || item.id.toString(),
        title: item.title || 'Untitled SOP',
        slug: item.slug || item.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
        category: item.category || 'Processes',
        subcategory: item.subcategory,
        tags: item.tags || [],
        summary: item.summary || item.description || '',
        content: item.content || '',
        difficulty: item.difficulty || 'Beginner',
        estimatedTime: item.estimatedTime || 0,
        viewCount: item.viewCount || 0,
        version: item.version || 1,
        updatedAt: item.updatedAt || new Date().toISOString(),
        isFavorite: item.isFavorite || false,
      }))
      
      setSOPs(transformedSOPs)
    } catch (err) {
      console.error('Error fetching SOPs:', err)
      setError('Unable to load SOPs. Please try again later.')
      setSOPs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Update favorites and most viewed when SOPs change
  useEffect(() => {
    setFavorites(sops.filter(sop => sop.isFavorite))
    const sorted = [...sops].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)
    setMostViewed(sorted)
  }, [sops])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
  }

  const handleSOPSelect = (sop: SOP) => {
    setSelectedSOP(sop)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCreate = () => {
    setSelectedSOP(null)
    setIsCreating(true)
  }

  const handleSave = async (sop: SOP) => {
    try {
      const isNew = !sops.some(s => s.id === sop.id)
      const url = isNew 
        ? `${API_BASE}/api/sops`
        : `${API_BASE}/api/sops/${sop.id}`
      
      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            title: sop.title,
            slug: sop.slug,
            category: sop.category,
            subcategory: sop.subcategory,
            tags: sop.tags,
            summary: sop.summary,
            content: sop.content,
            difficulty: sop.difficulty,
            estimatedTime: sop.estimatedTime,
            viewCount: sop.viewCount,
            version: sop.version,
            isFavorite: sop.isFavorite,
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save SOP: ${response.status}`)
      }

      const savedData = await response.json()
      const savedSOP: SOP = {
        ...sop,
        id: savedData.data?.documentId || savedData.data?.id?.toString() || sop.id,
        updatedAt: savedData.data?.updatedAt || new Date().toISOString(),
      }

      setSOPs(prev => {
        const existing = prev.find(s => s.id === savedSOP.id)
        if (existing) {
          return prev.map(s => s.id === savedSOP.id ? savedSOP : s)
        }
        return [...prev, savedSOP]
      })
      setIsEditing(false)
      setIsCreating(false)
      setSelectedSOP(savedSOP)
      setError(null)
    } catch (err) {
      console.error('Error saving SOP:', err)
      // Show error message to user instead of optimistic update
      setError('Failed to save SOP. Please try again.')
      // Keep editing mode open so user can retry
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsCreating(false)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      Machines: <Wrench size={20} weight="fill" />,
      Processes: <Book size={20} weight="fill" />,
      Troubleshooting: <FirstAidKit size={20} weight="fill" />,
      Safety: <Warning size={20} weight="fill" />,
    }
    return icons[category as keyof typeof icons] || <Book size={20} weight="fill" />
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: 'bg-green-600/20 text-green-600 border-green-600/30',
      Intermediate: 'bg-yellow/20 text-yellow border-yellow/30',
      Advanced: 'bg-destructive/20 text-destructive border-destructive/30',
    }
    return colors[difficulty as keyof typeof colors] || 'bg-muted text-foreground'
  }

  const filteredSOPs = sops.filter(sop => {
    const matchesSearch = !searchQuery || 
      sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || sop.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (selectedSOP && !isEditing && !isCreating) {
    return (
      <SOPViewer 
        sop={selectedSOP} 
        onBack={() => setSelectedSOP(null)}
        onEdit={handleEdit}
      />
    )
  }

  if ((isEditing || isCreating) && (selectedSOP || isCreating)) {
    return (
      <SOPEditor
        sop={isEditing ? selectedSOP || undefined : undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">SOP Library</h1>
          <p className="text-muted-foreground mt-1">Standard Operating Procedures & Documentation</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus size={18} weight="bold" />
          New SOP
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchSOPs}>
            Retry
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!isLoading && (
        <>
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search SOPs by title, tags, or content..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Access - Favorites */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} weight="fill" className="text-yellow" />
              <h3 className="font-semibold text-foreground">Favorites</h3>
            </div>
            <div className="space-y-2">
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No favorites yet</p>
              ) : (
                favorites.map(sop => (
                  <button
                    key={sop.id}
                    onClick={() => handleSOPSelect(sop)}
                    className="w-full text-left text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {sop.title}
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Categories */}
          <SOPCategories
            sops={sops}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {/* Most Viewed */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Most Viewed</h3>
            <div className="space-y-3">
              {mostViewed.map((sop, index) => (
                <button
                  key={sop.id}
                  onClick={() => handleSOPSelect(sop)}
                  className="w-full text-left group"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-muted-foreground mt-0.5">{index + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {sop.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{sop.viewCount} views</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All SOPs ({filteredSOPs.length})</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {filteredSOPs.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No SOPs found</p>
                </Card>
              ) : (
                filteredSOPs.map(sop => (
                  <Card 
                    key={sop.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleSOPSelect(sop)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getCategoryIcon(sop.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{sop.title}</h3>
                              {sop.isFavorite && (
                                <Star size={16} weight="fill" className="text-yellow" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{sop.summary}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {sop.category}
                          </Badge>
                          {sop.subcategory && (
                            <Badge variant="outline" className="text-xs">
                              {sop.subcategory}
                            </Badge>
                          )}
                          <Badge variant="outline" className={getDifficultyColor(sop.difficulty) + " text-xs"}>
                            {sop.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {sop.estimatedTime} min
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {sop.viewCount} views
                          </span>
                          <span className="text-xs text-muted-foreground">
                            v{sop.version}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-3">
              {[...filteredSOPs]
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10)
                .map(sop => (
                  <Card 
                    key={sop.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleSOPSelect(sop)}
                  >
                    <h3 className="font-semibold text-foreground mb-1">{sop.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(sop.updatedAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="popular" className="space-y-3">
              {[...filteredSOPs]
                .sort((a, b) => b.viewCount - a.viewCount)
                .slice(0, 10)
                .map(sop => (
                  <Card 
                    key={sop.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleSOPSelect(sop)}
                  >
                    <h3 className="font-semibold text-foreground mb-1">{sop.title}</h3>
                    <p className="text-sm text-muted-foreground">{sop.viewCount} views</p>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </>
      )}
    </div>
  )
}
