import LowStockList from "../components/forcasting/LowstockList";
import ItemsRanking from "../components/forcasting/ItemsRanking";
import SaleAnalyticChart from "../components/forcasting/SaleAnalyticChart";
const InventoryReport: React.FC = () => {
    return(
      <>
      
      <div className=" bg-layer2 my-page-scroll-container overflow-y-auto h-screen">
      <div className=" flex justify-between px-4 py-2 items-center ">
        <div className="max-w-7xl  py-2">
          <h1 className="text-xl font-bold text-gray-900">Report and Forcasting</h1>
          <p className=" text-sm text-gray-600">Your overview for today.</p>
        </div>
      </div>

      <div className=" bg-layer3 rounded-4xl">
        <div className=" p-4">
          <SaleAnalyticChart/>
        </div>
        
        <div className=" flex gap-4 p-4 pt-0 flex-col md:flex-row">
          <div className="w-full md:w-[50%] overflow-y-scroll overflow-x-hidden" style={{maxHeight:'1200px',minHeight:"100%"}}>
            <LowStockList/>
          </div>
          <div className="w-full md:w-[50%]  overflow-y-scroll overflow-x-hidden" style={{maxHeight:'1200px',minHeight:"100%"}}>
            <ItemsRanking/>
          </div>
        </div>
      </div>
      </div>
      
      
      </>

    )
}
export default InventoryReport;