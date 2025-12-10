/**
 * Invoice Utilities
 * Shared functions for invoice rendering and printing
 */

import type { Invoice } from './invoices';

/**
 * Generate printable HTML invoice content
 */
export function generatePrintableInvoice(invoice: Invoice): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company { font-size: 28px; font-weight: bold; color: #2563eb; }
    .company-info { font-size: 12px; color: #666; margin-top: 5px; }
    .invoice-title { font-size: 32px; color: #666; text-transform: uppercase; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .status.paid { background: #dcfce7; color: #166534; }
    .status.pending { background: #fef9c3; color: #854d0e; }
    .status.overdue { background: #fee2e2; color: #991b1b; }
    .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .bill-to, .invoice-info { width: 45%; }
    .section-title { font-weight: bold; margin-bottom: 10px; color: #333; font-size: 14px; }
    .info-row { font-size: 13px; margin-bottom: 4px; }
    .info-label { color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 13px; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
    .total-row.final { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">PRINTSHOP OS</div>
      <div class="company-info">
        Your Print Shop Name<br>
        123 Main St<br>
        City, ST 12345<br>
        (555) 123-4567
      </div>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">INVOICE</div>
      <div class="status ${invoice.status.toLowerCase()}">${invoice.status}</div>
    </div>
  </div>
  
  <div class="details">
    <div class="bill-to">
      <div class="section-title">Bill To:</div>
      <div style="font-weight: 500; margin-bottom: 4px;">${invoice.customerName}</div>
      <div class="info-row">${invoice.customerEmail}</div>
      ${invoice.customerAddress ? `
        <div class="info-row">${invoice.customerAddress.street}</div>
        ${invoice.customerAddress.street2 ? `<div class="info-row">${invoice.customerAddress.street2}</div>` : ''}
        <div class="info-row">${invoice.customerAddress.city}, ${invoice.customerAddress.state} ${invoice.customerAddress.zip}</div>
      ` : ''}
    </div>
    <div class="invoice-info" style="text-align: right;">
      <div class="info-row"><span class="info-label">Invoice #:</span> <strong>${invoice.invoiceNumber}</strong></div>
      <div class="info-row"><span class="info-label">Order #:</span> <strong>${invoice.orderNumber}</strong></div>
      <div class="info-row"><span class="info-label">Date:</span> ${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
      <div class="info-row"><span class="info-label">Due Date:</span> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-center" style="width: 80px;">Qty</th>
        <th class="text-right" style="width: 100px;">Unit Price</th>
        <th class="text-right" style="width: 100px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.lineItems.length > 0 
        ? invoice.lineItems.map(item => `
          <tr>
            <td>${item.description}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
            <td class="text-right">$${item.total.toFixed(2)}</td>
          </tr>
        `).join('')
        : `<tr><td colspan="4" style="text-align: center; color: #666; padding: 30px;">Order total: $${invoice.total.toFixed(2)}</td></tr>`
      }
    </tbody>
  </table>
  
  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>$${invoice.subtotal.toFixed(2)}</span>
    </div>
    ${invoice.discount > 0 ? `
      <div class="total-row" style="color: #166534;">
        <span>Discount:</span>
        <span>-$${invoice.discount.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="total-row">
      <span>Tax:</span>
      <span>$${invoice.tax.toFixed(2)}</span>
    </div>
    ${invoice.shipping > 0 ? `
      <div class="total-row">
        <span>Shipping:</span>
        <span>$${invoice.shipping.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="total-row final">
      <span>Total:</span>
      <span>$${invoice.total.toFixed(2)}</span>
    </div>
    ${invoice.amountPaid > 0 ? `
      <div class="total-row" style="color: #166534;">
        <span>Amount Paid:</span>
        <span>-$${invoice.amountPaid.toFixed(2)}</span>
      </div>
      <div class="total-row final">
        <span>Balance Due:</span>
        <span style="color: ${invoice.balance > 0 ? '#ea580c' : '#166534'};">$${invoice.balance.toFixed(2)}</span>
      </div>
    ` : ''}
  </div>
  
  <div class="footer">
    <p><strong>Payment Terms:</strong> Net 30</p>
    <p style="margin-top: 20px;">Thank you for your business!</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Open a print window with invoice content
 */
export function printInvoice(invoice: Invoice): void {
  const content = generatePrintableInvoice(invoice);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
}
