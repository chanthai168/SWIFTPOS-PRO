import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../services/productServices";
import { useUser } from "../../context/Context";
import type { ProductDetailResponseDTO,ProductVariantResponseDTO } from "../../types/product";
import ProductDetailModal from "./ProductDetailModel";
interface ProductGridProp{
  fetchMetadata:()=>any
}

const ProductGrid: React.FC<ProductGridProp> = ({fetchMetadata}) => {
  const [data, setData] = useState<ProductDetailResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { shop } = useUser();

  const getProductWithVariants = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductWithVariants(
        shop?.id as number,
        'cost_price',
        'DESC'
      );
      setData(response.data);
      console.log(response.data);
      setError(null);
    } catch (error) {
      console.log(error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductWithVariants();
  }, []);
  
  const categories = ["all", ...new Set(data.map(product => product.category.name))];

  // Filter products based on search and category
  const filteredProducts = data.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.variants[0]?.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(()=>{
      data.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  },[data])

  // Calculate total inventory value
  const totalInventoryValue = data.reduce((total, product) => {
    return total + product.variants.reduce((productTotal, variant) => {
      return productTotal + (variant.inventory?.quantity_on_hand || 0) * variant.cost_price;
    }, 0);
  }, 0);

  // Get low stock products
  const lowStockProducts = data.filter(product =>
    product.variants.some(variant =>
      variant.inventory && variant.inventory.quantity_on_hand <= variant.inventory.low_stock_threshold
    )
  );

  const selectedProduct = selectedProductId ? data.find((p) => p.id === selectedProductId) ?? null : null;

  const handleProductClick = (product: ProductDetailResponseDTO) => {
    setSelectedProductId(product.id);
    setShowModal(true);
  };

  const getStockStatus = (variant: ProductVariantResponseDTO) => {
    if (!variant.inventory) return "No Inventory";
    const { quantity_on_hand, low_stock_threshold } = variant.inventory;
    if (quantity_on_hand === 0) return "Out of Stock";
    if (quantity_on_hand <= low_stock_threshold) return "Low Stock";
    return "In Stock";
  };

  const getStockColor = (variant: ProductVariantResponseDTO) => {
    const status = getStockStatus(variant);
    switch (status) {
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "In Stock":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={getProductWithVariants}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-layer2 rounded-md mx-4 ">

      {/* Filters */}
      <div className="  sm:px-6  lg:px-8 py-6">
        <div className="rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className=" flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className=" rounded-lg  hover:scale-102  transition-all duration-200 ease-in-out cursor-pointer overflow-hidden"
              >
                {/* Product Image */}
                <div className="h-48 bg-gray-100 relative flex items-center justify-center rounded-lg">
                  {product.variants[0]?.image ? (
                    <img
                      src={product.variants[0].image.image_url}
                      alt={product.name}
                      className=" h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {!product.is_active && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Inactive
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 h-full bg-gray-100 rounded-lg mt-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category.name}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">SKU: {product.variants[0]?.sku}</p>
                  
                  {/* Variants Preview */}
                  <div className="mt-3 space-y-2">
                    {product.variants.slice(0, 1).map((variant) => (
                      <div key={variant.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{variant.variant_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            ${variant.selling_price.toFixed(2)}
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(variant)}`}>
                            {getStockStatus(variant)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {product.variants.length > 2 && (
                      <p className="text-xs text-blue-600">+{product.variants.length - 1} more variants</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {/* {showModal && selectedProduct && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg  shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="sticky top-0 bg-white border-b-4 border-primary px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex justify-center items-center bg-gray-100 rounded-lg">
                  {selectedProduct.variants[0]?.image ? (
                    <img
                      src={selectedProduct.variants[0].image.image_url}
                      alt={selectedProduct.name}
                      className="h-68 object-cover rounded-lg " 
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{selectedProduct.category.name}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">SKU</p>
                    <p className="font-medium">{selectedProduct.sku}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700">{selectedProduct.description}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${selectedProduct.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedProduct.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm">{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button><Settings/></button>
              </div>


              <div>
                <h3 className="text-xl font-semibold mb-4">Variants</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 border-collapse divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 ">
                      {selectedProduct.variants.map((variant) => (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td><div className=" flex items-center w-22 h-22 justify-center border border-gray-300 p-1 m-2 rounded-sm"><img src={variant.image?.image_url} alt="" className="h-20 " /></div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {variant.variant_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {variant.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${variant.cost_price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${variant.selling_price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {variant.inventory?.quantity_on_hand || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(variant)}`}>
                              {getStockStatus(variant)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedProduct.variants[0]?.inventory && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Inventory Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedProduct.variants[0].inventory.location}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Available Quantity</p>
                      <p className="font-medium">{selectedProduct.variants[0].inventory.available_quantity}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Damaged Quantity</p>
                      <p className="font-medium">{selectedProduct.variants[0].inventory.damaged_quantity}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Low Stock Threshold</p>
                      <p className="font-medium">{selectedProduct.variants[0].inventory.low_stock_threshold}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}
        {showModal && selectedProduct && (
        <ProductDetailModal
            selectedProduct={selectedProduct}
            onClose={() => setShowModal(false)}
            getStockStatus={getStockStatus}
            getStockColor={getStockColor}
            setData={setData}
            reFetch={getProductWithVariants}
            fetchMetadata={fetchMetadata}
            
        />
        )}
    </div>
  );
};

export default ProductGrid;