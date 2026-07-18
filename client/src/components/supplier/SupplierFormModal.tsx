    import React, { useEffect, useState } from 'react';
    import { X } from 'lucide-react';
    import type { Supplier } from '../../types/supplier';

    interface SupplierFormModalProps {
    initial?: Supplier | null;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        contact_person?: string;
        phone?: string;
        email?: string;
        address?: string;
        lead_time_days?: number;
        is_active?: boolean;
    }) => Promise<void>;
    }

    const MODAL_TRANSITION_MS = 220;

    const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ initial, onClose, onSubmit }) => {
    const [name, setName] = useState(initial?.name ?? '');
    const [contactPerson, setContactPerson] = useState(initial?.contact_person ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [email, setEmail] = useState(initial?.email ?? '');
    const [address, setAddress] = useState(initial?.address ?? '');
    const [leadTimeDays, setLeadTimeDays] = useState<number>(initial?.lead_time_days ?? 3);
    const [isActive, setIsActive] = useState<boolean>(
        initial ? Boolean(initial.is_active) : true
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const isEdit = Boolean(initial);

    useEffect(() => {
        const timer = window.setTimeout(() => setIsVisible(true), 10);
        return () => window.clearTimeout(timer);
    }, []);

    const requestClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        window.setTimeout(() => onClose(), MODAL_TRANSITION_MS);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
        setError('Supplier name is required');
        return;
        }
        if (leadTimeDays < 0) {
        setError('Lead time cannot be negative');
        return;
        }
        setError(null);
        setSubmitting(true);
        try {
        await onSubmit({
            name: name.trim(),
            contact_person: contactPerson.trim() || undefined,
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            address: address.trim() || undefined,
            lead_time_days: leadTimeDays,
            is_active: isActive,
        });
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            isVisible && !isClosing ? 'opacity-100 ' : 'opacity-0'
        }`}
        >
        <div
            className={`w-full max-w-lg rounded-4xl border-white border bg-white opacity-80 shadow-xl transition-all duration-300 ease-out ${
            isVisible && !isClosing ? 'translate-y-0 scale-100 ' : '-translate-y-4 scale-80 opacity-0'
            }`}
        >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Edit Supplier' : 'Add Supplier'}
            </h2>
            <button
                onClick={requestClose}
                className="rounded-full p-2 bg-gray-200  text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
            >
                <X size={20} />
            </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full border border-gray-400 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Fresh Farm Produce Co."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder='e.g. Dororo'
                    className="w-full rounded-full border border-gray-400 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='e.g. 088 459 459'
                    className="w-full rounded-full border border-gray-400 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='e.g. Dororo@gmail.com'
                className="w-full rounded-full border border-gray-400 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder='...'
                className="w-full rounded-xl border border-dashed border-gray-400   px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
                <input
                    type="number"
                    min={0}
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 0)}
                    className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm  focus:outline-none focus:ring-1 focus:ring-primary"
                />
                </div>
                <div className="flex items-center gap-2 pb-2">
                <input
                    id="is_active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded-full border-gray-400 "
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                    Active supplier
                </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                type="button"
                onClick={requestClose}
                className="rounded-full p-2 bg-layer3 px-4 py-2 text-sm font-medium text-gray-700 "
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={submitting}
                className="rounded-full  bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Supplier'}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
    };

    export default SupplierFormModal;
