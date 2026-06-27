import React, { useState } from "react";
import type { PurchaseOrderDetail, POStatus } from "../../types/purchaseOrder";
import { purchaseOrderService } from "../../services/purchaseOrderServices";
import { useUser } from "../../context/Context";
import { X, Clock, Calendar, FileText, Download, Mail } from "lucide-react";

interface PurchaseOrderDetailModalProps {
  po: PurchaseOrderDetail;
  onClose: () => void;
  onTransition: (status: POStatus) => Promise<void>;
}

const STATUS_STYLES: Record<POStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const NEXT_ACTIONS: Record<
  POStatus,
  { label: string; status: POStatus; style: string }[]
> = {
  DRAFT: [
    {
      label: "Send to Supplier",
      status: "SENT",
      style: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      label: "Cancel",
      status: "CANCELLED",
      style: "bg-red-600 hover:bg-red-700",
    },
  ],
  SENT: [
    {
      label: "Mark Confirmed",
      status: "CONFIRMED",
      style: "bg-amber-600 hover:bg-amber-700",
    },
    {
      label: "Cancel",
      status: "CANCELLED",
      style: "bg-red-600 hover:bg-red-700",
    },
  ],
  CONFIRMED: [
    {
      label: "Mark Delivered",
      status: "DELIVERED",
      style: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Cancel",
      status: "CANCELLED",
      style: "bg-red-600 hover:bg-red-700",
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
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSending, setEmailSending] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Purchase Order #{po.id}
            </h2>
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[po.status]}`}
            >
              {po.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Supplier</div>
              <div className="font-medium text-gray-900">
                {po.supplier_name}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Lead Time</div>
              <div className="inline-flex items-center gap-1 font-medium text-gray-900">
                <Clock size={14} className="text-gray-400" />
                {po.lead_time_days} days
              </div>
            </div>
            <div>
              <div className="text-gray-500">Order Date</div>
              <div className="inline-flex items-center gap-1 font-medium text-gray-900">
                <Calendar size={14} className="text-gray-400" />
                {new Date(po.order_date).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Expected Delivery</div>
              <div className="inline-flex items-center gap-1 font-medium text-gray-900">
                <Calendar size={14} className="text-gray-400" />
                {po.expected_delivery_date
                  ? new Date(po.expected_delivery_date).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>

          {po.notes && (
            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              <div className="mb-1 inline-flex items-center gap-1 font-medium text-gray-500">
                <FileText size={14} /> Notes
              </div>
              <p>{po.notes}</p>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              Line Items
            </h3>
            <div className="overflow-hidden rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">
                      Product
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">
                      Unit Cost
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {po.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900">
                          {item.product_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.variant_name} • {item.sku}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-700">
                        ${Number(item.unit_cost).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        ${Number(item.total_cost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex justify-end text-sm font-semibold text-gray-900">
              Total: ${Number(po.total_cost).toFixed(2)}
            </div>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="sticky bottom-0 flex justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} />
              Download PDF
            </button>

            {!showEmailInput ? (
              <button
                onClick={() => setShowEmailInput(true)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Mail size={16} />
                Email to Supplier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter supplier email..."
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleEmail}
                  disabled={emailSending || !emailInput}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {emailSending ? "Sending..." : "Send"}
                </button>
                <button
                  onClick={() => setShowEmailInput(false)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="flex gap-3">
              {actions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => onTransition(action.status)}
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white ${action.style}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {actions.length === 0 && (
          <div className="sticky bottom-0 flex justify-start border-t border-gray-200 bg-white px-6 py-4">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} />
              Download PDF
            </button>

            {!showEmailInput ? (
              <button
                onClick={() => setShowEmailInput(true)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Mail size={16} />
                Email to Supplier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter supplier email..."
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleEmail}
                  disabled={emailSending || !emailInput}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {emailSending ? "Sending..." : "Send"}
                </button>
                <button
                  onClick={() => setShowEmailInput(false)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderDetailModal;
