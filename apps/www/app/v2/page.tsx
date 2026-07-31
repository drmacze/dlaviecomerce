import type { Metadata } from 'next';
import { getCatalogCategories, getCatalogProducts } from '../../src/commerce/server';
import type { CatalogCategory, CatalogProduct } from '../../src/commerce/types';
import { getRequestLocale } from '../../src/i18n/server';
import { StorefrontV2 } from '../../src/v2/StorefrontV2';

export const metadata: Metadata = {
  title: 'DLavie Commerce v2',
  description: 'Preview fondasi baru DLavie Commerce.',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CommerceV2Page({ searchParams }: { searchParams: SearchParams }) {
  const [locale, params] = await Promise.all([getRequestLocale(), searchParams]);
  const query = single(params.q)?.trim();
  const category = single(params.category)?.trim();

  let categories: CatalogCategory[] = [];
  let products: CatalogProduct[] = [];
  let totalProducts = 0;
  let serviceUnavailable = false;

  try {
    const [categoryResult, productResult] = await Promise.all([
      getCatalogCategories(),
      getCatalogProducts({ page: 1, limit: 12, query, category }),
    ]);
    categories = categoryResult;
    products = productResult.data;
    totalProducts = productResult.pagination.total;
  } catch {
    serviceUnavailable = true;
  }

  return (
    <StorefrontV2
      locale={locale}
      categories={categories}
      products={products}
      totalProducts={totalProducts}
      query={query}
      category={category}
      serviceUnavailable={serviceUnavailable}
    />
  );
}
