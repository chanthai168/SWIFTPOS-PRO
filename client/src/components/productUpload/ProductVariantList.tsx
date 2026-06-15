import React from 'react';

interface ProductVariant {
  id: number;
  product_id: number;
  product_image_id: number;
  variant_name: string;
  sku: string;
  cost_price: string;
  selling_price: string;
  image_url: string;
  file_name: string;
  shop_id: number;
  created_at: string;
  updated_at: string;
}

interface ProductVariantListProps {
  variants: ProductVariant[];
  onEdit?: (variant: ProductVariant) => void;
  onDelete?: (id: number) => void;
}

const ProductVariantList: React.FC<ProductVariantListProps> = ({
  variants,
  onEdit,
  onDelete,
}) => {

  return (
    <div className="space-y-4">
      {variants.map((variant, index) => {
        const cost = parseFloat(variant.cost_price);
        const selling = parseFloat(variant.selling_price);
        const profit = (selling - cost).toFixed(2);
        const margin = cost > 0 ? ((selling - cost) / cost * 100).toFixed(1) : '0';
        return (
          <div
            key={`${variant.id}-${variant.sku}-${index}`}
            className=" mb-2 group flex items-center gap-2 bg-blue-white border-t  hover:bg-gray-50  border-gray-200  p-3 transition-all duration-200  hover:shadow-sm"
          >
            {/* Product Image */}
            
            <div className="h-20 flex-shrink-0 border border-gray-200 overflow-hidden   ">
              <img
                src={variant.image_url}
                alt={variant.variant_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Variant Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg text-gray-800 truncate">
                  {variant.variant_name}
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                SKU: {variant.sku}
              </p>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {/* Cost Price */}
              <div className=' hidden md:block'>
                <p className="text-xs uppercase  tracking-widest text-gray-500 mb-1">Cost Price</p>
                <p className="text-lg font-medium text-gray-700">
                  ${cost.toFixed(2)}
                </p>
              </div>

              {/* Selling Price */}
              <div className=' hidden md:block'>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Selling Price</p>
                <p className="text-xl font-meduim text-green-600">
                  ${selling.toFixed(2)}
                </p>
              </div>

              {/* Profit */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Profit</p>
                <div className="flex flex-col items-center">
                  <p className="text-xl font-meduim text-emerald-600">
                    ${profit}
                  </p>
                  <span className="text-sm text-emerald-500 font-medium">
                    ({margin}%)
                  </span>
                </div>
              </div>
            </div>

          </div>
        );
      })}

      {variants.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No variants found
        </div>
      )}
    </div>
  );
};

export default ProductVariantList;