# Mint OS Admin Dashboard - Design System

## Critical Layout Rule: Flex Chain Continuity

When using flexbox layouts, ensure the flex chain is unbroken:

### ✅ CORRECT:
```jsx
<div className="flex">
  <aside className="w-64" />
  <main className="flex-1 min-w-0">  {/* Direct child of flex */}
```

### ❌ BROKEN:
```jsx
<div className="flex">
  <aside className="w-64" />
  <SomeWrapper>  {/* Breaks flex chain! */}
    <main className="flex-1">  {/* flex-1 ignored */}
```

### ✅ FIX - Add flex properties to wrapper:
```jsx
<div className="flex">
  <aside className="w-64" />
  <SomeWrapper className="flex-1 min-w-0">  {/* Continues flex chain */}
    <main className="flex-1">
```

## Page Layout Standards

### StandardPageLayout Component

Use `StandardPageLayout` for consistent page structure:

```tsx
import { StandardPageLayout } from '@/components/shared/StandardPageLayout';

export function MyPage() {
  return (
    <StandardPageLayout
      title="Page Title"
      subtitle="Optional description"
      actions={<Button>Action</Button>}
    >
      {/* Page content */}
    </StandardPageLayout>
  );
}
```

### Grid Patterns

**Stats cards (4 columns on large screens):**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Content cards (3 columns on large screens):**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

**Two-column layout:**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

## Color Tokens

All colors use CSS custom properties defined in `index.css`:

- `--background` / `--foreground` - Page background and text
- `--card` / `--card-foreground` - Card backgrounds and text
- `--primary` / `--primary-foreground` - Primary actions
- `--muted` / `--muted-foreground` - Secondary text and backgrounds
- `--destructive` - Error states and delete actions

## Typography

- Page titles: `text-3xl font-bold text-foreground tracking-tight`
- Section titles: `text-xl font-semibold text-foreground`
- Body text: `text-foreground`
- Muted text: `text-muted-foreground`
- Small text: `text-sm text-muted-foreground`
