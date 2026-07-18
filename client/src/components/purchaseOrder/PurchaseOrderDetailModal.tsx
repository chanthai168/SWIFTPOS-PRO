import React, { useState, useEffect } from "react";
import type { PurchaseOrderDetail, POStatus } from "../../types/purchaseOrder";
import { purchaseOrderService } from "../../services/purchaseOrderServices";
import { useUser } from "../../context/Context";
import { 
  X, 
  Clock, 
  Calendar, 
  FileText, 
  Download, 
  Mail,
  Building2,
  Package,
  DollarSign,
  Truck,
  CheckCircle,
  AlertCircle,
  Send,
  Printer
} from "lucide-react";

interface PurchaseOrderDetailModalProps {
  po: PurchaseOrderDetail;
  onClose: () => void;
  onTransition: (status: POStatus) => Promise<void>;
}

const STATUS_CONFIG: Record<POStatus, { 
  label: string; 
  bg: string; 
  text: string; 
  icon: React.ReactNode;
  border: string;
}> = {
  DRAFT: {
    label: "Draft",
    bg: "bg-gray-50",
    text: "text-gray-700",
    icon: <FileText className="w-4 h-4" />,
    border: "border-gray-200"
  },
  SENT: {
    label: "Sent",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: <Send className="w-4 h-4" />,
    border: "border-blue-200"
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: <CheckCircle className="w-4 h-4" />,
    border: "border-amber-200"
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-green-50",
    text: "text-green-700",
    icon: <Truck className="w-4 h-4" />,
    border: "border-green-200"
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: <AlertCircle className="w-4 h-4" />,
    border: "border-red-200"
  },
};

const NEXT_ACTIONS: Record<
  POStatus,
  { label: string; status: POStatus; variant: "primary" | "danger" | "success" }[]
  > = {
  DRAFT: [
    {
      label: "Send to Supplier",
      status: "SENT",
      variant: "primary",
    },
    {
      label: "Cancel Order",
      status: "CANCELLED",
      variant: "danger",
    },
  ],
  SENT: [
    {
      label: "Confirm Order",
      status: "CONFIRMED",
      variant: "primary",
    },
    {
      label: "Cancel Order",
      status: "CANCELLED",
      variant: "danger",
    },
  ],
  CONFIRMED: [
    {
      label: "Mark as Delivered",
      status: "DELIVERED",
      variant: "success",
    },
    {
      label: "Cancel Order",
      status: "CANCELLED",
      variant: "danger",
    },
  ],
  DELIVERED: [],
  CANCELLED: [],
};

const PurchaseOrderDetailModal: React.FC<PurchaseOrderDetailModalProps> = ({
  po,
  onClose,
  onTransition,
}) => {
  const { shop } = useUser();
  const actions = NEXT_ACTIONS[po.status] ?? [];
  const statusConfig = STATUS_CONFIG[po.status];
  
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleTransition = async (status: POStatus) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    try {
      setIsClosing(true);
      setIsVisible(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      await onTransition(status);

      if(actions[0].label = 'Send to Supplier'){
        alert('sented')
        

      }

    } catch (error) {
      console.error("Transition failed:", error);
      setIsTransitioning(false);
      setIsClosing(false);
      setIsVisible(true);
    }
  };

  const handleDownloadPdf = async () => {
    if (!shop?.id) return;
    try {
      const response = await purchaseOrderService.downloadPdf(shop.id, po.id);
      const url = window.URL.createObjectURL(
        new Blob([response], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PO-${po.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF", error);
    }
  };

  const handleEmail = async () => {
    if (!shop?.id || !emailInput) return;
    setEmailSending(true);
    try {
      await purchaseOrderService.emailToSupplier(shop.id, po.id, emailInput);
      alert(`Email sent to ${emailInput} successfully!`);
      setShowEmailInput(false);
      setEmailInput("");
    } catch (error) {
      alert("Failed to send email. Check your SMTP settings in server/.env");
      console.error(error);
    } finally {
      setEmailSending(false);
    }
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-primary hover:bg-primary/90 text-white shadow-sm shadow-indigo-200";
      case "danger":
        return "bg-gray-200  text-red-500 hover:bg-gray-300  ";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200";
      default:
        return "bg-gray-600 hover:bg-gray-700 text-white";
    }
  };

  if (isClosing && !isVisible) {
    return null;
  }
console.log(po);
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isVisible && !isClosing
          ? "opacity-100 bg-black/40 backdrop-blur-sm"
          : "opacity-0 bg-black/0 backdrop-blur-none pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] bg-white   rounded-4xl p-2 border-white border shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
          isVisible && !isClosing
            ? "opacity-80 scale-100 translate-y-0"
            : "opacity-0 scale-80 -translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-gray-200 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  Purchase Order #{po.id}
                </h2>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Created {new Date(po.order_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isTransitioning}
              className="flex-shrink-0 ml-4 p-2 rounded-full bg-gray-200 text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6 space-y-6">
          {/* Supplier Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-100 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Building2 className="w-4 h-4" />
                Supplier
              </div>
              <p className="text-base font-semibold text-gray-900">{po.supplier_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Clock className="w-4 h-4" />
                  Lead Time
                </div>
                <p className="text-base font-semibold text-gray-900">{po.lead_time_days} days</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Expected Delivery
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {po.expected_delivery_date
                    ? new Date(po.expected_delivery_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {po.notes && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <FileText className="w-4 h-4" />
                Notes
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{po.notes}</p>
            </div>
          )}

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Line Items
              </h3>
              <span className="text-sm text-gray-500">
                {po.items.length} items
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Cost
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {po.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm">
                            {item.product_name}
                          </div>
                          <div className="text-xs text-gray-500 space-x-2">
                            <span>{item.variant_name}</span>
                            <span>•</span>
                            <span className="font-mono">{item.sku}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          ${Number(item.unit_cost).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          ${Number(item.total_cost).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Total */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-end gap-8">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    Total Amount
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${Number(po.total_cost).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isTransitioning}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              
              <button
                onClick={() => setShowEmailInput(!showEmailInput)}
                disabled={isTransitioning}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>

              <button
                onClick={() => window.print()}
                disabled={isTransitioning}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>

            {showEmailInput && (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="supplier@example.com"
                  className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={handleEmail}
                  disabled={emailSending || !emailInput || isTransitioning}
                  className="px-4 py-2 text-sm font-medium rounded-full text-white bg-primary transition-colors disabled:opacity-50"
                >
                  {emailSending ? "Sending..." : "Send"}
                </button>
                <button
                  onClick={() => setShowEmailInput(false)}
                  disabled={isTransitioning}
                  className="px-4 py-2 text-sm font-medium bg-gray-200  text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}

            {actions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {actions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => handleTransition(action.status)}
                    disabled={isTransitioning}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${getVariantStyles(action.variant)} disabled:opacity-50`}
                  >
                    {isTransitioning ? "Processing..." : action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailModal;