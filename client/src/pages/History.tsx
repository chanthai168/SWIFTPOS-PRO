import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FolderOpen, Package, Truck } from 'lucide-react';
import { useUser } from '../context/Context';
import { historyService } from '../services/historyServices';
import type {
  HistoryTab,
  InventoryHistoryItem,
  SortOrder,
  SupplyHistoryItem,
  TransactionHistoryItem,
} from '../types/history';

const PAGE_SIZE = 10;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    year: 'numeric',
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const History: React.FC = () => {
  const { shop } = useUser();
  const [tab, setTab] = useState<HistoryTab>('transactions');
  const [sort, setSort] = useState<SortOrder>('DESC');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryHistoryItem[]>([]);
  const [supplyOrders, setSupplyOrders] = useState<SupplyHistoryItem[]>([]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;

  const loadData = useCallback(async () => {
    if (!shop?.id) return;
    setLoading(true);
    try {
      if (tab === 'transactions') {
        const res = await historyService.getTransactions(shop.id, PAGE_SIZE, offset, sort);
        setTransactions(res.data);
        setTotal(res.total);
      } else if (tab === 'inventory') {
        const res = await historyService.getInventoryLogs(shop.id, PAGE_SIZE, offset, sort);
        setInventoryLogs(res.data);
        setTotal(res.total);
      } else {
        const res = await historyService.getSupplyOrders(shop.id, PAGE_SIZE, offset, sort);
        setSupplyOrders(res.data);
        setTotal(res.total);
      }
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setLoading(false);
    }
  }, [shop?.id, tab, sort, offset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [tab, sort]);

  const tabs = useMemo(
    () => [
      { id: 'transactions' as HistoryTab, label: 'Transactions' },
      { id: 'inventory' as HistoryTab, label: 'Inventory' },
      { id: 'supply' as HistoryTab, label: 'Supply management' },
    ],
    [],
  );

  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-layer2 border-b border-gray-100 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
      </div>

      <div className="flex-1 px-6 py-6">
        <div className="bg-layer2 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-6 px-6 pt-5 border-b border-gray-100">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-3 text-sm font-medium transition-colors relative
                  ${tab === t.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Sort toggle */}
          <div className="flex items-center gap-2 px-6 py-4">
            <button
              onClick={() => setSort('DESC')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${sort === 'DESC' ? 'bg-primary text-white' : 'bg-layer3 text-gray-600 hover:bg-gray-200'}`}
            >
              New
            </button>
            <button
              onClick={() => setSort('ASC')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${sort === 'ASC' ? 'bg-primary text-white' : 'bg-layer3 text-gray-600 hover:bg-gray-200'}`}
            >
              Old
            </button>
          </div>

          {/* List */}
          <div className="px-6 pb-4 space-y-3 min-h-[320px]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-layer3 rounded-xl animate-pulse" />
              ))
            ) : tab === 'transactions' && transactions.length === 0 ? (
              <EmptyState message="No transactions yet." />
            ) : tab === 'inventory' && inventoryLogs.length === 0 ? (
              <EmptyState message="No inventory activity yet." />
            ) : tab === 'supply' && supplyOrders.length === 0 ? (
              <EmptyState message="No supply orders yet." />
            ) : tab === 'transactions' ? (
              transactions.map(tx => (
                <HistoryRow
                  key={tx.id}
                  icon={<FolderOpen size={20} className="text-yellow-500" />}
                  title={`${tx.product_count} product${tx.product_count !== 1 ? 's' : ''}`}
                  subtitle={`${formatDate(tx.created_at)}  ${timeAgo(tx.created_at)}`}
                  amount={`$${Number(tx.total).toFixed(2)}`}
                  badge="Sale"
                  badgeClass="bg-green-100 text-green-700"
                />
              ))
            ) : tab === 'inventory' ? (
              inventoryLogs.map(log => (
                <HistoryRow
                  key={log.id}
                  icon={<Package size={20} className="text-primary" />}
                  title={`${log.product_name}${log.variant_name !== log.product_name ? ` — ${log.variant_name}` : ''}`}
                  subtitle={`${formatDate(log.created_at)}  ${timeAgo(log.created_at)}`}
                  amount={`${log.change_amount > 0 ? '+' : ''}${log.change_amount} units`}
                  badge={log.type}
                  badgeClass={
                    log.type === 'OUT'
                      ? 'bg-red-100 text-red-600'
                      : log.type === 'IN' || log.type === 'RESTOCK'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                  }
                />
              ))
            ) : (
              supplyOrders.map(po => (
                <HistoryRow
                  key={po.id}
                  icon={<Truck size={20} className="text-orange-500" />}
                  title={`${po.product_count} product${po.product_count !== 1 ? 's' : ''} — ${po.supplier_name}`}
                  subtitle={`${formatDate(po.created_at)}  ${timeAgo(po.created_at)}`}
                  amount={`$${Number(po.total_cost).toFixed(2)}`}
                  badge={po.status}
                  badgeClass="bg-blue-100 text-blue-700"
                />
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                &laquo; Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-full font-medium transition-colors
                    ${page === p ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span>...</span>}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Next &raquo;
              </button>
            </div>
            <span>{showingFrom}–{showingTo} of {total} results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function HistoryRow({
  icon,
  title,
  subtitle,
  amount,
  badge,
  badgeClass,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  amount: string;
  badge: string;
  badgeClass: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl px-4 py-3 border border-gray-50 hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-bold text-gray-900">{amount}</span>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-4xl mb-3">📋</p>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

export default History;
