    import { forcastingService } from "../../services/focastingService";
    import { useState, useEffect } from "react";
    import { Dialog, Transition } from '@headlessui/react';
    import { Fragment } from 'react';
    import { 
        XMarkIcon, 
        ShoppingCartIcon, 
        TrophyIcon,
        ArrowPathIcon,
        ClockIcon,
        MapPinIcon,
        TagIcon,
        CurrencyDollarIcon,
        CubeIcon,
        ArrowTrendingUpIcon,
        ArrowTrendingDownIcon,
        BackwardIcon,
        FireIcon,
        StarIcon
    } from '@heroicons/react/24/outline';
    import { 
        ChevronUpIcon,
        ChevronDownIcon
    } from '@heroicons/react/24/solid';

    interface BestSellingItem {
        available_quantity: number;
        avg_daily_sales: string;
        category_name: string | null;
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
        sales_rank: number;
        selling_price: string;
        total_orders: number;
        total_revenue: string;
        total_units_sold: string;
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

    const ItemsRanking: React.FC = () => {
        const [items, setItems] = useState<BestSellingItem[]>([]);
        const [errorMs, setErrorMs] = useState('');
        const [loading, setLoading] = useState(true);
        const [selectedItem, setSelectedItem] = useState<BestSellingItem | null>(null);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | '90days' | 'all'>('30days');

        const getBestSellingItems = async () => {
            try {
                setLoading(true);
                const res = await forcastingService.getProductRanking();
                console.log(res);
                setItems(res.data || res || []);
                setErrorMs('');
            } catch (error) {
                console.log(error);
                setErrorMs('Failed to load best selling items');
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            getBestSellingItems();
        }, []);

        const openModal = (item: BestSellingItem) => {
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

        const formatNumber = (num: string | number) => {
            const n = typeof num === 'string' ? parseFloat(num) : num;
            return new Intl.NumberFormat('en-US').format(n || 0);
        };

        const getRankIcon = (rank: number) => {
            if (rank === 1) return <TrophyIcon className="w-6 h-6 text-yellow-500" />;
            if (rank === 2) return <TrophyIcon className="w-6 h-6 text-gray-400" />;
            if (rank === 3) return <TrophyIcon className="w-6 h-6 text-amber-600" />;
            return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
        };

        const getRankColor = (rank: number) => {
            if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-200';
            if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-200';
            return 'bg-blue-50 text-blue-700 border-blue-200';
        };

        const getStockStatus = (available: number, threshold: number) => {
            if (available === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
            if (available < threshold) return { label: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
            return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
        };

        const getPerformanceLabel = (dailySales: number) => {
            if (dailySales >= 5) return { label: 'Hot Seller', icon: <FireIcon className="w-4 h-4" />, color: 'text-red-600 bg-red-100' };
            if (dailySales >= 2) return { label: 'Popular', icon: <StarIcon className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-100' };
            if (dailySales >= 1) return { label: 'Steady', icon: <ArrowTrendingUpIcon className="w-4 h-4" />, color: 'text-blue-600 bg-blue-100' };
            return { label: 'Slow', icon: <ArrowTrendingDownIcon className="w-4 h-4" />, color: 'text-gray-600 bg-gray-100' };
        };

        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Loading best sellers...</p>
                </div>
            );
        }

        if (errorMs) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="text-red-400 text-5xl mb-3">⚠️</div>
                    <p className="text-red-700 font-medium">{errorMs}</p>
                    <button 
                        onClick={getBestSellingItems}
                        className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (!items || items.length === 0) {
            return (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                        <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">No Sales Data Yet</h3>
                    <p className="text-gray-600 mt-2">Start selling to see your best performing items</p>
                </div>
            );
        }

        return (
            <div className="w-full bg-layer2 p-2 border border-white rounded-4xl  overflow-y-scroll overflow-x-hidden" style={{height:'540px'}}>
                {/* Header */}
                <div className="bg-gradient-to-r  px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">

                                <div>
                                    <h2 className="text-lg font-semibold text-gray-700">Best Selling Items</h2>
                                    <p className="text-gray-600 text-sm mt-0.5">
                                        {items.length} products ranked by sales
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Items List */}
                <div className=" flex flex-col gap-4 p-4">
                    {items.map((item) => {
                        const stockStatus = getStockStatus(item.available_quantity, item.low_stock_threshold);
                        const performance = getPerformanceLabel(parseFloat(item.avg_daily_sales));
                        const rankClass = getRankColor(item.sales_rank);
                        
                        return (
                            <div
                                key={item.variant_id}
                                onClick={() => openModal(item)}
                                className="group hover:bg-gray-50 hover:-translate-y-1 border border-gray-200 rounded-xl hover:scale-101 hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                                <div className="px-4 py-4 md:px-6">
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}

                                        {/* Image */}
                                        <div className="flex-shrink-0 group-hover:scale-110 transition-scale duration-300 w-16 h-16 flex items-center justify-center rounded-lg overflow-hidden bg-gray-100">
                                            {item.image_url ? (
                                                <img
                                                    src={resolveImageUrl(item.image_url)}
                                                    alt={item.product_name}
                                                    className=" h-full object-cover"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = '/placeholder-image.svg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">
                                                    {item.product_name}
                                                </h3>
                                                <span className={`flex  px-2 py-0.5 rounded-full text-xs font-medium ${performance.color}`}>
                                                    {performance.icon} {performance.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {item.variant_name} • SKU: {item.variant_sku}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {item.category_name || 'Uncategorized'}
                                                </span>
                                            </div>
                                            {/* <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {formatCurrency(item.selling_price)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Sold: {formatNumber(item.total_units_sold)} units
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Revenue: {formatCurrency(item.total_revenue)}
                                                </span>
                                                <span className={`text-xs font-medium ${stockStatus.color}`}>
                                                    {stockStatus.label}: {item.available_quantity}
                                                </span>
                                            </div> */}
                                        </div>

                                        {/* Right Side Stats */}
                                        <div className="hidden md:flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Daily Sales:</span>
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {formatNumber(item.avg_daily_sales)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Orders:</span>
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {item.total_orders}
                                                </span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                    style={{ 
                                                        width: `${Math.min((parseFloat(item.total_units_sold) / Number(items[0]?.total_units_sold)) * 100, 100)}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Arrow indicator */}
                                        <div className="flex-shrink-0 ml-2">
                                            <ChevronUpIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detail Modal */}
                <Transition
                    appear
                    show={isModalOpen}
                    as={Fragment}
                    afterLeave={() => setSelectedItem(null)}
                >
                    <Dialog as="div" className="relative z-50" onClose={closeModal}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-4"
                            enterTo="opacity-100 translate-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95 translate-4"
                                    enterTo="opacity-85 scale-100 translate-0"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-85 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-3xl border-white transform overflow-hidden opacity-85  rounded-4xl bg-white shadow-2xl transition-all">
                                        {selectedItem && (
                                            <>
                                            <div className=" p-2 ">
                                                {/* Modal Header with Rank Badge */}
                                                <div className="relative  px-6 py-5">
                                                    <button
                                                        onClick={closeModal}
                                                        className="absolute top-4 right-4 p-2 bg-gray-200 hover:scale-105 rounded-full transition-all text-white"
                                                    >
                                                        <XMarkIcon className="w-6 h-6 text-gray-600 shadow-2xl" />
                                                    </button>
                                                    
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <img className=" h-16" src={resolveImageUrl(selectedItem.image_url)} alt="hhe" />
                                                        <div>
                                                            <Dialog.Title className="text-2xl font-bold text-gray-600">
                                                                {selectedItem.product_name}
                                                            </Dialog.Title>
                                                            <p className="text-gray-600 text-sm">
                                                                {selectedItem.variant_name} • Rank #{selectedItem.sales_rank}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Modal Body */}
                                                <div className="p-4">
                                                    {/* Performance Overview */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                        <div className="bg-gray-100 rounded-2xl p-4 text-center">
                                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Units Sold</p>
                                                            <p className="text-2xl font-bold text-gray-600 mt-1">
                                                                {formatNumber(selectedItem.total_units_sold)}
                                                            </p>
                                                        </div>
                                                        <div className="bg-green-50 rounded-2xl p-4 text-center">
                                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Revenue</p>
                                                            <p className="text-2xl font-bold text-green-600 mt-1">
                                                                {formatCurrency(selectedItem.total_revenue)}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gray-100 rounded-2xl p-4 text-center">
                                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Daily Sales</p>
                                                            <p className="text-2xl font-bold text-gray-600 mt-1">
                                                                {formatNumber(selectedItem.avg_daily_sales)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Product Details */}
                                                        <div className="bg-gray-100 rounded-2xl p-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <TagIcon className="w-5 h-5 text-gray-600" />
                                                                <h4 className="font-semibold text-gray-800">Product Details</h4>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center p-2 border-b border-gray-300 ">
                                                                    <span className="text-sm text-gray-600">SKU</span>
                                                                    <span className="text-sm font-medium text-gray-800">{selectedItem.variant_sku}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center p-2 border-b border-gray-300 ">
                                                                    <span className="text-sm text-gray-600">Category</span>
                                                                    <span className="text-sm font-medium text-gray-800">
                                                                        {selectedItem.category_name || 'Uncategorized'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center p-2 border-b border-gray-300 ">
                                                                    <span className="text-sm text-gray-600">Location</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-sm font-medium text-gray-800">
                                                                            {selectedItem.location || 'Not specified'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Stock & Pricing */}
                                                        <div className="bg-gray-100 rounded-2xl p-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
                                                                <h4 className="font-semibold text-gray-800">Stock & Pricing</h4>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center p-2 border-b border-gray-300 ">
                                                                    <span className="text-sm text-gray-600">Selling Price</span>
                                                                    <span className="text-sm font-bold text-gray-800">
                                                                        {formatCurrency(selectedItem.selling_price)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center p-2 border-b border-gray-300  ">
                                                                    <span className="text-sm text-gray-600">Cost Price</span>
                                                                    <span className="text-sm font-medium text-gray-800">
                                                                        {formatCurrency(selectedItem.cost_price)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center p-2 border-b border-gray-300 ">
                                                                    <span className="text-sm text-gray-600">Profit Margin</span>
                                                                    <span className={`text-sm font-bold ${
                                                                        parseFloat(selectedItem.selling_price) - parseFloat(selectedItem.cost_price) > 0 
                                                                            ? 'text-green-600' : 'text-red-600'
                                                                    }`}>
                                                                        {formatCurrency(parseFloat(selectedItem.selling_price) - parseFloat(selectedItem.cost_price))}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Stock Status Section */}
                                                    <div className="mt-6 bg-gray-100 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <CubeIcon className="w-5 h-5 text-gray-600" />
                                                            <h4 className="font-semibold text-gray-800">Inventory Status</h4>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <div className="bg-white rounded-lg p-3 text-center">
                                                                <p className="text-xs text-gray-500">Available</p>
                                                                <p className={`text-lg font-bold ${
                                                                    selectedItem.available_quantity === 0 ? 'text-red-600' : 'text-gray-800'
                                                                }`}>
                                                                    {selectedItem.available_quantity}
                                                                </p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-3 text-center">
                                                                <p className="text-xs text-gray-500">On Hand</p>
                                                                <p className="text-lg font-bold text-gray-800">
                                                                    {selectedItem.quantity_on_hand}
                                                                </p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-3 text-center">
                                                                <p className="text-xs text-gray-500">Damaged</p>
                                                                <p className="text-lg font-bold text-red-600">
                                                                    {selectedItem.damaged_quantity}
                                                                </p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-3 text-center">
                                                                <p className="text-xs text-gray-500">Threshold</p>
                                                                <p className="text-lg font-bold text-gray-800">
                                                                    {selectedItem.low_stock_threshold}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                                <span>Stock Level</span>
                                                                <span>{selectedItem.available_quantity} / {selectedItem.low_stock_threshold}</span>
                                                            </div>
                                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-700 ${
                                                                        selectedItem.available_quantity === 0 ? 'bg-red-500' :
                                                                        selectedItem.available_quantity < selectedItem.low_stock_threshold ? 'bg-yellow-500' :
                                                                        'bg-blue-500'
                                                                    }`}
                                                                    style={{
                                                                        width: `${Math.min((selectedItem.available_quantity / selectedItem.low_stock_threshold) * 100, 100)}%`
                                                                    }}
                                                                />
                                                            </div>
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

    export default ItemsRanking;