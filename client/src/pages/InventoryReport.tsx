import LowStockList from "../components/forcasting/LowstockList";
import ItemsRanking from "../components/forcasting/ItemsRanking";
const InventoryReport: React.FC = () => {
    return(
      <>
      <div className="bg-layer2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Report & Forcasting</h1>
          <p className="mt-1 text-sm text-gray-600">Here is your over view for today.</p>
        </div>
      </div>
      <div className=" flex gap-4 p-4 flex-col md:flex-row">
        <div className="w-full md:w-[50%] overflow-scroll" style={{height:'1200px'}}>
          <LowStockList/>
        </div>
        <div className="w-full md:w-[50%] overflow-scroll" style={{height:'1200px'}}>
          <ItemsRanking/>
        </div>
      </div>

      
      </>

    )
}
export default InventoryReport;