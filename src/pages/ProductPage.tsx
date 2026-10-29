import { useState } from 'react';
import { LuArrowRight, LuShoppingBag } from 'react-icons/lu';
import { brand, whatsappLink } from '../config/brand';
import { useCart } from '../context/CartContext';
import { getCollection, productTypeLabels } from '../data/collections';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link, useParams } from '../router/router';
import { getContents, getPackQuantity, getProductBySlug, getRelatedProducts, isPurchasable, shopUrl } from '../utils/catalogue';
import { formatPrice } from '../utils/format';
import { unitPrice } from '../utils/cart';
import { ProductImage, viewsFor, type ArtView } from '../components/art/ProductArt';
import { ProductGrid } from '../components/product/ProductCard';
import { QuantitySelector } from '../components/product/QuantitySelector';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { Notice } from '../components/ui/Placeholder';
import { BonusGiftNote } from '../components/collectible/BonusGift';
import { CollectibleRows, DuoDetails, MysteryPackDetails, SecretMessageDetails } from '../components/collectible/ProductExtras';
import { RarityBadge } from '../components/collectible/RarityBadge';

const viewNames: Record<ArtView, string> = { main: 'Product', detail: 'Close-up', context: 'In use' };

export function ProductPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug ?? '');
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [viewIndex, setViewIndex] = useState(0);
  // Default size: A4 if offered, otherwise the first size. Undefined for products without sizes.
  const [variantId, setVariantId] = useState<string | undefined>(
    product?.variants?.find((v) => v.id === 'a4')?.id ?? product?.variants?.[0]?.id,
  );
  usePageMeta(product ? product.name : 'Product not found', product?.shortDescription);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="We couldn’t find that product."
          body="It may have been renamed or removed from the demo catalogue."
          action={
            <Link to="/shop" className="btn-primary">
              Back to the shop
            </Link>
          }
        />
      </div>
    );
  }

  const purchasable = isPurchasable(product);
  const typeLabel = productTypeLabels[product.productType];
  const contents = getContents(product);
  const packQty = getPackQuantity(product);
  const views = product.images?.length ? product.images.map((_, i) => i) : viewsFor(product);
  const related = getRelatedProducts(product, 4);
  const specs = [
    { label: 'Size', value: product.dimensions },
    { label: 'Material', value: product.material },
    { label: 'Finish', value: product.finish },
  ];
  const hasSpecs = specs.some((s) => s.value);
  const price = unitPrice(product, variantId);
  const interest = whatsappLink(`Hi! I’d be interested in "${product.name}" when it’s available.`);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: product.category === 'posters' ? 'Posters' : 'Stickers', to: shopUrl({ category: product.category }) },
          { label: typeLabel.plural, to: shopUrl({ types: [product.productType] }) },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-[var(--radius-card)] border-2 border-ink">
            {typeof views[viewIndex] === 'number' ? (
              <ProductImage product={product} index={views[viewIndex] as number} className="aspect-square w-full" />
            ) : (
              <ProductImage product={product} view={views[viewIndex] as ArtView} className="aspect-square w-full" />
            )}
          </div>
          {views.length > 1 && (
            <div className="mt-3 flex gap-3" role="group" aria-label="Product images">
              {views.map((v, i) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setViewIndex(i)}
                  aria-pressed={viewIndex === i}
                  aria-label={`Show ${typeof v === 'number' ? `photo ${i + 1}` : viewNames[v].toLowerCase()} image`}
                  className={`size-20 overflow-hidden rounded-xl border-2 transition-colors ${viewIndex === i ? 'border-ink' : 'border-ink/15 hover:border-ink/50'}`}
                >
                  {typeof v === 'number' ? (
                    <ProductImage product={product} index={v} className="size-full" />
                  ) : (
                    <ProductImage product={product} view={v} className="size-full" />
                  )}
                </button>
              ))}
            </div>
          )}
          {!product.images?.length && <p className="mt-3 text-xs text-ink-soft">Illustrations are demo artwork. Real product photos will replace them after sampling.</p>}
        </div>

        {/* Details */}
        <div>
          <p className="eyebrow flex flex-wrap items-center gap-2">
            <span>
              {typeLabel.singular}
              {packQty ? ` · ${packQty} ${product.category === 'posters' ? 'prints' : 'stickers'}` : ''}
            </span>
            {(product.rarity === 'rare' || product.rarity === 'limited') && <RarityBadge rarity={product.rarity} showDemo />}
          </p>
          <h1 className="mt-2 text-5xl leading-[0.95] font-extrabold md:text-6xl">{product.name}</h1>
          <p className="mt-4 font-display text-4xl font-extrabold" aria-live="polite">
            {formatPrice(price)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">Test price — may change before launch.</p>

          <p className="mt-6 text-lg leading-relaxed">{product.description}</p>

          {product.collections.map((c) => getCollection(c)?.note).filter(Boolean).map((n) => (
            <p key={n} className="mt-4 rounded-xl border-2 border-dashed border-ink/30 p-3 text-sm">
              {n}
            </p>
          ))}

          {product.note && (
            <div className="mt-5">
              <Notice>{product.note}</Notice>
            </div>
          )}

          {product.variants && purchasable && (
            <fieldset className="mt-8">
              <legend className="mb-3 font-bold">{product.variantLabel === 'Theme' ? 'Choose your theme' : 'Size'}</legend>
              <div className={`grid gap-2 ${product.variantLabel === 'Theme' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {product.variants.map((v) => (
                  <label
                    key={v.id}
                    className={`cursor-pointer rounded-2xl border-2 px-3 py-3 text-center transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink ${
                      variantId === v.id ? 'border-ink bg-lime' : 'border-ink/15 bg-white hover:border-ink/50'
                    }`}
                  >
                    <input type="radio" name={product.variantLabel === 'Theme' ? 'theme' : 'size'} value={v.id} checked={variantId === v.id} onChange={() => setVariantId(v.id)} className="sr-only" />
                    <span className={`block font-display font-extrabold ${product.variantLabel === 'Theme' ? 'text-base leading-tight' : 'text-xl'}`}>{v.label}</span>
                    {v.detail && <span className="block text-xs text-ink-soft">{v.detail}</span>}
                    <span className="mt-1 block text-sm font-bold">{formatPrice(v.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-8 border-t-2 border-ink/10 pt-6">
            {purchasable && product.category === 'stickers' && (
              <div className="mb-4">
                <BonusGiftNote compact />
              </div>
            )}
            {purchasable ? (
              <div className="flex flex-wrap items-center gap-3">
                <QuantitySelector label="Quantity" value={quantity} onChange={setQuantity} />
                <button
                  type="button"
                  className="btn-primary flex-1 py-4 text-base"
                  onClick={() => {
                    addItem(product.id, quantity, variantId);
                    setQuantity(1);
                    openCart();
                  }}
                >
                  <LuShoppingBag aria-hidden /> Add to cart · {formatPrice(price * quantity)}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button type="button" disabled className="btn-primary w-full py-4 text-base">
                  Not available yet
                </button>
                <p className="text-sm text-ink-soft">
                  This is part of our planned {product.category === 'posters' ? 'wall-art range' : 'range'} and can’t be ordered yet.
                  {interest ? (
                    <>
                      {' '}
                      <a href={interest} target="_blank" rel="noreferrer" className="font-bold underline">
                        Tell us you’re interested
                      </a>
                      .
                    </>
                  ) : (
                    ' Tell us if you’d want it — it helps us decide what to make next.'
                  )}
                </p>
              </div>
            )}
          </div>

          {product.productType === 'mystery' && <MysteryPackDetails product={product} variantId={variantId} />}
          {product.productType === 'duo' && <DuoDetails product={product} />}
          {product.productType === 'secret' && <SecretMessageDetails product={product} />}

          {contents.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-extrabold">What’s inside</h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {contents.map((c, i) => (
                  <li key={c + i} className="flex items-center gap-2 text-ink-soft">
                    <span aria-hidden className="size-2 rounded-full bg-ink" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <dl className="mt-8 divide-y-2 divide-ink/10 border-y-2 border-ink/10">
            {product.collections.length > 0 && (
            <div className="flex justify-between gap-4 py-3">
              <dt className="font-bold">Vibes</dt>
              <dd className="flex flex-wrap justify-end gap-1.5">
                {product.collections.map((c) => (
                  <Link key={c} to={shopUrl({ collections: [c] })} className="chip py-1 text-xs">
                    {getCollection(c)?.name}
                  </Link>
                ))}
              </dd>
            </div>
            )}
            <CollectibleRows product={product} />
            {hasSpecs ? (
              specs.map((s) =>
                s.value ? (
                  <div key={s.label} className="flex justify-between gap-4 py-3">
                    <dt className="font-bold">{s.label}</dt>
                    <dd className="text-right text-ink-soft">{s.value}</dd>
                  </div>
                ) : null,
              )
            ) : (
              <div className="flex justify-between gap-4 py-3">
                <dt className="font-bold">{product.category === 'posters' ? 'Paper & finish' : 'Size, material & finish'}</dt>
                <dd className="text-right text-ink-soft">To be confirmed after supplier samples</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 py-3">
              <dt className="font-bold">Tags</dt>
              <dd className="text-right text-ink-soft">{product.tags.join(', ')}</dd>
            </div>
          </dl>
          {brand.isPrototype && (
            <p className="mt-4 text-sm text-ink-soft">
              Prototype store: adding to cart works, but no real orders or payments are taken yet.
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="related-title">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="related-title" className="text-3xl font-extrabold md:text-4xl">
              You might also like
            </h2>
            {product.collections[0] && (
              <Link to={shopUrl({ collections: [product.collections[0]] })} className="hidden items-center gap-1 font-bold underline underline-offset-4 sm:flex">
                More {getCollection(product.collections[0])?.name} <LuArrowRight aria-hidden />
              </Link>
            )}
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
