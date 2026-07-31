import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, PackageCheck, ShieldCheck, ShoppingBag, UserRound } from 'lucide-react';
import { CommerceApiError, getCatalogProduct } from '../../../../src/commerce/server';
import type { ProductDetail } from '../../../../src/commerce/types';
import { getRequestLocale } from '../../../../src/i18n/server';
import { ProductPurchasePanel } from '../../../../src/v2/ProductPurchasePanel';
import styles from '../../../../src/v2/product.module.css';

type Params = Promise<{ slug: string }>;

type Locale = 'id' | 'en';

const copy = {
  id: {
    back: 'Kembali ke katalog',
    signIn: 'Masuk',
    cart: 'Keranjang',
    category: 'Kategori',
    provider: 'Sumber produk',
    providerValue: 'Digiflazz',
    payment: 'Pembayaran',
    paymentValue: 'Midtrans',
    configure: 'Konfigurasikan produk',
    configureCopy:
      'Pilih varian yang tersedia dan periksa data tujuan sebelum transaksi diproses.',
    unavailableTitle: 'Produk belum dapat dibuka',
    unavailableCopy:
      'Storefront tidak mengganti kegagalan backend dengan data produk palsu. Coba kembali setelah layanan pulih.',
  },
  en: {
    back: 'Back to catalog',
    signIn: 'Sign in',
    cart: 'Cart',
    category: 'Category',
    provider: 'Product source',
    providerValue: 'Digiflazz',
    payment: 'Payment',
    paymentValue: 'Midtrans',
    configure: 'Configure the product',
    configureCopy:
      'Choose an available variant and review the destination details before the transaction is processed.',
    unavailableTitle: 'The product cannot be opened yet',
    unavailableCopy:
      'The storefront does not replace backend failures with fabricated product data. Try again after the service recovers.',
  },
} as const;

function productInitial(product: ProductDetail): string {
  return (product.category?.name ?? product.name).trim().slice(0, 2).toUpperCase() || 'DL';
}

async function loadProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await getCatalogProduct(slug);
  } catch (error) {
    if (error instanceof CommerceApiError && error.status === 404) notFound();
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) {
    return {
      title: 'DLavie Commerce',
      description: 'Produk digital DLavie Commerce.',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: product.seo.title ?? `${product.name} — DLavie Commerce`,
    description: product.seo.description ?? product.description.slice(0, 170),
    robots: { index: false, follow: false },
  };
}

export default async function CommerceV2ProductPage({ params }: { params: Params }) {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const product = await loadProduct(slug);
  const t = copy[locale as Locale];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/v2" aria-label="DLavie Commerce">
            <span className={styles.brandMark} aria-hidden="true">
              DL
            </span>
            <span className={styles.brandCopy}>
              <strong>DLavie</strong>
              <small>Commerce v2</small>
            </span>
          </Link>

          <div className={styles.headerActions}>
            <Link href="/account/login">
              <UserRound size={17} aria-hidden="true" /> <span>{t.signIn}</span>
            </Link>
            <Link href="/cart">
              <ShoppingBag size={17} aria-hidden="true" /> <span>{t.cart}</span>
            </Link>
          </div>
        </div>
      </header>

      {product ? (
        <main className={styles.shell}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/v2">{t.back}</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span>{product.category?.name ?? 'Digital'}</span>
            <ChevronRight size={13} aria-hidden="true" />
            <span>{product.name}</span>
          </nav>

          <div className={styles.productGrid}>
            <section className={styles.visual} aria-labelledby="v2-product-title">
              <div className={styles.visualTop}>
                <span>DLavie Commerce</span>
                <span>{product.variants.length} SKU</span>
              </div>

              <div className={styles.visualBody}>
                <span className={styles.visualGlyph} aria-hidden="true">
                  {productInitial(product)}
                </span>
                <h1 id="v2-product-title">{product.name}</h1>
                <p>{product.description}</p>
              </div>

              <div className={styles.visualFooter}>
                <div>
                  <small>{t.category}</small>
                  <strong>{product.category?.name ?? 'Digital'}</strong>
                </div>
                <div>
                  <small>{t.provider}</small>
                  <strong>{t.providerValue}</strong>
                </div>
                <div>
                  <small>{t.payment}</small>
                  <strong>{t.paymentValue}</strong>
                </div>
                <div>
                  <small>Status</small>
                  <strong>{product.variants.some((variant) => variant.availableQuantity > 0) ? 'Ready' : 'Unavailable'}</strong>
                </div>
              </div>
            </section>

            <section className={styles.content} aria-labelledby="v2-configure-title">
              <div className={styles.contentIntro}>
                <p>DLavie Commerce v2</p>
                <h2 id="v2-configure-title">{t.configure}</h2>
                <p>{t.configureCopy}</p>
              </div>
              <ProductPurchasePanel locale={locale as Locale} product={product} />
            </section>
          </div>
        </main>
      ) : (
        <main className={styles.serviceState}>
          <div>
            <ShieldCheck size={32} aria-hidden="true" />
            <h1>{t.unavailableTitle}</h1>
            <p>{t.unavailableCopy}</p>
            <Link href="/v2">
              <PackageCheck size={16} aria-hidden="true" /> {t.back}
            </Link>
          </div>
        </main>
      )}
    </div>
  );
}
