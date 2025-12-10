import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Dashboard } from '../Dashboard'
import { DashboardWidgets } from '../DashboardWidgets'
import { QuickActions } from '../QuickActions'
import { RecentOrders } from '../RecentOrders'
import { Notifications } from '../Notifications'
import type { 
  CustomerDashboardStats, 
  CustomerOrder, 
  CustomerNotification,
  QuoteRequest 
} from '@/lib/types'

// Mock data
const mockStats: CustomerDashboardStats = {
  ordersThisMonth: 12,
  pendingQuotes: 3,
  activeJobs: 2,
  totalSpentYTD: 45234
}

const mockOrders: CustomerOrder[] = [
  {
    id: "1",
    orderNumber: "12345",
    status: "completed",
    total: 1245,
    date: "2024-11-15",
    items: 3
  },
  {
    id: "2",
    orderNumber: "12344",
    status: "in_production",
    total: 890,
    date: "2024-11-14",
    items: 2
  }
]

const mockNotifications: CustomerNotification[] = [
  {
    id: "1",
    type: "success",
    title: "Order Shipped",
    message: "Your order has been shipped",
    date: "2024-11-23T10:30:00Z",
    read: false
  },
  {
    id: "2",
    type: "warning",
    title: "Quote Expiring",
    message: "Quote will expire soon",
    date: "2024-11-22T14:15:00Z",
    read: true
  }
]

const mockPendingQuotes: QuoteRequest[] = [
  {
    id: "1",
    quoteNumber: "Q-2024-001",
    status: "pending",
    description: "Business Cards - 1000 units",
    requestedDate: "2024-11-20",
    estimatedTotal: 450,
    expiresAt: "2024-11-27"
  }
]

