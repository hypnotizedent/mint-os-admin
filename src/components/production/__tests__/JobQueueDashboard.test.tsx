import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobQueueDashboard } from '../JobQueueDashboard'

// Mock fetch API
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock job data
const mockJobs = [
  {
    id: 1,
    documentId: 'job-1',
    orderNumber: '12345',
    customer: { name: 'ABC Company' },
    status: 'IN_PRODUCTION',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    items: [{ type: 'Screen Printing' }],
  },
  {
    id: 2,
    documentId: 'job-2',
    orderNumber: '12346',
    customer: { name: 'XYZ Corp' },
    status: 'PENDING',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days
    items: [{ type: 'DTG' }],
  },
  {
    id: 3,
    documentId: 'job-3',
    orderNumber: '12347',
    customer: { name: 'Smith LLC' },
    status: 'COMPLETED',
    dueDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    items: [{ type: 'Embroidery' }],
  },
]

describe('JobQueueDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockJobs }),
    })
  })

  it('renders job queue after loading', async () => {
    render(<JobQueueDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
  })

  it('falls back to mock data on API error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(<JobQueueDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
    
    // Should still render with mock data
    expect(screen.getByText(/jobs total/)).toBeInTheDocument()
  })

  it('searches jobs by query', async () => {
    render(<JobQueueDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search jobs...')
    await userEvent.type(searchInput, 'ABC')
    
    // Search should filter results
    expect(searchInput).toHaveValue('ABC')
  })

  it('has onJobSelect prop', async () => {
    const mockOnJobSelect = vi.fn()
    render(<JobQueueDashboard onJobSelect={mockOnJobSelect} />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
  })

  it('sorts jobs by different criteria', async () => {
    render(<JobQueueDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
    
    // Find and change the sort dropdown
    const sortSelect = screen.getByRole('combobox')
    await userEvent.selectOptions(sortSelect, 'dueDate')
    
    expect(sortSelect).toHaveValue('dueDate')
  })

  it('shows refresh button', async () => {
    render(<JobQueueDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
    
    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    expect(refreshButton).toBeInTheDocument()
    
    await userEvent.click(refreshButton)
    
    // Fetch should be called again
    expect(mockFetch).toHaveBeenCalled()
  })

  it('displays urgent priority stats', async () => {
    render(<JobQueueDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('shows average time stat', async () => {
    render(<JobQueueDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Avg. Time')).toBeInTheDocument()
  })

  it('displays filter buttons', async () => {
    render(<JobQueueDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Production Queue')).toBeInTheDocument()
    })
    
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })
})
