# Known Issues - December 11, 2025

Status: Documented for future fix

## Pages with Errors

### 1. Customers Page
**Error:** Cannot read properties of undefined (reading 'toLocaleString')
**Status:** Pre-existing (exists at v1.0-stable)
**Cause:** Likely calling toLocaleString() on undefined date field
**Fix Required:** Add null checks before date formatting
**Priority:** HIGH

### 2. Schedule Page  
**Error:** isLoading is not defined
**Status:** Pre-existing (exists at v1.0-stable)
**Cause:** Missing isLoading state declaration
**Fix Required:** Add useState for isLoading
**Priority:** MEDIUM

### 3. Products Page
**Status:** Loads but images don't display
**Cause:** Image URLs not configured
**Fix Required:** Add getProductImageUrl() function (already attempted in v1.1)
**Priority:** LOW

## Working Pages

- Dashboard - Loads with metrics
- Orders - (untested but likely working)
- Quotes - (untested but likely working)
- Jobs - (untested but likely working)

## Timeline

- December 10: v1.0-stable tagged (these issues existed)
- December 11: Attempted improvements in feature/improvements-day4
- December 11: Rolled back to v1.0-stable for stability
- December 11: Confirmed issues pre-existed

## Fix Strategy (Tomorrow)

1. Create feature/fix-customers branch
2. Fix Customers page null checking
3. Test thoroughly
4. Commit and tag

5. Create feature/fix-schedule branch
6. Add isLoading state
7. Test thoroughly
8. Commit and tag

9. Create feature/product-images branch
10. Implement image URLs properly
11. Test thoroughly
12. Commit and tag

## Notes

These pages may have been incomplete implementations or broke during
earlier development. They are NOT regressions from today's work.

Tomorrow we can fix them properly with fresh eyes and proper testing.
