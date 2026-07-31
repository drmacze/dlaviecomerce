import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Box, Check, PackageCheck, Truck } from 'lucide-react';
import { AddToCartButton } from '../../../src/components/commerce/AddToCartButton';
import { CommerceHeader } from '../../../src/components/commerce/CommerceHeader';
import { formatIdr } from '../../../src/commerce/format';
import { CommerceApiError, getCatalogProduct } from '../../../src/commerce/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getCatalogProduct(slug);
    return {
      title: product.seo.title ?? `${product.name} — DLavie Commerce`,
      description: product.seo.description ?? product.description.slice(0, 160),
      openGraph: {
        title: product.seo.title ?? product.name,
        description: product.seo.description ?? product.description.slice(0, 160),
        images: product.images[0]?.url ? [product.images[0].url] : [],
      },
    };
  } catch {
    return {
      title: 'Produk — DLavie Commerce',
      robots: { index: false, follow: false },
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const product = await getCatalogProduct(slug);
    const primaryImage = product.images[0];

    return (
      <div className="commerce-page">
        <CommerceHeader />
        <main className="commerce-shell commerce-shell--product">
          <Link className="commerce-back-link" href="/shop">
            <ArrowLeft size={17} aria-hidden="true" /> Kembali ke katalog
          </Link>

          <article className="commerce-product-detail">
            <section className="commerce-product-gallery" aria-label={`Gambar ${product.name}`}>
              <div className="commerce-product-gallery__primary">
                {primaryImage ? (
                  <img src={primaryImage.url} alt={primaryImage.altText} />
                ) : (
                  <div className="commerce-product-gallery__empty">Gambar belum tersedia</div>
                )}
              </div>
              {product.images.length > 1 ? (
                <div className="commerce-product-gallery__thumbs">
                  {product.images.slice(1).map((image) => (
                    <div key={image.id} className="commerce-product-gallery__thumb">
                      <img src={image.url} alt={image.altText} loading="lazy" />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="commerce-product-detail__content">
              <p className="commerce-eyebrow">{product.category?.name ?? 'DLavie'}</p>
              <h1>{product.name}</h1>
              <p className="commerce-product-detail__description">{product.description}</p>

              <div className="commerce-product-facts">
                <div>
                  {product.requiresShipping ? (
                    <Truck size={19} aria-hidden="true" />
                  ) : (
                    <PackageCheck size={19} aria-hidden="true" />
                  )}
                  <span>
                    <strong>{product.requiresShipping ? 'Produk fisik' : 'Produk digital'}</strong>
                    <small>
                      {product.requiresShipping
                        ? 'Memerlukan alamat dan metode pengiriman.'
                        : 'Tidak memerlukan pengiriman fisik.'}
                    </small>
                  </span>
                </div>
                <div>
                  <Box size={19} aria-hidden="true" />
                  <span>
                    <strong>{product.variants.length} varian aktif</strong>
                    <small>Harga dan stok diperiksa langsung dari sistem.</small>
                  </span>
                </div>
              </div>

              <div className="commerce-variants" aria-labelledby="variant-heading">
                <div className="commerce-variants__heading">
                  <h2 id="variant-heading">Pilih varian</h2>
                  <p>SKU, harga, dan stok dapat berbeda pada setiap varian.</p>
                </div>

                {product.variants.length > 0 ? (
                  product.variants.map((variant) => (
                    <section className="commerce-variant-card" key={variant.id}>
                      <div className="commerce-variant-card__top">
                        <div>
                          <p className="commerce-variant-card__sku">SKU {variant.sku}</p>
                          <h3>{variant.name}</h3>
                        </div>
                        <div className="commerce-variant-card__price">
                          {variant.compareAtAmount ? (
                            <del>{formatIdr(variant.compareAtAmount)}</del>
                          ) : null}
                          <strong>{formatIdr(variant.priceAmount)}</strong>
                        </div>
                      </div>

                      {Object.keys(variant.attributes).length > 0 ? (
                        <dl className="commerce-variant-attributes">
                          {Object.entries(variant.attributes).map(([key, value]) => (
                            <div key={key}>
                              <dt>{key}</dt>
                              <dd>{value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}

                      <div className="commerce-variant-card__stock">
                        {variant.availableQuantity > 0 ? (
                          <>
                            <Check size={16} aria-hidden="true" />
                            <span>{variant.availableQuantity} tersedia</span>
                          </>
                        ) : (
                          <span>Stok habis</span>
                        )}
                      </div>

                      <AddToCartButton
                        variantId={variant.id}
                        availableQuantity={variant.availableQuantity}
                      />
                    </section>
                  ))
                ) : (
                  <div className="commerce-empty commerce-empty--compact">
                    <h2>Belum ada varian aktif</h2>
                    <p>Produk ini belum dapat dibeli sampai varian tersedia.</p>
                  </div>
                )}
              </div>
            </section>
          </article>
        </main>
      </div>
    );
  } catch (error) {
    if (error instanceof CommerceApiError && error.status === 404) notFound();
    throw error;
  }
}
