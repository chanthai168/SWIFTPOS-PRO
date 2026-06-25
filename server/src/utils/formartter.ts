import type { ProductDetailResponseDTO } from "../types/ProductType.js";
export function formatToProductDetailResponse(rawData: any[]): ProductDetailResponseDTO[] {
  // Group by product_id
  const productMap = new Map<number, any>();
  const variantTracker = new Map<number, Set<number>>();
  rawData.forEach(item => {
    if (!productMap.has(item.product_id)) {
      // Initialize product with empty variants array
      productMap.set(item.product_id, {
        id: item.product_id,
        shop_id: item.shop_id,
        category: {
          id: item.category_id,
          name: item.category
        },
        sku: item.sku,
        name: item.name,
        description: item.description,
        is_active: item.is_active === 1,
        variants: [],
        created_at: item.created_at,
        updated_at: item.updated_at
      });
      variantTracker.set(item.product_id, new Set());
    }
    
    // Add variant if it exists (has variant_id) and if we haven't already seen it
    if (item.variant_id !== null) {
      const product = productMap.get(item.product_id);
      const seenVariants = variantTracker.get(item.product_id)!;
      if (!seenVariants.has(item.variant_id)) {
        seenVariants.add(item.variant_id);
        product.variants.push({
          id: item.variant_id,
          sku: item.sku,
          variant_name: item.variant_name,
          cost_price: parseFloat(item.cost_price),
          selling_price: parseFloat(item.selling_price),
          image: item.image_id ? {
            id: item.image_id,
            image_url: `http://localhost:5000${item.image_url}`,
            file_name: item.file_name
          } : null,
          inventory: {
            id:  item.inventory_id,
            location: item.location,
            quantity_on_hand: item.quantity_on_hand,
            available_quantity: item.available_quantity,
            damaged_quantity: item.damaged_quantity,
            low_stock_threshold: item.low_stock_threshold
          }
        });
      }
    }
  });
  
  return Array.from(productMap.values());
}

// For single product response
function formatSingleProductToDetailResponse(rawData: any[], productId: number): ProductDetailResponseDTO | null {
  const productVariants = rawData.filter(item => item.product_id === productId);
  
  if (productVariants.length === 0) return null;
  
  const firstItem = productVariants[0];
  
  const seenVariantIds = new Set<number>();
  const uniqueVariants = productVariants
    .filter(variant => variant.variant_id !== null)
    .filter(variant => {
      if (seenVariantIds.has(variant.variant_id)) {
        return false;
      }
      seenVariantIds.add(variant.variant_id);
      return true;
    })
    .map(variant => ({
      id: variant.variant_id,
      sku: variant.sku,
      variant_name: variant.variant_name,
      cost_price: parseFloat(variant.cost_price),
      selling_price: parseFloat(variant.selling_price),
      image: variant.image_id ? {
        id: variant.image_id,
        image_url: variant.image_url,
        file_name: variant.file_name
      } : null,
      inventory: {
        id: variant.inventory_id ?? variant.variant_id,
        location: variant.location,
        quantity_on_hand: variant.quantity_on_hand,
        available_quantity: variant.available_quantity,
        damaged_quantity: variant.damaged_quantity,
        low_stock_threshold: variant.low_stock_threshold
      }
    }));

  return {
    id: firstItem.product_id,
    shop_id: firstItem.shop_id,
    category: {
      id: firstItem.category_id,
      name: firstItem.category
    },
    sku: firstItem.sku,
    name: firstItem.name,
    description: firstItem.description,
    is_active: firstItem.is_active === 1,
    variants: uniqueVariants,
    created_at: firstItem.created_at,
    updated_at: firstItem.updated_at
  };
}