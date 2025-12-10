# Mobile Features Test Plan

This document outlines the test cases for mobile and tablet optimization features. These tests should be implemented when a test framework is added to the project.

## Test Framework Setup (Future)
- Recommended: Vitest + React Testing Library
- Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event`

## Test Suites

### 1. Touch Target Tests (3 tests)

#### Test 1.1: Time Clock PIN Buttons Meet Minimum Size
```typescript
describe('MobileTimeClock', () => {
  it('should have touch targets of at least 60x60px', () => {
    render(<MobileTimeClock />);
    const buttons = screen.getAllByRole('button');
    
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(60);
      expect(rect.height).toBeGreaterThanOrEqual(60);
    });
  });
});
```

#### Test 1.2: Checklist Checkboxes Meet Minimum Size
```typescript
it('should have checkbox touch targets of at least 44x44px', () => {
  render(<MobileChecklist />);
  const checkboxes = screen.getAllByRole('button');
  
  checkboxes.forEach(checkbox => {
    const rect = checkbox.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);
  });
});
```

#### Test 1.3: Navigation Items Have Adequate Touch Targets
```typescript
it('should have navigation items with minimum 48px height', () => {
  render(<MobileNavigation currentPage="dashboard" onNavigate={jest.fn()} />);
  const navItems = screen.getAllByRole('button');
  
  navItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    expect(rect.height).toBeGreaterThanOrEqual(48);
  });
});
```

### 2. Offline Storage Tests (3 tests)

#### Test 2.1: Save Time Entry Offline
```typescript
describe('Offline Storage', () => {
  it('should save time entry to IndexedDB when offline', async () => {
    const entry = {
      id: '123',
      userId: '1234',
      timestamp: Date.now(),
      type: 'clock-in',
      synced: false
    };
    
    await saveTimeEntryOffline(entry);
    const entries = await getUnsyncedTimeEntries();
    
    expect(entries).toContainEqual(entry);
  });
});
```

#### Test 2.2: Save Checklist Offline
```typescript
it('should save checklist to IndexedDB when offline', async () => {
  const entry = {
    id: '456',
    checklistId: 'test-checklist',
    completed: true,
    timestamp: Date.now(),
    synced: false
  };
  
  await saveChecklistOffline(entry);
  const checklists = await getUnsyncedChecklists();
  
  expect(checklists).toContainEqual(entry);
});
```

#### Test 2.3: Cache SOP for Offline Access
```typescript
it('should cache SOP in IndexedDB', async () => {
  const sop = {
    id: '1',
    title: 'Test SOP',
    content: 'Test content',
    cachedAt: Date.now()
  };
  
  await cacheSOP(sop);
  const cached = await getCachedSOP('1');
  
  expect(cached).toEqual(sop);
});
```

### 3. Offline Sync Tests (2 tests)

#### Test 3.1: Sync Data When Back Online
```typescript
describe('Offline Sync', () => {
  it('should sync offline data when connection restored', async () => {
    // Setup: Save offline data
    const entry = {
      id: '789',
      userId: '1234',
      timestamp: Date.now(),
      type: 'clock-in',
      synced: false
    };
    await saveTimeEntryOffline(entry);
    
    // Mock network online
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    // Trigger sync
    const result = await syncOfflineData();
    
    expect(result.timeEntriesSynced).toBeGreaterThan(0);
  });
});
```

#### Test 3.2: Detect Pending Sync
```typescript
it('should detect pending sync data', async () => {
  const entry = {
    id: '101',
    userId: '1234',
    timestamp: Date.now(),
    type: 'clock-out',
    synced: false
  };
  await saveTimeEntryOffline(entry);
  
  const pending = await hasPendingSync();
  expect(pending).toBe(true);
});
```

### 4. Camera Capture Tests (2 tests)

#### Test 4.1: Request Camera Access
```typescript
describe('Camera Capture', () => {
  it('should request camera access', async () => {
    const mockGetUserMedia = jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    });
    
    global.navigator.mediaDevices = {
      getUserMedia: mockGetUserMedia
    };
    
    const { startCamera } = useCameraCapture();
    await startCamera('environment');
    
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
  });
});
```

#### Test 4.2: Capture Photo from Video
```typescript
it('should capture photo from video element', async () => {
  const videoElement = document.createElement('video');
  videoElement.videoWidth = 1920;
  videoElement.videoHeight = 1080;
  
  const { capturePhoto } = useCameraCapture();
  const blob = await capturePhoto(videoElement);
  
  expect(blob).toBeInstanceOf(Blob);
  expect(blob.type).toBe('image/jpeg');
});
```

### 5. Responsive Layout Tests (2 tests)

#### Test 5.1: Mobile Layout Renders Correctly
```typescript
describe('Responsive Layout', () => {
  it('should render mobile layout on small screens', () => {
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));
    
    render(<ProductionPage />);
    
    // Should show hamburger menu
    expect(screen.getByText('☰')).toBeInTheDocument();
  });
});
```

#### Test 5.2: Tablet Layout Renders Correctly
```typescript
it('should render tablet layout on medium screens', () => {
  global.innerWidth = 768;
  global.dispatchEvent(new Event('resize'));
  
  render(<ProductionPage />);
  
  // Should show sidebar instead of hamburger
  expect(screen.queryByText('☰')).not.toBeInTheDocument();
});
```

### 6. Online/Offline Detection Tests (2 tests)

#### Test 6.1: Detect Online Status
```typescript
describe('Online/Offline Detection', () => {
  it('should detect online status', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    const { result } = renderHook(() => useOffline());
    
    expect(result.current.isOnline).toBe(true);
  });
});
```

#### Test 6.2: Detect Offline Status
```typescript
it('should detect offline status', () => {
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    value: false
  });
  
  const { result } = renderHook(() => useOffline());
  
  expect(result.current.isOnline).toBe(false);
});
```

### 7. Inactivity Timer Tests (2 tests)

#### Test 7.1: Trigger Callback After Timeout
```typescript
describe('Inactivity Timer', () => {
  it('should trigger callback after timeout', async () => {
    jest.useFakeTimers();
    const onInactive = jest.fn();
    
    renderHook(() => useInactivity({
      timeout: 5000,
      onInactive
    }));
    
    jest.advanceTimersByTime(5000);
    
    expect(onInactive).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
```

#### Test 7.2: Reset Timer on Activity
```typescript
it('should reset timer on user activity', async () => {
  jest.useFakeTimers();
  const onInactive = jest.fn();
  
  renderHook(() => useInactivity({
    timeout: 5000,
    onInactive
  }));
  
  // Advance time partway
  jest.advanceTimersByTime(3000);
  
  // Simulate activity
  fireEvent.mouseDown(document);
  
  // Advance remaining time
  jest.advanceTimersByTime(3000);
  
  // Should not have called callback yet
  expect(onInactive).not.toHaveBeenCalled();
  
  jest.useRealTimers();
});
```

### 8. Component Integration Tests (2 tests)

#### Test 8.1: Clock In Flow
```typescript
describe('Component Integration', () => {
  it('should complete clock in flow', async () => {
    render(<MobileTimeClock />);
    
    // Enter PIN
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('4'));
    
    // Clock in
    fireEvent.click(screen.getByText('CLOCK IN'));
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/successfully/i)).toBeInTheDocument();
    });
  });
});
```

#### Test 8.2: Complete Checklist Flow
```typescript
it('should complete checklist flow', async () => {
  render(<MobileChecklist />);
  
  // Check first step
  const checkboxes = screen.getAllByRole('button');
  fireEvent.click(checkboxes[0]);
  
  // Submit checklist
  fireEvent.click(screen.getByText('Submit Checklist'));
  
  // Verify success
  await waitFor(() => {
    expect(screen.getByText(/saved/i)).toBeInTheDocument();
  });
});
```

## Test Coverage Goals

- **Minimum**: 80% coverage
- **Target**: 90% coverage
- **Critical paths**: 100% coverage

## Running Tests (Future)

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test mobile-features

# Run in watch mode
npm test -- --watch
```

## Continuous Integration

Tests should run on:
- Every pull request
- Every commit to main branch
- Before deployment

## Manual Testing Checklist

Until automated tests are implemented, manually verify:

- [ ] Touch targets are at least 60x60px on mobile
- [ ] Time clock PIN entry works
- [ ] Checklist completion and photo capture works
- [ ] SOP viewing and search works
- [ ] Offline mode saves data correctly
- [ ] Data syncs when back online
- [ ] PWA can be installed on iOS and Android
- [ ] Navigation works on mobile and tablet
- [ ] Auto-logout triggers after 5 minutes
- [ ] Camera access and photo capture works
- [ ] Responsive layouts work on all breakpoints
- [ ] Landscape and portrait orientations work
- [ ] Service worker caches assets correctly

## Performance Testing

- [ ] First load < 3s on 3G
- [ ] Cached load < 1s
- [ ] Touch response < 100ms
- [ ] Smooth 60fps animations
- [ ] No layout shifts (CLS < 0.1)
- [ ] First contentful paint < 1.5s
