import { getProductByHandle } from '../../../../packages/storecraft-framework/src/lib/shopify/api';
import { resolveTemplate } from '../../../../packages/storecraft-framework/src/lib/theme';

export default async function ProductPage({ params }: { params: { handle: string } }) {
  // Get product data from Shopify
  const product = await getProductByHandle(params.handle);
  
  // Resolve the template from the active theme
  const ProductTemplate = await resolveTemplate('Product');
  
  // Pass data to the template
  return <ProductTemplate product={product} />;
}
