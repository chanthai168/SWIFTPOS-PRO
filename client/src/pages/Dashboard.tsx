import { useState,useEffect } from "react";
import SaleAnalyticChart from "../components/dashboard/SaleAnalyticChart";
import ItemsRanking from "../components/dashboard/ItemsRanking";
import RecentActivity from "../components/dashboard/RecentActivity";
import { useUser } from "../context/Context";
import { statsService } from "../services/statsService";
import { 
  Star, 
  PackageSearch,
  HandCoins,
  Activity,

} from 'lucide-react';
interface dashboardStats {
  revenue:number,
  lowStockItem:number,
  IventoryValues:number,
  totalOrder:number,
}
const lowIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 16 16">
	<path d="M0 0h16v16H0z" fill="none" />
	<path fill="currentColor" d="M8 1c1.08 0 2.11.215 3.05.604l.008.003l.004.002c1.94.807 3.5 2.36 4.31 4.29l.016.03q.008.022.012.043a8 8 0 0 1 .005 6.03q-.006.03-.017.058q-.013.029-.03.055a8 8 0 0 1-.287.611l-.056.085a.5.5 0 0 1-.827-.552l.063-.13l-1.36-.565a.5.5 0 1 1 .381-.923l1.37.566a6.98 6.98 0 0 0-.002-4.42l-1.37.566a.5.5 0 1 1-.381-.924l1.36-.565a7 7 0 0 0-3.12-3.12l-.565 1.37a.5.5 0 0 1-.924-.382l.565-1.37a7 7 0 0 0-4.42 0l.568 1.37a.499.499 0 1 1-.924.382l-.568-1.37a7.06 7.06 0 0 0-3.13 3.13l1.37.57a.5.5 0 0 1-.382.923l-1.37-.569a7 7 0 0 0-.315 2.961l-.931.573a7.998 7.998 0 0 1 7.89-9.32z" />
	<path fill="currentColor" d="M7.05 7.23a1.996 1.996 0 0 1 2.7.836c.515.977.141 2.19-.836 2.7a2 2 0 0 1-2.11-.152l-5.25 2.34a.5.5 0 0 1-.092.031q.023-.006.046-.016a.499.499 0 0 1-.42-.897l4.9-3.02a2.01 2.01 0 0 1 1.06-1.83z" />
</svg>
;
const moneyIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
		<path d="M3.172 20.828C4.343 22 6.229 22 10 22h4c3.771 0 5.657 0 6.828-1.172S22 17.771 22 14c0-1.17 0-2.158-.035-3m-1.137-3.828C19.657 6 17.771 6 14 6h-4C6.229 6 4.343 6 3.172 7.172S2 10.229 2 14c0 1.17 0 2.158.035 3M12 2c1.886 0 2.828 0 3.414.586S16 4.114 16 6M8.586 2.586C8 3.172 8 4.114 8 6" />
		<path d="M12 17.333c1.105 0 2-.746 2-1.666S13.105 14 12 14s-2-.746-2-1.667c0-.92.895-1.666 2-1.666m0 6.666c-1.105 0-2-.746-2-1.666m2 1.666V18m0-8v.667m0 0c1.105 0 2 .746 2 1.666" />
	</g>
</svg>

const orderIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 32 32">
	<path d="M0 0h32v32H0z" fill="none" />
	<path fill="currentColor" d="M15 9v2h3V9zm0-6v2h3V3zm8 0h-3v2h3v4h-3v2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M13 5V3h-3c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h3V9h-3V5zm11 21c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m-14 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2M29.2 7l-2.3 10.2c-.1.5-.5.8-1 .8H8l.8 4H26v2H8c-.5 0-.9-.3-1-.8L3.2 4H0V2h4c.5 0 .9.3 1 .8L7.6 16h17.6l2-9z" />
</svg>
;

function Dashboard() {

    const [data, setMetadata] = useState<dashboardStats>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {shop,userInfo} = useUser();

    const fetchMetadata = async () => {
      try{
        const res = await statsService.getDashboardStats(shop?.id as number);
        setMetadata(res.data);
      }
      catch(error){
        setError("Can't fetch metadata");
        console.log(error);
      }
      finally{
        setLoading(false);
      }
    }
    useEffect(()=>{
      fetchMetadata();
    },[])

  return (
    <>
    <div className=" bg-layer2">
        <div className=" p-4 ">
          <h2 className=" text-2xl font-bold">Hello {userInfo?.name} !</h2>
          <p>Here's your overview for today.</p>
        </div>

        <div className=" bg-layer1 rounded-4xl">
        <div className="flex flex-wrap p-2 pb-0 ">
          {/* Top row - 2 cards */}
          <div className="w-full sm:w-1/2 md:w-1/4 p-2">
            <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full w-12 h-12 bg-amber-100 text-amber-500">
                  {moneyIcon}
                </div>
                <p className="text-lg font-semibold text-gray-600">Revenue</p>
              </div>
              <div className="flex justify-between pl-2 items-center mt-4">
                <p className="text-2xl font-medium text-gray-600">${data?.revenue}</p>
               
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 md:w-1/4 p-2">
            <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full w-12 h-12 bg-blue-100 text-blue-500">
                  <HandCoins />
                </div>
                <p className="text-lg font-semibold text-gray-600">Inventory values</p>
              </div>
              <div className="flex justify-between pl-2 items-center mt-4">
                <p className="text-2xl font-medium text-gray-600">
                  ${Number(data?.IventoryValues).toFixed(2)}
                </p>
              </div>
            </div>
          </div>


                    {/* Bottom row - 3 cards */}
          <div className="w-full sm:w-1/3 md:w-1/4 p-2">
            <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full w-12 h-12 bg-lime-100 text-lime-500">
                  {orderIcon}
                </div>
                <p className="text-lg font-semibold text-gray-600">Total order</p>
              </div>
              <div className="flex justify-between pl-2 items-center mt-4">
                <p className="text-2xl font-medium text-gray-600">{data?.totalOrder}</p>
                <p className="font-semibold text-gray-500">order</p>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/3 md:w-1/4 p-2">
            <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center rounded-full w-12 h-12 bg-orange-100 text-orange-500">
                  {lowIcon}
                </div>
                <p className="text-lg font-semibold text-gray-600">Total Low stock item</p>
              </div>
              <div className="flex justify-between pl-2 items-center mt-4">
                <p className="text-2xl font-medium text-gray-600">{data?.lowStockItem}</p>
                <p className="font-semibold text-gray-500">Item</p>
              </div>
            </div>
          </div>


        </div>
      <div className=" flex flex-col md:flex-row gap-4 p-4 pt-2">
        <div className=" md:w-[60%]">
          <SaleAnalyticChart/>
        </div>
        <div className=" md:w-[40%] overflow-hidden">
          <ItemsRanking/>
        </div>
      </div>

      <h2 className=" pt-4 pb-2 pl-4 text-lg font-semibold">Recent activities</h2>
        <RecentActivity/>
      </div>
      </div>
    </>
    
  )
}

export default Dashboard;
