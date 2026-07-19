import ProductGrid from "../components/inventory/ProductGrid";
import { productService } from "../services/productServices";
import type { InventoryMetadata } from "../types/product";
import { useState,useEffect } from "react";
import { useUser } from "../context/Context";
import { Link } from "react-router-dom";

import { 
  Star, 
  PackageSearch,
  HandCoins,
  Activity,

} from 'lucide-react';

const lowIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 16 16">
	<path d="M0 0h16v16H0z" fill="none" />
	<path fill="currentColor" d="M8 1c1.08 0 2.11.215 3.05.604l.008.003l.004.002c1.94.807 3.5 2.36 4.31 4.29l.016.03q.008.022.012.043a8 8 0 0 1 .005 6.03q-.006.03-.017.058q-.013.029-.03.055a8 8 0 0 1-.287.611l-.056.085a.5.5 0 0 1-.827-.552l.063-.13l-1.36-.565a.5.5 0 1 1 .381-.923l1.37.566a6.98 6.98 0 0 0-.002-4.42l-1.37.566a.5.5 0 1 1-.381-.924l1.36-.565a7 7 0 0 0-3.12-3.12l-.565 1.37a.5.5 0 0 1-.924-.382l.565-1.37a7 7 0 0 0-4.42 0l.568 1.37a.499.499 0 1 1-.924.382l-.568-1.37a7.06 7.06 0 0 0-3.13 3.13l1.37.57a.5.5 0 0 1-.382.923l-1.37-.569a7 7 0 0 0-.315 2.961l-.931.573a7.998 7.998 0 0 1 7.89-9.32z" />
	<path fill="currentColor" d="M7.05 7.23a1.996 1.996 0 0 1 2.7.836c.515.977.141 2.19-.836 2.7a2 2 0 0 1-2.11-.152l-5.25 2.34a.5.5 0 0 1-.092.031q.023-.006.046-.016a.499.499 0 0 1-.42-.897l4.9-3.02a2.01 2.01 0 0 1 1.06-1.83z" />
</svg>
;
const emptyIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 256 256">
	<path d="M0 0h256v256H0z" fill="none" />
	<g fill="currentColor">
		<path d="M216 128a88 88 0 1 1-88-88a88 88 0 0 1 88 88" opacity=".2" />
		<path d="m198.24 62.63l15.68-17.25a8 8 0 0 0-11.84-10.76L186.4 51.86A95.95 95.95 0 0 0 57.76 193.37l-15.68 17.25a8 8 0 1 0 11.84 10.76l15.68-17.24A95.95 95.95 0 0 0 198.24 62.63M48 128a80 80 0 0 1 127.6-64.25l-107 117.73A79.63 79.63 0 0 1 48 128m80 80a79.55 79.55 0 0 1-47.6-15.75l107-117.73A79.95 79.95 0 0 1 128 208" />
	</g>
</svg>
;
const uploadIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
		<path stroke-linejoin="round" d="M12 15V2m0 0l3 3.5M12 2L9 5.5" />
		<path d="M8 22h8c2.828 0 4.243 0 5.121-.878C22 20.242 22 18.829 22 16v-1c0-2.828 0-4.242-.879-5.121c-.768-.768-1.946-.865-4.121-.877m-10 0c-2.175.012-3.353.109-4.121.877C2 10.758 2 12.172 2 15v1c0 2.829 0 4.243.879 5.122c.3.3.662.497 1.121.627" />
	</g>
</svg>
;

const Inventory: React.FC = () => {
    const [data, setMetadata] = useState<InventoryMetadata>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {shop} = useUser();

    const fetchMetadata = async () => {
      try{
        const res = await productService.getInventoryMetadata(shop?.id as number);
        setMetadata(res);
        console.log(res);
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
    return(
      <>
      <div className=" bg-layer2 my-page-scroll-container overflow-y-auto h-screen">
        
      <div className=" flex justify-between px-4 py-2 items-center ">
        <div className="max-w-7xl  py-2">
          <h1 className="text-xl font-bold text-gray-900">Product Catalog</h1>
          <p className=" text-sm text-gray-600">Manage and track your inventory</p>
        </div>
        <Link to='/upload' className=" px-4 py-2 rounded-4xl font-medium bg-gray-200  text-gray-600  active:scale-90  ease-in-out flex items-center gap-2">{uploadIcon}Upload product</Link>
      </div>


        <div className="bg-layer1 rounded-4xl pb-4">
          <div className="flex flex-wrap p-2">
            {/* Top row - 2 cards */}
            <div className="w-full sm:w-1/2 md:w-1/5 p-1.5">
              <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full w-12 h-12 bg-purple-100 text-purple-500">
                    <PackageSearch />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">Total product</p>
                </div>
                <div className="flex justify-between pl-2 items-center mt-4">
                  <p className="text-2xl font-medium text-gray-600">{data?.data.total_product}</p>
                  <p className="font-semibold text-gray-500">Items</p>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-1/2 md:w-1/5 p-1.5">
              <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full w-12 h-12 bg-blue-100 text-blue-500">
                    <HandCoins />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">Inventory values</p>
                </div>
                <div className="flex justify-between pl-2 items-center mt-4">
                  <p className="text-2xl font-medium text-gray-600">
                    ${Number(data?.data.total_selling_price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom row - 3 cards */}
            <div className="w-full sm:w-1/3 md:w-1/5 p-1.5">
              <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full w-12 h-12 bg-green-100 text-green-500">
                    <Activity />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">In stock</p>
                </div>
                <div className="flex justify-between pl-2 items-center mt-4">
                  <p className="text-2xl font-medium text-gray-600">{data?.data.in_stock}</p>
                  <p className="font-semibold text-gray-500">Items</p>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-1/3 md:w-1/5 p-1.5">
              <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full w-12 h-12 bg-orange-100 text-orange-500">
                    {lowIcon}
                  </div>
                  <p className="text-lg font-semibold text-gray-600">Low stock</p>
                </div>
                <div className="flex justify-between pl-2 items-center mt-4">
                  <p className="text-2xl font-medium text-gray-600">{data?.data.low_stock}</p>
                  <p className="font-semibold text-gray-500">Items</p>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-1/3 md:w-1/5 p-1.5">
              <div className="bg-layer2 border border-white p-4 rounded-4xl transition-all duration-300 h-full hover:shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-full w-12 h-12 bg-red-100 text-red-500">
                    {emptyIcon}
                  </div>
                  <p className="text-lg font-semibold text-gray-600">Out stock</p>
                </div>
                <div className="flex justify-between pl-2 items-center mt-4">
                  <p className="text-2xl font-medium text-gray-600">{data?.data.out_of_stock}</p>
                  <p className="font-semibold text-gray-500">Items</p>
                </div>
              </div>
            </div>
          </div>

          <ProductGrid fetchMetadata={fetchMetadata}/>
          </div>
        </div>
      </>

    )
}
export default Inventory;