import { useState } from "react";
import SupplierList from "../components/supplier/SupplierList";
import PurchaseOrderList from "../components/purchaseOrder/PurchaseOrderList";

const TABS = [
  { key: "suppliers", label: "Suppliers" },
  { key: "purchase-orders", label: "Purchase Orders" },
] as const;

type TabKey = typeof TABS[number]["key"];

const Supplier: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("suppliers");

    return(
      <>
      <div className='bg-layer2'>
      <div >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-bold text-gray-900">Supply Chain</h1>
          <p className="mt-1 text-sm text-gray-600">Manage suppliers and purchase orders</p>

          <div className="mt-4 flex gap-1 border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 bg-layer1 min-h-150 rounded-t-4xl ">
        {activeTab === "suppliers" && <SupplierList />}
        {activeTab === "purchase-orders" && <PurchaseOrderList />}
      </div>
      </div>
      </> 
    )
}
export default Supplier;