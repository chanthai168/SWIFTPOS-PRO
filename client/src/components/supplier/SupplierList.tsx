    import React, { useEffect, useState, useCallback } from 'react';
    import { Plus, Search, Pencil, Trash2, Mail, Phone, Clock, Power } from 'lucide-react';
    import { AxiosError } from 'axios';
    import { supplierService } from '../../services/supplierServices';
    import { useUser } from '../../context/Context';
    import { useNotification, NotificationContainer } from '../../public/Notify';
    import type { Supplier } from '../../types/supplier';
    import SupplierFormModal from './SupplierFormModal';

    const SupplierList: React.FC = () => {
    const { shop } = useUser();
    const { notify, notifications } = useNotification();

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const fetchSuppliers = useCallback(async () => {
        if (!shop?.id) return;
        setLoading(true);
        try {
        const res = await supplierService.getSuppliers(shop.id, search || undefined);
        setSuppliers(res.data ?? []);
        } catch (error) {
        if (error instanceof AxiosError) notify('error', error.message);
        else notify('error', 'Failed to load suppliers');
        } finally {
        setLoading(false);
        }
    }, [shop?.id, search]);

    useEffect(() => {
        const timeout = setTimeout(() => {
        fetchSuppliers();
        }, 300); // debounce search
        return () => clearTimeout(timeout);
    }, [fetchSuppliers]);

    const handleCreate = async (data: Parameters<typeof supplierService.createSupplier>[1]) => {
        if (!shop?.id) return;
        try {
        await supplierService.createSupplier(shop.id, data);
        notify('success', 'Supplier added successfully');
        setShowModal(false);
        fetchSuppliers();
        } catch (error) {
        if (error instanceof AxiosError) notify('error', error.message);
        else notify('error', 'Failed to add supplier');
        }
    };

    const handleUpdate = async (data: Parameters<typeof supplierService.createSupplier>[1]) => {
        if (!shop?.id || !editingSupplier) return;
        try {
        await supplierService.updateSupplier(shop.id, { id: editingSupplier.id, ...data });
        notify('success', 'Supplier updated successfully');
        setShowModal(false);
        setEditingSupplier(null);
        fetchSuppliers();
        } catch (error) {
        if (error instanceof AxiosError) notify('error', error.message);
        else notify('error', 'Failed to update supplier');
        }
    };

    const handleToggleActive = async (supplier: Supplier) => {
        if (!shop?.id) return;
        try {
        await supplierService.updateSupplier(shop.id, {
            id: supplier.id,
            is_active: !supplier.is_active,
        });
        notify('success', supplier.is_active ? 'Supplier deactivated' : 'Supplier activated');
        fetchSuppliers();
        } catch (error) {
        if (error instanceof AxiosError) notify('error', error.message);
        else notify('error', 'Failed to update supplier status');
        }
    };

    const handleDelete = async (supplier: Supplier) => {
        if (!shop?.id) return;
        if (!confirm(`Delete supplier "${supplier.name}"? This cannot be undone.`)) return;
        try {
        await supplierService.deleteSupplier(shop.id, supplier.id);
        notify('success', 'Supplier deleted');
        fetchSuppliers();
        } catch (error) {
        if (error instanceof AxiosError) {
            notify(
            'error',
            error.response?.status === 400
                ? 'Cannot delete: supplier has existing purchase orders. Deactivate it instead.'
                : error.message
            );
        } else notify('error', 'Failed to delete supplier');
        }
    };

    const openCreateModal = () => {
        setEditingSupplier(null);
        setShowModal(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setShowModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <NotificationContainer notifications={notifications} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suppliers..."
                className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            </div>

            <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
            <Plus size={16} />
            Add Supplier
            </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Lead Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {loading && (
                <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading suppliers...
                    </td>
                </tr>
                )}

                {!loading && suppliers.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No suppliers yet. Click "Add Supplier" to create one.
                    </td>
                </tr>
                )}

                {!loading &&
                suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        {supplier.address && (
                        <div className="text-xs text-gray-500 line-clamp-1">{supplier.address}</div>
                        )}
                    </td>
                    <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">{supplier.contact_person || '—'}</div>
                        <div className="flex flex-col gap-0.5 mt-1">
                        {supplier.phone && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Phone size={12} /> {supplier.phone}
                            </span>
                        )}
                        {supplier.email && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={12} /> {supplier.email}
                            </span>
                        )}
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                        <Clock size={14} className="text-gray-400" />
                        {supplier.lead_time_days} day{supplier.lead_time_days === 1 ? '' : 's'}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                        <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            supplier.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        >
                        {supplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => openEditModal(supplier)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-teal-600"
                            title="Edit"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => handleToggleActive(supplier)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600"
                            title={supplier.is_active ? 'Deactivate' : 'Activate'}
                        >
                            <Power size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(supplier)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>

        {showModal && (
            <SupplierFormModal
            initial={editingSupplier}
            onClose={() => {
                setShowModal(false);
                setEditingSupplier(null);
            }}
            onSubmit={editingSupplier ? handleUpdate : handleCreate}
            />
        )}
        </div>
    );
    };

    export default SupplierList;