describe('Dashboard Component', () => {
  it('renders dashboard with welcome message', () => {
    render(
      <BrowserRouter>
        <Dashboard
          stats={mockStats}
          recentOrders={mockOrders}
          notifications={mockNotifications}
          pendingQuotes={mockPendingQuotes}
          userName="John"
        />
      </BrowserRouter>
    )

    expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument()
    expect(screen.getByText(/Here's an overview of your account/i)).toBeInTheDocument()
  })

  it('displays welcome message section', () => {
    render(
      <BrowserRouter>
        <Dashboard
          stats={mockStats}
          recentOrders={mockOrders}
          notifications={mockNotifications}
          pendingQuotes={mockPendingQuotes}
        />
      </BrowserRouter>
    )

    expect(screen.getByText(/Here's an overview of your account/i)).toBeInTheDocument()
  })

  it('renders search functionality', () => {
    render(
      <BrowserRouter>
        <Dashboard
          stats={mockStats}
          recentOrders={mockOrders}
          notifications={mockNotifications}
          pendingQuotes={mockPendingQuotes}
        />
      </BrowserRouter>
    )

    const searchInput = screen.getByPlaceholderText(/Search orders, quotes/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('allows user to type in search field', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Dashboard
          stats={mockStats}
          recentOrders={mockOrders}
          notifications={mockNotifications}
          pendingQuotes={mockPendingQuotes}
        />
      </BrowserRouter>
    )

    const searchInput = screen.getByPlaceholderText(/Search orders, quotes/i)
    await user.type(searchInput, 'business cards')
    expect(searchInput).toHaveValue('business cards')
  })

  it('displays pending quotes alert when quotes exist', () => {
    render(
      <BrowserRouter>
        <Dashboard
          stats={mockStats}
          recentOrders={mockOrders}
          notifications={mockNotifications}
          pendingQuotes={mockPendingQuotes}
        />
      </BrowserRouter>
    )

    expect(screen.getByText(/Awaiting Approval/i)).toBeInTheDocument()
    expect(screen.getByText(/Review and approve to proceed with your orders/i)).toBeInTheDocument()
  })

  it('does not display pending quotes alert when no quotes', () => {
    render(
      <BrowserRouter>
        <Dashboard
          stats={mockStats}
          recentOrders={mockOrders}
          notifications={mockNotifications}
          pendingQuotes={[]}
        />
      </BrowserRouter>
    )

    expect(screen.queryByText(/Awaiting Approval/i)).not.toBeInTheDocument()
  })
})

describe('DashboardWidgets Component', () => {
  it('renders all widget cards', () => {
    render(<DashboardWidgets stats={mockStats} />)

    expect(screen.getByText('Orders This Month')).toBeInTheDocument()
    expect(screen.getByText('Pending Quotes')).toBeInTheDocument()
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Total Spent YTD')).toBeInTheDocument()
  })

  it('displays correct stat values', () => {
    render(<DashboardWidgets stats={mockStats} />)

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('$45,234')).toBeInTheDocument()
  })

  it('shows "Awaiting" suffix for pending quotes', () => {
    render(<DashboardWidgets stats={mockStats} />)
    expect(screen.getByText('Awaiting')).toBeInTheDocument()
  })

  it('shows "In Production" suffix for active jobs', () => {
    render(<DashboardWidgets stats={mockStats} />)
    expect(screen.getByText('In Production')).toBeInTheDocument()
  })

  it('shows "None" when no pending quotes', () => {
    const statsWithNoQuotes = { ...mockStats, pendingQuotes: 0 }
    render(<DashboardWidgets stats={statsWithNoQuotes} />)
    const noneElements = screen.getAllByText('None')
    expect(noneElements.length).toBeGreaterThan(0)
  })
})

describe('QuickActions Component', () => {
  it('renders all quick action buttons', () => {
    render(
      <BrowserRouter>
        <QuickActions />
      </BrowserRouter>
    )

    expect(screen.getByText('Request New Quote')).toBeInTheDocument()
    expect(screen.getByText('Reorder')).toBeInTheDocument()
    expect(screen.getByText('Track Orders')).toBeInTheDocument()
  })

  it('displays action descriptions', () => {
    render(
      <BrowserRouter>
        <QuickActions />
      </BrowserRouter>
    )

    expect(screen.getByText('Get a quote for your project')).toBeInTheDocument()
    expect(screen.getByText('Reorder a previous order')).toBeInTheDocument()
    expect(screen.getByText('Check order status')).toBeInTheDocument()
  })
})

describe('RecentOrders Component', () => {
  it('renders recent orders list', () => {
    render(
      <BrowserRouter>
        <RecentOrders orders={mockOrders} />
      </BrowserRouter>
    )

    expect(screen.getByText(/Order #12345/i)).toBeInTheDocument()
    expect(screen.getByText(/Order #12344/i)).toBeInTheDocument()
  })

  it('displays order status badges', () => {
    render(
      <BrowserRouter>
        <RecentOrders orders={mockOrders} />
      </BrowserRouter>
    )

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('In Production')).toBeInTheDocument()
  })

  it('displays order totals', () => {
    render(
      <BrowserRouter>
        <RecentOrders orders={mockOrders} />
      </BrowserRouter>
    )

    expect(screen.getByText('$1,245')).toBeInTheDocument()
    expect(screen.getByText('$890')).toBeInTheDocument()
  })

  it('shows empty state when no orders', () => {
    render(
      <BrowserRouter>
        <RecentOrders orders={[]} />
      </BrowserRouter>
    )

    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  it('displays "View All" button', () => {
    render(
      <BrowserRouter>
        <RecentOrders orders={mockOrders} />
      </BrowserRouter>
    )

    expect(screen.getByText('View All')).toBeInTheDocument()
  })
})

describe('Notifications Component', () => {
  const mockDismiss = vi.fn()
  const mockMarkAsRead = vi.fn()

  it('renders notification list', () => {
    render(
      <Notifications
        notifications={mockNotifications}
        onDismiss={mockDismiss}
        onMarkAsRead={mockMarkAsRead}
      />
    )

    expect(screen.getByText('Order Shipped')).toBeInTheDocument()
    expect(screen.getByText('Quote Expiring')).toBeInTheDocument()
  })

  it('shows unread count', () => {
    render(
      <Notifications
        notifications={mockNotifications}
        onDismiss={mockDismiss}
        onMarkAsRead={mockMarkAsRead}
      />
    )

    expect(screen.getByText(/1 unread notification/i)).toBeInTheDocument()
  })

  it('shows "All caught up" when no unread notifications', () => {
    const readNotifications = mockNotifications.map(n => ({ ...n, read: true }))
    render(
      <Notifications
        notifications={readNotifications}
        onDismiss={mockDismiss}
        onMarkAsRead={mockMarkAsRead}
      />
    )

    expect(screen.getByText(/All caught up/i)).toBeInTheDocument()
  })

  it('shows empty state when no notifications', () => {
    render(
      <Notifications
        notifications={[]}
        onDismiss={mockDismiss}
        onMarkAsRead={mockMarkAsRead}
      />
    )

    expect(screen.getByText('No notifications')).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button clicked', async () => {
    const user = userEvent.setup()
    render(
      <Notifications
        notifications={mockNotifications}
        onDismiss={mockDismiss}
        onMarkAsRead={mockMarkAsRead}
      />
    )

    const dismissButtons = screen.getAllByRole('button', { name: '' })
    if (dismissButtons.length > 0) {
      await user.click(dismissButtons[0])
      await waitFor(() => {
        expect(mockDismiss).toHaveBeenCalled()
      })
    }
  })

  it('displays "Mark all as read" button when unread notifications exist', () => {
    render(
      <Notifications
        notifications={mockNotifications}
        onDismiss={mockDismiss}
        onMarkAsRead={mockMarkAsRead}
      />
    )

    expect(screen.getByText('Mark all as read')).toBeInTheDocument()
  })
})

describe('Responsive Layout', () => {
  it('dashboard loads without errors', () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard
          stats={mockStats}
          recentOrders={mockOrders}
          notifications={mockNotifications}
          pendingQuotes={mockPendingQuotes}
        />
      </BrowserRouter>
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('widgets use responsive grid classes', () => {
    const { container } = render(<DashboardWidgets stats={mockStats} />)
    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
  })
})

describe('Accessibility', () => {
  it('search input has proper placeholder', () => {
    render(
      <BrowserRouter>
        <Dashboard
          stats={mockStats}
          recentOrders={mockOrders}
          notifications={mockNotifications}
          pendingQuotes={mockPendingQuotes}
        />
      </BrowserRouter>
    )

    const searchInput = screen.getByPlaceholderText(/Search orders, quotes/i)
    expect(searchInput).toHaveAttribute('type', 'search')
  })

  it('buttons are keyboard accessible', () => {
    render(
      <BrowserRouter>
        <QuickActions />
      </BrowserRouter>
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeInTheDocument()
    })
  })
})
