import type { CreateProductDTO, CreateProductVariantDTO } from '../types/ProductType.js';

interface RawVariantInput {
  sku: string;
  variant_name: string;
  cost_price: string;
  selling_price: string;
  stock_quantity: string;
  location: string;
  low_stock_threshold: string;
}

export function restructureProductPayload(shopId:number,reqBody: any, reqFiles: any[]): CreateProductDTO {

  // 1. Map and sanitize variants
  const formattedVariants: CreateProductVariantDTO[] = reqBody.variants.map((variant: RawVariantInput, index: number) => {
    
    // Find if an image belongs to this variant index
    // e.g., if imageIndexes is ['0', '2'], index '0' matches reqFiles[0], index '2' matches reqFiles[1]
    const imageFilesIndex = reqBody.imageIndexes ? reqBody.imageIndexes.indexOf(index.toString()) : -1;
    const associatedFile = imageFilesIndex !== -1 ? reqFiles[imageFilesIndex] : null;

    const variantDto: CreateProductVariantDTO = {
      sku: variant.sku,
      variant_name: variant.variant_name,
      cost_price: parseFloat(variant.cost_price) || 0,
      selling_price: parseFloat(variant.selling_price) || 0,
      
      // Structure the inventory object data
      inventory: {
        location: variant.location,
        quantity_on_hand: parseInt(variant.stock_quantity, 10) || 0,
        low_stock_threshold: parseInt(variant.low_stock_threshold, 10) || 0,
      }
    };

    // If an image was uploaded for this specific variant, append it structured
    if (associatedFile) {
      variantDto.image = {
        // Swap backslashes to forward slashes for public URL compatibility
        image_url: `/${associatedFile.path.replace(/\\/g, '/')}`, 
        file_name: associatedFile.filename,
        file_size: associatedFile.size,
        mimetype: associatedFile.mimetype
      };
    }

    return variantDto;
  });

  // 2. Return final clean root product payload
  return {
    shop_id: shopId,
    category_id: parseInt(reqBody.category_id, 10) ,
    sku: reqBody.variants[0]?.sku || '', // Default root SKU fallback or custom rule
    name: reqBody.name,
    description: reqBody.description,
    variants: formattedVariants
  };
}