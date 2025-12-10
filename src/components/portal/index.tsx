/**
 * Support Ticket Portal Components
 * 
 * This module exports the main components for the customer support ticketing system.
 * 
 * Usage Example:
 * 
 * ```tsx
 * import { SupportTickets, CreateTicket, TicketDetail } from '@/components/portal'
 * 
 * function SupportPortal() {
 *   const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
 *   const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
 * 
 *   // Fetch tickets from API
 *   const { data: tickets } = useQuery({
 *     queryKey: ['tickets'],
 *     queryFn: () => fetch('/api/customer/tickets').then(res => res.json())
 *   })
 * 
 *   const handleCreateTicket = async (ticketData) => {
 *     const formData = new FormData()
 *     formData.append('customerId', currentUser.id)
 *     formData.append('category', ticketData.category)
 *     formData.append('priority', ticketData.priority)
 *     formData.append('subject', ticketData.subject)
 *     formData.append('description', ticketData.description)
 *     if (ticketData.orderNumber) {
 *       formData.append('orderNumber', ticketData.orderNumber)
 *     }
 *     
 *     ticketData.attachments.forEach((file, index) => {
 *       formData.append('files', file)
 *     })
 * 
 *     await fetch('/api/customer/tickets', {
 *       method: 'POST',
 *       body: formData,
 *     })
 * 
 *     setView('list')
 *   }
 * 
 *   if (view === 'create') {
 *     return (
 *       <CreateTicket
 *         onSubmit={handleCreateTicket}
 *         onCancel={() => setView('list')}
 *       />
 *     )
 *   }
 * 
 *   if (view === 'detail' && selectedTicket) {
 *     const ticket = tickets.find(t => t.id === selectedTicket)
 *     return (
 *       <TicketDetail
 *         ticket={ticket}
 *         onBack={() => setView('list')}
 *         onAddComment={async (message, attachments) => {
 *           await fetch(`/api/customer/tickets/${selectedTicket}/comments`, {
 *             method: 'POST',
 *             body: JSON.stringify({
 *               userId: currentUser.id,
 *               userType: 'customer',
 *               message,
 *             }),
 *           })
 *         }}
 *       />
 *     )
 *   }
 * 
 *   return (
 *     <SupportTickets
 *       tickets={tickets}
 *       onCreateTicket={() => setView('create')}
 *       onViewTicket={(id) => {
 *         setSelectedTicket(id)
 *         setView('detail')
 *       }}
 *     />
 *   )
 * }
 * ```
 */

export { SupportTickets } from './SupportTickets'
export { CreateTicket } from './CreateTicket'
export { TicketDetail } from './TicketDetail'
export { TicketFilters } from './TicketFilters'
