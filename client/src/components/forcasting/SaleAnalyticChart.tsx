import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { 
  DollarSign, 
  ShoppingBag, 
  Package,
  Activity,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  Loader
} from 'lucide-react';
import { forcastingService } from "../../services/focastingService";

// Types (same as before)
interface DailySalesRow {
  day_number: number;
  day_name: string;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
  avg_order_value: number;
  active_cashiers: number;
  unique_products_sold: number;
  avg_units_per_order: number;
  avg_daily_revenue: number;
  avg_daily_units: number;
  avg_daily_orders: number;
  revenue_percentage: number;
  order_percentage: number;
}

interface WeeklySalesRow {
  iso_year_week: number;
  week_start_date: string;
  week_end_date: string;
  week_label: string;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
  avg_order_value: number;
  active_cashiers: number;
  unique_products_sold: number;
  avg_daily_revenue: number;
  avg_daily_units: number;
  revenue_percentage_of_month: number;
  order_percentage_of_month: number;
}

interface MonthlySalesRow {
  month_number: number;
  month_name: string;
  month_start_date: string;
  month_end_date: string;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
  avg_order_value: number;
  active_cashiers: number;
  unique_products_sold: number;
  avg_daily_revenue: number;
  avg_daily_units: number;
  avg_daily_orders: number;
  revenue_growth_factor: number | null;
  revenue_percentage: number;
  order_percentage: number;
}

type SalesRow = DailySalesRow | WeeklySalesRow | MonthlySalesRow;

interface SaleAnalyticResult {
  daily: DailySalesRow[];
  weekly: WeeklySalesRow[];
  monthly: MonthlySalesRow[];
}

// Utility Components (StatCard, LoadingSpinner, ErrorDisplay, EmptyState)
// ... (keep them as before)

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}> = ({ title, value, icon, trend }) => (
  <div className="bg-layer2 border border-white rounded-4xl  p-4 hover:shadow-md transition-all duration-300">
 
    <div className="flex flex-col  justify-between">
      <div className=' flex items-center gap-2 mb-4'>
        <div className=" w-12 h-12 flex justify-center items-center rounded-full bg-gray-100">
          {icon}
        </div>
        <p className="text-lg text-gray-600 font-semibold">{title}</p>
      </div>
      <div>
        
        <p className="text-2xl font-bold mt-2 text-gray-800">{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span className="text-sm font-medium ml-1">{Math.abs(trend)}%</span>
            <span className="text-xs text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>

    </div>
  </div>
);

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader size={24} className="text-indigo-600 animate-pulse" />
      </div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Loading sales analytics...</p>
  </div>
);

// Error Component
const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-xl border border-red-200 p-8">
    <div className="bg-red-100 p-4 rounded-full">
      <AlertCircle size={48} className="text-red-600" />
    </div>
    <h3 className="mt-4 text-xl font-semibold text-red-700">Failed to Load Data</h3>
    <p className="mt-2 text-gray-600 text-center max-w-md">{message}</p>
    <button
      onClick={onRetry}
      className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
    >
      <RefreshCw size={18} />
      Retry
    </button>
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-xl border border-gray-200">
    <div className="bg-gray-100 p-4 rounded-full">
      <Package size={48} className="text-gray-400" />
    </div>
    <h3 className="mt-4 text-xl font-semibold text-gray-700">No Data Available</h3>
    <p className="mt-2 text-gray-500 text-center max-w-md">
      No sales data found for the selected period.
    </p>
  </div>
);

