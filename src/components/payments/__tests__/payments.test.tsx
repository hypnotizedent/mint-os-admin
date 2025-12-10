import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecordPaymentDialog } from '../RecordPaymentDialog'

// Mock the API module
vi.mock('@/lib/api/payments', () => ({
  recordPayment: vi.fn().mockResolvedValue({ 
    success: true, 
    payment: { id: '1', documentId: 'pay-1', amount: 100, status: 'paid', paymentMethod: 'cash', createdAt: new Date().toISOString() },
    newAmountPaid: 100,
    newAmountOutstanding: 400
  }),
  getPayments: vi.fn().mockResolvedValue([]),
  getPaymentsSummary: vi.fn().mockResolvedValue({
    totalOutstanding: 0,
    paymentsThisWeek: 0,
    paymentsThisMonth: 0,
    overdueCount: 0,
    outstandingOrders: [],
  }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('RecordPaymentDialog', () => {
  const mockOnPaymentRecorded = vi.fn()
  const mockOnOpenChange = vi.fn()
  
  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    orderDocumentId: 'test-order-123',
    orderNumber: '12345',
    amountOutstanding: 500.00,
    onPaymentRecorded: mockOnPaymentRecorded,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct outstanding balance', () => {
    render(<RecordPaymentDialog {...defaultProps} />)
    
    // Check for dialog title using role
    expect(screen.getByRole('heading', { name: /Record Payment/i })).toBeInTheDocument()
    expect(screen.getByText('$500.00')).toBeInTheDocument()
  })

  it('prefills amount with outstanding balance', () => {
    render(<RecordPaymentDialog {...defaultProps} />)
    
    const amountInput = screen.getByLabelText(/payment amount/i)
    expect(amountInput).toHaveValue(500)
  })

  it('renders payment date field with today as default', () => {
    render(<RecordPaymentDialog {...defaultProps} />)
    
    const dateInput = screen.getByLabelText(/payment date/i)
    expect(dateInput).toBeInTheDocument()
    expect(dateInput).toHaveValue(new Date().toISOString().split('T')[0])
  })

  it('renders notes field', () => {
    render(<RecordPaymentDialog {...defaultProps} />)
    
    const notesField = screen.getByLabelText(/notes/i)
    expect(notesField).toBeInTheDocument()
  })

  it('validates amount cannot exceed outstanding balance', async () => {
    const user = userEvent.setup()
    render(<RecordPaymentDialog {...defaultProps} />)
    
    const amountInput = screen.getByLabelText(/payment amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '600')
    
    const submitButton = screen.getByRole('button', { name: /record payment/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/cannot exceed outstanding balance/i)).toBeInTheDocument()
  })

  it('validates amount must be greater than 0', async () => {
    const user = userEvent.setup()
    render(<RecordPaymentDialog {...defaultProps} />)
    
    const amountInput = screen.getByLabelText(/payment amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '0')
    
    const submitButton = screen.getByRole('button', { name: /record payment/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/valid amount greater than 0/i)).toBeInTheDocument()
  })

  it('shows cancel button', () => {
    render(<RecordPaymentDialog {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls onOpenChange when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<RecordPaymentDialog {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})

