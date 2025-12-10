import { useState, useEffect } from 'react';
import { Check, X, FileText, Clock, DollarSign, CreditCard, Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface QuoteLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteData {
  quoteNumber: string;
  customer: {
    name: string;
    email: string;
    company?: string;
  };
  status: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  depositRequired: boolean;
  depositPercent: number;
  depositAmount: number;
  expiresAt: string;
  terms?: string;
  customerNotes?: string;
  mockupUrls?: string[];
  attachments?: Array<{ name: string; url: string }>;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

export default function QuoteApprovalPage() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approverName, setApproverName] = useState('');
  const [signature, setSignature] = useState('');
  const [expandedItems, setExpandedItems] = useState<boolean[]>([]);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);

  // Get token from URL
  const token = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('token') 
    : null;

  useEffect(() => {
    const fetchQuote = async () => {
      if (!token) {
        setError('Invalid quote link. Please check the URL and try again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/quotes/approve/${token}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Failed to load quote');
        }

        const data = await response.json();
        setQuote(data.data);
        setExpandedItems(new Array(data.data.lineItems?.length || 0).fill(false));
      } catch (err: any) {
        setError(err.message || 'Failed to load quote');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [token]);

  const handleApprove = async () => {
    if (!approverName.trim()) {
      alert('Please enter your name to approve this quote.');
      return;
    }

    setIsApproving(true);
    try {
      const response = await fetch(`${API_BASE}/api/quotes/approve/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: approverName,
          signature: signature,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to approve quote');
      }

      setApproved(true);
      setShowPaymentOptions(true);
    } catch (err: any) {
      alert(err.message || 'Failed to approve quote');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const response = await fetch(`${API_BASE}/api/quotes/reject/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectReason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to reject quote');
      }

      setRejected(true);
      setShowRejectModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to reject quote');
    } finally {
      setIsRejecting(false);
    }
  };

  const handlePayDeposit = () => {
    // Redirect to Stripe checkout for deposit
    window.location.href = `${API_BASE}/api/payments/checkout?orderId=${quote?.quoteNumber}&type=deposit`;
  };

  const handlePayFull = () => {
    // Redirect to Stripe checkout for full payment
    window.location.href = `${API_BASE}/api/payments/checkout?orderId=${quote?.quoteNumber}&type=full`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const toggleItem = (index: number) => {
    setExpandedItems(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const isExpired = quote?.expiresAt && new Date(quote.expiresAt) < new Date();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Quote Declined</h1>
          <p className="text-gray-600 mb-4">
            Quote #{quote?.quoteNumber} has been declined.
          </p>
          <p className="text-sm text-gray-500">
            If you change your mind or have questions, please contact us.
          </p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Quote #{quote.quoteNumber}</h1>
              <p className="text-indigo-100 mt-1">
                {quote.customer.company || quote.customer.name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatCurrency(quote.total)}</div>
              {quote.depositRequired && (
                <div className="text-indigo-100 text-sm mt-1">
                  {quote.depositPercent}% deposit: {formatCurrency(quote.depositAmount)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {isExpired && !approved && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-amber-600 mr-2" />
              <p className="text-amber-800 font-medium">
                This quote expired on {formatDate(quote.expiresAt)}. Please contact us for an updated quote.
              </p>
            </div>
          </div>
        )}

        {approved && showPaymentOptions && (
          <div className="bg-green-50 border-l-4 border-green-400 p-6">
            <div className="flex items-start">
              <Check className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-green-800 font-bold text-lg mb-2">Quote Approved!</h3>
                <p className="text-green-700 mb-4">
                  Thank you for approving this quote. Please select a payment option to get started.
                </p>
                <div className="flex flex-wrap gap-4">
                  {quote.depositRequired && (
                    <button
                      onClick={handlePayDeposit}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay Deposit ({formatCurrency(quote.depositAmount)})
                    </button>
                  )}
                  <button
                    onClick={handlePayFull}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay Full Amount ({formatCurrency(quote.total)})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Details */}
        <div className="bg-white shadow-lg rounded-b-xl overflow-hidden">
          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <span className="text-sm text-gray-500">Created</span>
              <p className="font-medium">{formatDate(quote.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Valid Until</span>
              <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                {formatDate(quote.expiresAt)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Prepared For</span>
              <p className="font-medium">{quote.customer.name}</p>
              <p className="text-sm text-gray-500">{quote.customer.email}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              Quote Details
            </h2>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-24">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-32">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(quote.lineItems || []).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => item.description && toggleItem(index)}
                        >
                          {item.description && (
                            expandedItems[index] 
                              ? <ChevronUp className="w-4 h-4 mr-2 text-gray-400" />
                              : <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                          )}
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        {item.description && expandedItems[index] && (
                          <p className="mt-2 text-sm text-gray-500 pl-6">{item.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-4 text-right text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="bg-gray-50 px-4 py-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(quote.subtotal)}</span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount 
                        {quote.discountType === 'percentage' && ` (${quote.discount}%)`}
                      </span>
                      <span>-{formatCurrency(
                        quote.discountType === 'percentage' 
                          ? quote.subtotal * (quote.discount / 100)
                          : quote.discount
                      )}</span>
                    </div>
                  )}
                  {quote.taxAmount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax ({quote.taxRate}%)</span>
                      <span>{formatCurrency(quote.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total</span>
                    <span>{formatCurrency(quote.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mockups */}
          {quote.mockupUrls && quote.mockupUrls.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="font-medium text-gray-900 mb-3">Design Mockups</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quote.mockupUrls.map((url, index) => (
                  <a 
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                  >
                    <img 
                      src={url} 
                      alt={`Mockup ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {quote.attachments && quote.attachments.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="font-medium text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {quote.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-700">{file.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Terms */}
          {quote.terms && (
            <div className="px-6 pb-6">
              <h3 className="font-medium text-gray-900 mb-3">Terms & Conditions</h3>
              <div 
                className="text-sm text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: quote.terms }}
              />
            </div>
          )}

          {/* Approval Section */}
          {!approved && !rejected && !isExpired && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Approve This Quote</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Signature (optional)
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Type your signature"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-script"
                    style={{ fontFamily: 'cursive' }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleApprove}
                  disabled={isApproving || !approverName.trim()}
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isApproving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 mr-2" />
                  )}
                  Approve Quote
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isApproving}
                  className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 mr-2" />
                  Decline Quote
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                By approving, you agree to the terms and conditions above.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Questions about this quote? Contact us at support@printshop.com</p>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Decline Quote</h3>
            <p className="text-gray-600 mb-4">
              We're sorry to hear that. Could you let us know why you're declining this quote?
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                {isRejecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Decline Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