// Custom Tooltip - updated to show aggregation info
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 min-w-[200px]">
        <p className="text-sm font-semibold text-gray-800 mb-2">{data.weekLabel || label}</p>
        <div className="space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Revenue:</span> ${(Number(data.total_revenue) || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Orders:</span> {Number(data.total_orders) || 0}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Units:</span> {Number(data.total_units_sold) || 0}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Avg Order:</span> ${(Number(data.avg_order_value) || 0).toFixed(2)}
          </p>
          {data.entryCount && data.entryCount > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              Aggregated from {data.entryCount} entries
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Main Component
const SaleAnalyticChart: React.FC = () => {
  const [data, setData] = useState<SaleAnalyticResult | null>(null);
  const [errorMs, setErrorMs] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'units'>('revenue');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSaleAnalytic = async () => {
    try {
      setLoading(true);
      setErrorMs('');
      const res = await forcastingService.getSaleAnalytic();
      
      let responseData = res.data || res || {};
      if (responseData.data && typeof responseData.data === 'object') {
        responseData = responseData.data;
      }
      
      const formattedData: SaleAnalyticResult = {
        daily: responseData.daily || [],
        weekly: responseData.weekly || [],
        monthly: responseData.monthly || []
      };
      
      setData(formattedData);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Error fetching sales analytics:', error);
      setErrorMs(error.message || 'Failed to load sales analytics data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaleAnalytic();
  }, []);

  // Get current data based on view
  const currentData = useMemo(() => {
    if (!data) return [];
    if (view === 'daily') return data.daily;
    if (view === 'weekly') return data.weekly;
    return data.monthly;
  }, [view, data]);

  // Aggregate weekly data by week label - FIXED with proper number conversion
  const aggregatedData = useMemo(() => {
    if (view !== 'weekly') return currentData;

    const weekMap = new Map<string, any>();
    
    currentData.forEach((item: any) => {
      const key = item.week_label || `Week ${item.iso_year_week}`;
      
      // Convert all numeric fields to numbers
      const revenue = Number(item.total_revenue) || 0;
      const orders = Number(item.total_orders) || 0;
      const units = Number(item.total_units_sold) || 0;
      const avgOrder = Number(item.avg_order_value) || 0;
      const activeCashiers = Number(item.active_cashiers) || 0;
      const uniqueProducts = Number(item.unique_products_sold) || 0;
      const avgDailyRevenue = Number(item.avg_daily_revenue) || 0;
      const avgDailyUnits = Number(item.avg_daily_units) || 0;
      
      if (weekMap.has(key)) {
        const existing = weekMap.get(key);
        // Aggregate values - all as numbers
        const newRevenue = existing.total_revenue + revenue;
        const newOrders = existing.total_orders + orders;
        const newUnits = existing.total_units_sold + units;
        
        weekMap.set(key, {
          ...existing,
          total_revenue: newRevenue,
          total_orders: newOrders,
          total_units_sold: newUnits,
          // Recalculate average order value
          avg_order_value: newOrders > 0 ? newRevenue / newOrders : 0,
          active_cashiers: Math.max(existing.active_cashiers, activeCashiers),
          unique_products_sold: Math.max(existing.unique_products_sold, uniqueProducts),
          avg_daily_revenue: existing.avg_daily_revenue + avgDailyRevenue,
          avg_daily_units: existing.avg_daily_units + avgDailyUnits,
          entryCount: existing.entryCount + 1,
          // Keep the earliest start and latest end
          week_start_date: existing.week_start_date < item.week_start_date 
            ? existing.week_start_date 
            : item.week_start_date,
          week_end_date: existing.week_end_date > item.week_end_date 
            ? existing.week_end_date 
            : item.week_end_date,
        });
      } else {
        // First entry - store all as numbers
        weekMap.set(key, {
          ...item,
          total_revenue: revenue,
          total_orders: orders,
          total_units_sold: units,
          avg_order_value: avgOrder,
          active_cashiers: activeCashiers,
          unique_products_sold: uniqueProducts,
          avg_daily_revenue: avgDailyRevenue,
          avg_daily_units: avgDailyUnits,
          entryCount: 1,
        });
      }
    });
    
    // Convert back to array and sort by date
    const aggregated = Array.from(weekMap.values());
    aggregated.sort((a, b) => {
      if (a.week_start_date && b.week_start_date) {
        return new Date(a.week_start_date).getTime() - new Date(b.week_start_date).getTime();
      }
      return (a.iso_year_week || 0) - (b.iso_year_week || 0);
    });
    
    return aggregated;
  }, [currentData, view]);

  // Calculate metrics from aggregated data
  const totalRevenue = useMemo(() => 
    aggregatedData.reduce((sum, item) => sum + (Number(item.total_revenue) || 0), 0),
    [aggregatedData]
  );

  const totalOrders = useMemo(() => 
    aggregatedData.reduce((sum, item) => sum + (Number(item.total_orders) || 0), 0),
    [aggregatedData]
  );

  const avgOrderValue = useMemo(() => 
    totalOrders > 0 ? totalRevenue / totalOrders : 0,
    [totalRevenue, totalOrders]
  );

  const totalUnits = useMemo(() => 
    aggregatedData.reduce((sum, item) => sum + (Number(item.total_units_sold) || 0), 0),
    [aggregatedData]
  );

  const getDisplayName = (item: any): string => {
    if (view === 'daily' && item.day_name) return item.day_name;
    if (view === 'weekly') {
      return item.week_label || `Week ${item.iso_year_week}`;
    }
    if (view === 'monthly' && item.month_name) return item.month_name;
    return 'N/A';
  };

  const getMetricValue = (item: any): number => {
    if (selectedMetric === 'revenue') return Number(item.total_revenue) || 0;
    if (selectedMetric === 'orders') return Number(item.total_orders) || 0;
    return Number(item.total_units_sold) || 0;
  };

  const chartData = useMemo(() => {
    return aggregatedData.map((item) => ({
      name: getDisplayName(item),
      weekLabel: getDisplayName(item),
      total_revenue: Number(item.total_revenue) || 0,
      total_orders: Number(item.total_orders) || 0,
      total_units_sold: Number(item.total_units_sold) || 0,
      avg_order_value: Number(item.avg_order_value) || 0,
      metric: getMetricValue(item),
      entryCount: item.entryCount || 1,
    }));
  }, [aggregatedData, selectedMetric]);

  const metricLabel = {
    revenue: 'Revenue',
    orders: 'Orders',
    units: 'Units Sold'
  }[selectedMetric];

  const metricColor = {
    revenue: 'oklch(70.4% 0.14 182.503)',
    orders: '#6366f1',
    units: '#a855f7'
  }[selectedMetric];

  const hasAggregatedEntries = useMemo(() => {
    return aggregatedData.some((item: any) => item.entryCount && item.entryCount > 1);
  }, [aggregatedData]);

  if (loading) return <LoadingSpinner />;
  if (errorMs) return <ErrorDisplay message={errorMs} onRetry={fetchSaleAnalytic} />;
  if (!data || aggregatedData.length === 0) return <EmptyState />;

  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<DollarSign size={24} className="text-indigo-600" />}
          />
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingBag size={24} className="text-purple-600" />}
          />
          <StatCard
            title="Average Order Value"
            value={`$${avgOrderValue.toFixed(2)}`}
            icon={<Activity size={24} className="text-green-600" />}
          />
          <StatCard
            title="Units Sold"
            value={totalUnits}
            icon={<Package size={24} className="text-blue-600" />}
          />
        </div>

        {/* Line Chart */}
        <div className="bg-layer2 rounded-4xl border border-white  p-4">
          <div className='flex justify-between items-start m-4'>

          
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {metricLabel} Trend
            
            <p className="text-gray-500 font-normal mt-1">
              {lastUpdated && (
                <span className="text-sm">
                  Last updated: {lastUpdated.toLocaleString()}
                </span>
              )}
            </p>
          </h3>

          <div className="flex items-center  gap-3 flex-wrap">
            <div className="flex bg-layer3 rounded-3xl  p-1 border border-white">
              {(['daily', 'weekly', 'monthly'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 text-sm font-medium rounded-3xl transition-all duration-200 ${
                    view === v
                      ? 'bg-gray-300 text-black '
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex bg-layer3 border border-white rounded-3xl p-1 ">
              {(['revenue', 'orders', 'units'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMetric(m)}
                  className={`px-3 py-2 text-sm font-medium rounded-3xl transition-all duration-200 ${
                    selectedMetric === m
                      ? 'bg-gray-300 text-black'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={fetchSaleAnalytic}
              className="p-3 bg-layer3 rounded-3xl shadow-sm border border-white hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
          </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={metricColor} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={view === 'daily' ? 0 : -25}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (selectedMetric === 'revenue') return `$${value}`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="metric"
                stroke={metricColor}
                fillOpacity={1}
                fill="url(#colorMetric)"
                name={metricLabel}
              />
              <Line
                type="monotone"
                dataKey="metric"
                stroke={metricColor}
                strokeWidth={3}
                dot={{ 
                  fill: metricColor, 
                  strokeWidth: 2,
                  r: 6,
                  stroke: '#fff'
                }}
                activeDot={{ 
                  r: 8,
                  stroke: metricColor,
                  strokeWidth: 2
                }}
                name={metricLabel}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Data Summary */}
        <div className="mt-4 bg-layer2 rounded-4xl border border-white p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Data Summary {view === 'weekly' && '(Aggregated by Week)'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    {view === 'daily' ? 'Day' : view === 'weekly' ? 'Week' : 'Month'}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Orders</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Units</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Avg Order</th>
                  {view === 'weekly' && (
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Entries</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {aggregatedData.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                      {getDisplayName(item)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700">
                      ${(Number(item.total_revenue) || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700">
                      {Number(item.total_orders) || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700">
                      {Number(item.total_units_sold) || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700">
                      ${(Number(item.avg_order_value) || 0).toFixed(2)}
                    </td>
                    {view === 'weekly' && (
                      <td className="py-3 px-4 text-sm text-right text-gray-500">
                        {item.entryCount || 1}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-500 text-right">
            Showing {aggregatedData.length} {view === 'weekly' ? 'aggregated weeks' : 'records'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleAnalyticChart;