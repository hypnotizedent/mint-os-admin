# Mint OS Admin Dashboard - Troubleshooting Guide

## Layout Issues

### Problem: Pages Not Filling Full Width (v2.3.1 fix)

**Symptoms:**
- Content hugs the left side of the screen
- Right half of pages appears empty
- Some pages work (Dashboard, Customers) while others don't

**Root Cause:**
In CSS Flexbox, `flex-1` only works on DIRECT children of a flex container.

```jsx
// BROKEN - flex-1 on <main> is useless because SkipNavContent breaks the chain
<div className="flex">           // flex container
  <Sidebar />                    // flex child ✅
  <SkipNavContent>               // flex child but has NO flex-1 ❌
    <main className="flex-1">    // NOT a direct flex child, flex-1 ignored
```

```jsx
// FIXED - SkipNavContent gets flex-1 to expand
<div className="flex">
  <Sidebar />
  <SkipNavContent className="flex-1 min-w-0">  // ✅ Now expands
    <main className="flex-1">                   // ✅ Works within parent
```

**The Fix:**
Add `flex-1 min-w-0` to any wrapper element between a flex container and its expanding content.

**Files Changed:**
- `src/pages/admin/AdminLayout.tsx` - Added flex-1 min-w-0 to SkipNavContent

---

## Common CSS Flexbox Gotchas

1. **flex-1 requires direct parent to be flex container**
2. **min-w-0 prevents flex items from overflowing** (important for text truncation)
3. **Wrapper elements break the flex chain** - they need their own flex properties
