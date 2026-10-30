import { usePageMeta } from '../hooks/usePageMeta';
import { Link } from '../router/router';
import { useCart } from '../context/CartContext';
import { LiveOrderCheckout } from '../components/checkout/LiveOrderCheckout';
import { ProductImage } from '../components/art/ProductArt';
import { WallCartLine } from '../components/cart/WallCartLine';
import { StickerCartLine } from '../components/cart/StickerCartLine';
import { PackCartLine } from '../components/cart/PackCartLine';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { formatPrice, pluralise } from '../utils/format';

export function CheckoutPage() {
  usePageMeta('Checkout');
  const { lines, subtotal, itemCount, openCart } = useCart();

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          body="Add a few favourites first, then come back to checkout."
          action={<Link to="/shop" className="btn-primary">Go shopping</Link>}
        />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Checkout' }]} />
      <h1 className="mt-4 text-5xl font-extrabold md:text-6xl">Checkout.</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Review your items and delivery address. Orders are saved to your account with payment pending.
        No payment is collected on this checkout yet.
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
        <section aria-label="Order and delivery" className="min-w-0">
          <LiveOrderCheckout />
        </section>

        <aside aria-labelledby="summary-title" className="h-fit rounded-[var(--radius-card)] border-2 border-ink bg-white p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <h2 id="summary-title" className="text-2xl font-extrabold">
              Your cart <span className="text-base font-bold text-ink-soft">({pluralise(itemCount, 'item')})</span>
            </h2>
            <button type="button" className="text-sm font-bold underline underline-offset-4" onClick={openCart}>Edit</button>
          </div>
          <ul className="mt-4 divide-y-2 divide-ink/10">
            {lines.map((line) => line.type === 'custom-wall' ? (
              <li key={line.key} className="py-3"><WallCartLine line={line} compact /></li>
            ) : line.type === 'custom-sticker' ? (
              <li key={line.key} className="py-3"><StickerCartLine line={line} compact /></li>
            ) : line.type === 'custom-pack' ? (
              <li key={line.key} className="py-3"><PackCartLine line={line} compact /></li>
            ) : (
              <li key={line.key} className="flex items-center gap-3 py-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-lg border-2 border-ink/10">
                  <ProductImage product={line.product} className="size-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{line.product.name}</p>
                  <p className="text-sm text-ink-soft">
                    {line.variant ? line.variant.label + ' · ' : ''}{line.quantity} × {formatPrice(line.unitPrice)}
                  </p>
                </div>
                <span className="font-bold tabular-nums">{formatPrice(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t-2 border-ink pt-4">
            <div className="flex justify-between">
              <dt>Cart subtotal</dt>
              <dd className="font-bold tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-sm text-ink-soft">
              <dt>Delivery</dt><dd>Confirmed separately</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-ink-soft">
            The backend rechecks product prices and stock before saving an order. Custom uploads and configured packs are not yet eligible for database checkout.
          </p>
        </aside>
      </div>
    </main>
  );
}
