import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Book, FirstAidKit, Warning } from "@phosphor-icons/react"
import type { SOP } from "./SOPLibrary"

interface SOPCategoriesProps {
  sops: SOP[]
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
}

interface CategoryData {
  name: string
  icon: React.ReactNode
  subcategories: Record<string, number>
  total: number
}

export function SOPCategories({ sops, selectedCategory, onCategorySelect }: SOPCategoriesProps) {
  // Calculate category statistics
  const categories: Record<string, CategoryData> = {
    Machines: {
      name: "Machines",
      icon: <Wrench size={18} weight="fill" />,
      subcategories: {},
      total: 0,
    },
    Processes: {
      name: "Processes",
      icon: <Book size={18} weight="fill" />,
      subcategories: {},
      total: 0,
    },
    Troubleshooting: {
      name: "Troubleshooting",
      icon: <FirstAidKit size={18} weight="fill" />,
      subcategories: {},
      total: 0,
    },
    Safety: {
      name: "Safety",
      icon: <Warning size={18} weight="fill" />,
      subcategories: {},
      total: 0,
    },
  }

  // Count SOPs per category and subcategory
  sops.forEach(sop => {
    const cat = categories[sop.category]
    if (cat) {
      cat.total++
      if (sop.subcategory) {
        cat.subcategories[sop.subcategory] = (cat.subcategories[sop.subcategory] || 0) + 1
      }
    }
  })

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      onCategorySelect(null) // Deselect if clicking the same category
    } else {
      onCategorySelect(category)
    }
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-3">Categories</h3>
      <div className="space-y-3">
        {Object.values(categories).map(category => (
          <div key={category.name} className="space-y-1">
            <button
              onClick={() => handleCategoryClick(category.name)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                selectedCategory === category.name
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                {category.icon}
                <span className="font-medium text-sm">{category.name}</span>
              </div>
              <Badge 
                variant={selectedCategory === category.name ? "secondary" : "outline"}
                className="text-xs"
              >
                {category.total}
              </Badge>
            </button>

            {/* Subcategories */}
            {selectedCategory === category.name && Object.keys(category.subcategories).length > 0 && (
              <div className="ml-4 space-y-1 pt-1">
                {Object.entries(category.subcategories).map(([subcat, count]) => (
                  <div
                    key={subcat}
                    className="flex items-center justify-between py-1 px-2 text-sm text-muted-foreground"
                  >
                    <span>{subcat}</span>
                    <span className="text-xs">({count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCategory && (
        <button
          onClick={() => onCategorySelect(null)}
          className="w-full mt-3 text-sm text-primary hover:underline"
        >
          Clear filter
        </button>
      )}
    </Card>
  )
}
