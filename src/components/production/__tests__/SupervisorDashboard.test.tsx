import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SupervisorDashboard } from '../SupervisorDashboard'

describe('SupervisorDashboard', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument()
    })
  })

  it('displays active alerts', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Active Alerts')).toBeInTheDocument()
    })
    
    // Should show unacknowledged alerts
    expect(screen.getByText('Job Running Behind')).toBeInTheDocument()
    expect(screen.getByText('Equipment Issue')).toBeInTheDocument()
  })

  it('acknowledges alerts when button clicked', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Active Alerts')).toBeInTheDocument()
    })
    
    // Find acknowledge buttons
    const acknowledgeButtons = screen.getAllByRole('button', { name: 'Acknowledge' })
    expect(acknowledgeButtons.length).toBeGreaterThan(0)
    
    await userEvent.click(acknowledgeButtons[0])
    
    // Alert count should update - wait for state change
    await waitFor(() => {
      // One alert should be acknowledged now
      const remainingButtons = screen.getAllByRole('button', { name: 'Acknowledge' })
      expect(remainingButtons.length).toBe(acknowledgeButtons.length - 1)
    })
  })

  it('displays bottleneck detection section', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Bottleneck Detection')).toBeInTheDocument()
    })
    
    // Should show bottleneck areas
    expect(screen.getByText('Screen Printing')).toBeInTheDocument()
    expect(screen.getByText('Quality Check')).toBeInTheDocument()
  })

  it('shows severity badges for bottlenecks', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Bottleneck Detection')).toBeInTheDocument()
    })
    
    // Should show severity levels
    expect(screen.getByText('high severity')).toBeInTheDocument()
    expect(screen.getByText('medium severity')).toBeInTheDocument()
  })

  it('displays staff overview section', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Staff Overview')).toBeInTheDocument()
    })
    
    // Should show staff members
    expect(screen.getByText('Sarah J.')).toBeInTheDocument()
    expect(screen.getByText('John S.')).toBeInTheDocument()
  })

  it('shows staff status indicators', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Staff Overview')).toBeInTheDocument()
    })
    
    // Should show status badges
    expect(screen.getAllByText('working').length).toBeGreaterThan(0)
    expect(screen.getByText('break')).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('shows quick stats cards', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument()
    })
    
    // Should show stats
    expect(screen.getByText('Active Staff')).toBeInTheDocument()
    expect(screen.getByText('Team Efficiency')).toBeInTheDocument()
    expect(screen.getByText('Jobs Today')).toBeInTheDocument()
    expect(screen.getByText('On Schedule')).toBeInTheDocument()
  })

  it('displays quick action buttons', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument()
    })
    
    // Should show action buttons
    expect(screen.getByRole('button', { name: /View Queue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Team Metrics/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reports/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Time Clock/i })).toBeInTheDocument()
  })

  it('navigates when quick action clicked', async () => {
    render(<SupervisorDashboard onNavigate={mockOnNavigate} />)
    
    await waitFor(() => {
      expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument()
    })
    
    const queueButton = screen.getByRole('button', { name: /View Queue/i })
    await userEvent.click(queueButton)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('queue')
  })

  it('navigates to team metrics', async () => {
    render(<SupervisorDashboard onNavigate={mockOnNavigate} />)
    
    await waitFor(() => {
      expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument()
    })
    
    const metricsButton = screen.getByRole('button', { name: /Team Metrics/i })
    await userEvent.click(metricsButton)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('team-metrics')
  })

  it('shows offline staff count', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Staff Overview')).toBeInTheDocument()
    })
    
    // Should indicate offline staff
    expect(screen.getByText(/staff member\(s\) offline/)).toBeInTheDocument()
  })

  it('shows recommendations for bottlenecks', async () => {
    render(<SupervisorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Bottleneck Detection')).toBeInTheDocument()
    })
    
    // Should show recommendations
    expect(screen.getByText(/Consider reallocating staff/)).toBeInTheDocument()
    expect(screen.getByText(/Assign additional QC reviewer/)).toBeInTheDocument()
  })
})
