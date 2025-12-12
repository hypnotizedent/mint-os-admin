# Mint OS Admin Dashboard - Design System

## Layout Rules

### Page Structure
All pages follow this structure:
```tsx
<div className="space-y-6">
  {/* Header with title and action button */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-foreground tracking-tight">Page Title</h1>
      <p className="text-muted-foreground mt-1">Page description</p>
    </div>
    <Button>Action</Button>
  </div>
  
  {/* Content */}
  {children}
</div>
```

### Key Principles
- All page content containers use `w-full` (implicit via PageWrapper)
- No hardcoded narrow widths on main containers
- PageWrapper provides `p-6` padding
- Background is controlled by AdminLayout (`bg-background`)

## Grid Patterns

### Stats Cards (4 columns)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Content Cards (responsive 3-4 columns)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Summary Stats (3 columns)
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card className="p-6">{/* stat */}</Card>
</div>
```

### Two-Panel Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card>{/* Panel 1 */}</Card>
  <Card>{/* Panel 2 */}</Card>
</div>
```

### Form Layouts
```tsx
{/* Two-column form fields */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField />
  <FormField />
</div>

{/* Full-width centered form (optional) */}
<div className="w-full max-w-4xl mx-auto">
  {/* form content */}
</div>
```

## Spacing Standards

| Context | Class | Value |
|---------|-------|-------|
| Page padding | `p-6` | 1.5rem |
| Section spacing | `space-y-6` | 1.5rem gap |
| Card gaps | `gap-6` | 1.5rem |
| Stat card gaps | `gap-4` | 1rem |
| Inside cards | `p-4` or `p-6` | 1-1.5rem |
| Form field gaps | `gap-4` | 1rem |

## Color System (CSS Variables)

### Light Mode
- `--background`: near-white
- `--foreground`: dark text
- `--card`: white
- `--muted`: light gray

### Dark Mode (Default)
- `--background`: dark navy (#1a1a2e)
- `--foreground`: light text
- `--card`: slightly lighter dark
- `--muted`: darker gray

## Component Patterns

### Page Header
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-foreground tracking-tight">Title</h1>
    <p className="text-muted-foreground mt-1">Description</p>
  </div>
  <Button className="gap-2">
    <Icon size={18} />
    Action
  </Button>
</div>
```

### Stat Card
```tsx
<Card className="p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Label</p>
      <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
    </div>
    <div className="p-3 rounded-lg bg-primary/10">
      <Icon size={24} weight="fill" className="text-primary" />
    </div>
  </div>
</Card>
```

### Content Card with Header
```tsx
<Card className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <h3 className="font-semibold text-lg text-foreground">{title}</h3>
      <span className="text-sm text-muted-foreground">{subtitle}</span>
    </div>
  </div>
  {children}
</Card>
```

## Typography

| Element | Class |
|---------|-------|
| Page title | `text-3xl font-bold text-foreground tracking-tight` |
| Section title | `text-xl font-semibold text-foreground` |
| Card title | `text-lg font-semibold text-foreground` |
| Body text | `text-foreground` |
| Muted text | `text-muted-foreground` |
| Small text | `text-sm text-muted-foreground` |

## Animation

Using Framer Motion for page transitions:
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}
```
