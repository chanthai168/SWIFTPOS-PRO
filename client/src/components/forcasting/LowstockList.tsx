import { forcastingService } from "../../services/focastingService";
import { useState, useEffect } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
    XMarkIcon, 
    ShoppingCartIcon, 
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ClockIcon,
    MapPinIcon,
    TagIcon,
    CurrencyDollarIcon,
    CubeIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface LowStockItem {
    available_quantity: number;
    category_name: string;
    cost_price: string;
    damaged_quantity: number;
    image_created_at: string;
    image_url: string;
    inventory_id: number;
    location: string;
    low_stock_threshold: number;
    product_id: number;
    product_name: string;
    quantity_on_hand: number;
    selling_price: string;
    stock_status: string;
    suggested_reorder_quantity: number;
    variant_id: number;
    variant_name: string;
    variant_sku: string;
}

const resolveImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '/placeholder-image.svg';

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${normalizedPath}`;
};

const LowStockList: React.FC = () => {
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [errorMs, setErrorMs] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getLowStockItems = async () => {
        try {
            setLoading(true);
            const res = await forcastingService.getLowStockItem();
            setLowStockItems(res.data || res || []);
            setErrorMs('');
        } catch (error) {
            console.log(error);
            setErrorMs('Failed to load low stock items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLowStockItems();
    }, []);

    const openModal = (item: LowStockItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(num || 0);
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'OUT OF STOCK':
                return 'bg-red-500';
            case 'LOW STOCK':
                return 'bg-yellow-500';
            default:
                return 'bg-green-500';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch(status) {
            case 'OUT OF STOCK':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'LOW STOCK':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default:
                return 'bg-green-50 text-green-700 border-green-200';
        }
    };

    const getStockLevel = (available: number, threshold: number) => {
        const percentage = (available / threshold) * 100;
        if (percentage === 0) return { label: 'Critical', color: 'text-red-600' };
        if (percentage <= 30) return { label: 'Very Low', color: 'text-red-500' };
        if (percentage <= 50) return { label: 'Low', color: 'text-yellow-600' };
        if (percentage <= 75) return { label: 'Moderate', color: 'text-yellow-500' };
        return { label: 'Adequate', color: 'text-green-600' };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-sm text-gray-500">Loading inventory data...</p>
            </div>
        );
    }

    if (errorMs) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl  p-6 text-center">
                <ShieldExclamationIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-700 font-medium">{errorMs}</p>
                <button 
                    onClick={getLowStockItems}
                    className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!lowStockItems || lowStockItems.length === 0) {
        return (
            <div className=" from-green-50 to-emerald-50 border border-green-200 rounded-xl p-12 text-center" >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-800">All Stock Levels Are Healthy</h3>
                <p className="text-green-600 mt-2">No items are currently below their threshold</p>
                <button 
                    onClick={getLowStockItems}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                    Refresh
                </button>
            </div>
        );
    }

    const criticalItems = lowStockItems.filter(item => item.available_quantity === 0).length;

    return (
        <div className=" w-full bg-layer2 rounded-4xl border border-white shadow-lg overflow-hidden" style={{minHeight:'100%'}}>
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 rounded-lg">
                                <ExclamationTriangleIcon className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold gray-600">Low Stock Alert</h2>
                                <p className="text-gray-600 text-sm mt-0.5">
                                    {lowStockItems.length} items need immediate attention
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {criticalItems > 0 && (
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full animate-pulse">
                                {criticalItems} Critical
                            </span>
                        )}
                        <button
                            onClick={getLowStockItems}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <ArrowPathIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Items</p>
                    <p className="text-lg font-bold text-gray-800">{lowStockItems.length}</p>
                </div>
                <div className="text-center border-x border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Critical</p>
                    <p className="text-lg font-bold text-red-600">{criticalItems}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Value</p>
                    <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(
                            lowStockItems.reduce((sum, item) => 
                                sum + (parseFloat(item.selling_price) * item.available_quantity), 0
                            )
                        )}
                    </p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="p-6">
                <div className=" flex flex-col gap-2">
                    {lowStockItems.map((item) => {
                        const stockLevel = getStockLevel(item.available_quantity, item.low_stock_threshold);
                        const percentage = Math.min((item.available_quantity / item.low_stock_threshold) * 100, 100);
                        
                        return (
                            <div
                                key={item.variant_id}
                                onClick={() => openModal(item)}
                                className="group relative  border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                            >
                                {/* Status Bar */}
                                {/* <div className={`h-1 ${getStatusColor(item.stock_status)}`}></div> */}
                                
                                <div className="flex h-36 p-2 ">
                                    {/* Image Section */}
                                    <div className="w-1/5 bg-gray-100 rounded-xl flex justify-center items-center relative overflow-hidden">
                                            <img
                                                src={resolveImageUrl(item.image_url)}
                                                alt={item.product_name}
                                                className="h-[80%] object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = '/placeholder-image.svg';
                                                }}
                                            />
                                        



                                    </div>

                                    {/* Content Section */}
                                    <div className="w-4/5 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex gap-4 items-center">
                                                <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                                                    {item.product_name}
                                                </h3>
                                                <div className=" bg-gray-100 h-6 px-2 gap-1 rounded-xl flex items-center justify-center">
                                                    <span className=" text-xs font-medium ">Stock </span>
                                                    <span className="font-bold">{item.available_quantity}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {item.variant_name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <TagIcon className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-400">
                                                    {item.category_name || 'Uncategorized'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-md shadow-sm ${getStatusBgColor(item.stock_status)}`}>
                                                {item.stock_status}
                                            </span>
                                        </div>



                                        <div className="space-y-2">
                                            {/* Price and Stock Row */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <CurrencyDollarIcon className="w-3 h-3 text-gray-400" />
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {formatCurrency(item.selling_price)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">Threshold:</span>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {item.low_stock_threshold}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Stock Level</span>
                                                    <span className={`text-xs font-medium ${stockLevel.color}`}>
                                                        {stockLevel.label}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-700 ${
                                                            percentage === 0 ? 'bg-red-500' :
                                                            percentage <= 30 ? 'bg-red-400' :
                                                            percentage <= 50 ? 'bg-yellow-500' :
                                                            'bg-yellow-400'
                                                        }`}
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Reorder Suggestion */}
                                            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                                <div className="flex items-center gap-1">
                                                    <ArrowPathIcon className="w-3 h-3 text-blue-500" />
                                                    <span className="text-xs text-gray-500">Reorder:</span>
                                                </div>
                                                <span className="text-xs font-semibold text-blue-600">
                                                    {item.suggested_reorder_quantity} units
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Arrow Indicator */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-blue-500 rounded-full p-1 shadow-lg">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Enhanced Detail Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 backdrop-blur-sm bg-black/20" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95 -translate-x-4 translate-y-4"
                                    enterTo="opacity-85 scale-100 translate-0"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-85 scale-100"
                                    leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden opacity-85 rounded-4xl  bg-white shadow-2xl transition-all">
                                    {selectedItem && (
                                        <>
                                            <div className=" border border-white">
                                            {/* Modal Header with Image */}
                                            <div className="relative h-30  ">

                                                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-22 h-22 flex justify-center items-center p-1 rounded-xl overflow-hidden bg-white shadow-lg flex-shrink-0">
                                                            {selectedItem.image_url ? (
                                                                <img
                                                                    src={resolveImageUrl(selectedItem.image_url)}
                                                                    alt={selectedItem.product_name}
                                                                    className=" h-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.currentTarget as HTMLImageElement).src = '/placeholder-image.svg';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                    <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-gray-600">
                                                            <Dialog.Title className="text-2xl font-bold">
                                                                {selectedItem.product_name}
                                                            </Dialog.Title>
                                                            <p className="text-gray-500 text-sm">
                                                                {selectedItem.variant_name} • SKU: {selectedItem.variant_sku}
                                                            </p>
                                                        </div>
                                                        <span className={`px-4 py-2 text-sm font-bold rounded-xl shadow-lg ${getStatusBgColor(selectedItem.stock_status)}`}>
                                                            {selectedItem.stock_status}
                                                        </span>
                                                    </div>

                                                <button
                                                    onClick={closeModal}
                                                    className="absolute top-4 right-4 p-2 bg-gray-200  hover:scale-105 rounded-full text-gray-600 z-10"
                                                >
                                                    <XMarkIcon className="w-6 h-6" />
                                                </button>
                                                </div>
                                            </div>

                                            {/* Modal Body */}
                                            <div className="p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Stock Information */}
                                                    <div className="bg-gray-100 rounded-xl p-5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <CubeIcon className="w-5 h-5 text-gray-600" />
                                                            <h4 className="font-semibold text-gray-800">Stock Information</h4>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center p-2 border-b border-gray-300">
                                                                <span className="text-sm text-gray-600">Available</span>
                                                                <span className={`text-sm font-bold ${
                                                                    selectedItem.available_quantity === 0 ? 'text-red-600' : 'text-gray-800'
                                                                }`}>
                                                                    {selectedItem.available_quantity}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 border-b border-gray-300">
                                                                <span className="text-sm text-gray-600">On Hand</span>
                                                                <span className="text-sm font-bold text-gray-800">
                                                                    {selectedItem.quantity_on_hand}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 border-b border-gray-300">
                                                                <span className="text-sm text-gray-600">Damaged</span>
                                                                <span className="text-sm font-bold text-red-600">
                                                                    {selectedItem.damaged_quantity}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 border-b border-gray-300">
                                                                <span className="text-sm text-gray-600">Threshold</span>
                                                                <span className="text-sm font-bold text-gray-800">
                                                                    {selectedItem.low_stock_threshold}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="bg-gray-100 rounded-xl p-5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <TagIcon className="w-5 h-5 text-gray-600" />
                                                            <h4 className="font-semibold text-gray-800">Product Details</h4>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center p-2 border-b border-gray-300">
                                                                <span className="text-sm text-gray-600">Category</span>
                                                                <span className="text-sm font-medium text-gray-800">
                                                                    {selectedItem.category_name || 'Uncategorized'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 border-b border-gray-300">
                                                                <span className="text-sm text-gray-600">Location</span>
                                                                <div className="flex items-center gap-1">
                                                                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-sm font-medium text-gray-800">
                                                                        {selectedItem.location || 'Not specified'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 border-b border-gray-300">
                                                                <span className="text-sm text-gray-600">Cost Price</span>
                                                                <span className="text-sm font-medium text-gray-800">
                                                                    {formatCurrency(selectedItem.cost_price)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 border-b border-gray-300">
                                                                <span className="text-sm text-gray-600">Selling Price</span>
                                                                <span className="text-sm font-bold text-gray-800">
                                                                    {formatCurrency(selectedItem.selling_price)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Reorder Suggestion Section */}
                                                <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <ArrowPathIcon className="w-5 h-5 text-blue-600" />
                                                                <h4 className="font-semibold text-blue-900">Reorder Suggestion</h4>
                                                            </div>
                                                            <p className="text-sm text-blue-700 mt-1">
                                                                Recommended order to reach safe stock level
                                                            </p>
                                                        </div>
                                                        <div className="text-center bg-white rounded-xl px-6 py-3 shadow-md">
                                                            <p className="text-3xl font-bold text-blue-600">
                                                                {selectedItem.suggested_reorder_quantity}
                                                            </p>
                                                            <p className="text-xs text-gray-500">units</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                            <span>Current: {selectedItem.available_quantity}</span>
                                                            <span>Target: {selectedItem.low_stock_threshold}</span>
                                                        </div>
                                                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                                                                style={{
                                                                    width: `${Math.min((selectedItem.available_quantity / selectedItem.low_stock_threshold) * 100, 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Metadata Footer */}
                                                <div className="mt-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 pt-4">
                                                    <div className="flex items-center gap-4">
                                                        <ClockIcon className="w-4 h-4" />
                                                        <span>Image: {new Date(selectedItem.image_created_at).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span>Variant ID: {selectedItem.variant_id}</span>
                                                        <span>Product ID: {selectedItem.product_id}</span>
                                                        <span>Inventory ID: {selectedItem.inventory_id}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                                <button
                                                    onClick={closeModal}
                                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:scale-102 transition-all"
                                                >
                                                    Close
                                                </button>
                                                <button className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-full hover:scale-102 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                                                    <ShoppingCartIcon className="w-4 h-4" />
                                                    Reorder Now
                                                </button>
                                            </div>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default LowStockList;