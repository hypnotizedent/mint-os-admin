import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  LoadingSpinner,
  PageLoading,
  CardSkeleton,
  TableSkeleton,
  StatCardSkeleton,
  EmptyState,
  ErrorState,
  InlineLoading,
  InlineError,
} from '../states'

describe('Loading States', () => {
  describe('LoadingSpinner', () => {
    it('renders with default label', () => {
      render(<LoadingSpinner />)
      expect(screen.getByRole('status')).toBeInTheDocument()
      // Uses getAllByText since there's both visible and sr-only text
      expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0)
    })

    it('renders with custom label', () => {
      render(<LoadingSpinner label="Fetching data..." />)
      expect(screen.getAllByText('Fetching data...').length).toBeGreaterThan(0)
    })

    it('has proper accessibility attributes', () => {
      render(<LoadingSpinner />)
      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-live', 'polite')
    })

    it('supports different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />)
      expect(document.querySelector('svg')).toHaveClass('size-4')
      
      rerender(<LoadingSpinner size="lg" />)
      expect(document.querySelector('svg')).toHaveClass('size-8')
    })
  })

  describe('PageLoading', () => {
    it('renders with default message', () => {
      render(<PageLoading />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders with custom message', () => {
      render(<PageLoading message="Loading your dashboard..." />)
      expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
    })

    it('has proper role for accessibility', () => {
      render(<PageLoading />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('CardSkeleton', () => {
    it('renders correct number of skeleton cards', () => {
      render(<CardSkeleton count={5} />)
      // Each card has a data-slot="card" attribute
      const cards = document.querySelectorAll('[data-slot="card"]')
      expect(cards.length).toBe(5)
    })

    it('defaults to 3 cards', () => {
      render(<CardSkeleton />)
      const cards = document.querySelectorAll('[data-slot="card"]')
      expect(cards.length).toBe(3)
    })
  })

  describe('TableSkeleton', () => {
    it('renders correct number of rows', () => {
      render(<TableSkeleton rows={10} columns={4} />)
      // The component renders header + rows
      const allRows = document.querySelectorAll('.divide-y > div')
      expect(allRows.length).toBe(10)
    })
  })

  describe('StatCardSkeleton', () => {
    it('renders correct number of stat cards', () => {
      render(<StatCardSkeleton count={6} />)
      const cards = document.querySelectorAll('[data-slot="card"]')
      expect(cards.length).toBe(6)
    })
  })

  describe('InlineLoading', () => {
    it('renders with default label', () => {
      render(<InlineLoading />)
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading')).toBeInTheDocument()
    })
  })
})

describe('Empty States', () => {
  describe('EmptyState', () => {
    it('renders default empty state', () => {
      render(<EmptyState />)
      expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first item.')).toBeInTheDocument()
    })

    it('renders search variant', () => {
      render(<EmptyState variant="search" />)
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })

    it('renders jobs variant', () => {
      render(<EmptyState variant="jobs" />)
      expect(screen.getByText('No jobs yet')).toBeInTheDocument()
    })

    it('renders customers variant', () => {
      render(<EmptyState variant="customers" />)
      expect(screen.getByText('No customers yet')).toBeInTheDocument()
    })

    it('renders with custom title and description', () => {
      render(
        <EmptyState
          title="Custom Title"
          description="Custom description text"
        />
      )
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom description text')).toBeInTheDocument()
    })

    it('renders action button when provided', async () => {
      const mockAction = { label: 'Add Item', onClick: vi.fn() }
      render(<EmptyState action={mockAction} />)
      
      const button = screen.getByRole('button', { name: 'Add Item' })
      expect(button).toBeInTheDocument()
      
      await userEvent.click(button)
      expect(mockAction.onClick).toHaveBeenCalledTimes(1)
    })
  })
})

describe('Error States', () => {
  describe('ErrorState', () => {
    it('renders default error state', () => {
      render(<ErrorState />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders network error variant', () => {
      render(<ErrorState variant="network" />)
      expect(screen.getByText('Connection error')).toBeInTheDocument()
    })

    it('renders not found variant', () => {
      render(<ErrorState variant="notFound" />)
      expect(screen.getByText('Not found')).toBeInTheDocument()
    })

    it('renders server error variant', () => {
      render(<ErrorState variant="serverError" />)
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })

    it('displays error message from Error object', () => {
      const error = new Error('API request failed')
      render(<ErrorState error={error} />)
      expect(screen.getByText('API request failed')).toBeInTheDocument()
    })

    it('displays error message from string', () => {
      render(<ErrorState error="Something bad happened" />)
      expect(screen.getByText('Something bad happened')).toBeInTheDocument()
    })

    it('renders retry button when onRetry provided', async () => {
      const mockRetry = vi.fn()
      render(<ErrorState onRetry={mockRetry} />)
      
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button).toBeInTheDocument()
      
      await userEvent.click(button)
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('InlineError', () => {
    it('renders error message', () => {
      render(<InlineError message="Field is required" />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Field is required')).toBeInTheDocument()
    })
  })
})
