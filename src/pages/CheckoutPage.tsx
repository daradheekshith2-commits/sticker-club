/**
 * CHECKOUT PREVIEW (frontend only)
 *
 * Shows the planned checkout flow and validates the form, but:
 * - nothing typed here is sent anywhere or saved (it lives only in React state),
 * - no payment is taken and no card fields exist,
 * - no order ID is created and no order is claimed to be placed.
 *
 * When a real backend exists, replace `handleSubmit` with a call to it.
 */
import { useState, type FormEvent, type ReactNode } from 'react';
import { LuArrowLeft, LuCheck } from 'react-icons/lu';
import { brand, hasAnyContact, whatsappLink } from '../config/brand';
import { useCart } from '../context/CartContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link } from '../router/router';
import { formatPrice, pluralise } from '../utils/format';
import { initialForm, validate, type Errors, type FormState } from '../utils/checkout';
import { ProductImage } from '../components/art/ProductArt';
import { WallCartLine } from '../components/cart/WallCartLine';
import { StickerCartLine } from '../components/cart/StickerCartLine';
import { PackCartLine } from '../components/cart/PackCartLine';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { Notice, Placeholder } from '../components/ui/Placeholder';

function Field({
  id, label, error, hint, children,
}: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-ink-soft">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-bold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutPage() {
  usePageMeta('Checkout preview');
  const { lines, subtotal, itemCount, openCart } = useCart();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [previewDone, setPreviewDone] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      return;
    }
    // PROTOTYPE: nothing is sent. Forget what was typed and show the preview result.
    setForm(initialForm);
    setPreviewDone(true);
    window.scrollTo({ top: 0 });
  };

  const inputProps = (key: keyof FormState) => ({
    id: `checkout-${key}`,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `checkout-${key}-error` : undefined,
  });

  if (previewDone) {
    const wa = whatsappLink('Hi! I tried your checkout preview and I’d like to buy some stickers.');
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-[var(--radius-card)] border-2 border-ink bg-white p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full border-2 border-ink bg-lime">
            <LuCheck aria-hidden className="size-7" />
          </div>
          <h1 className="mt-5 text-4xl font-extrabold">That’s the end of the preview</h1>
          <p className="mt-3 text-ink-soft">
            Your details passed validation, but <strong className="text-ink">no order was placed, nothing was sent, and no payment was taken</strong>. What you typed has
            been cleared. Your cart is still here.
          </p>
          <p className="mt-3 text-ink-soft">
            In the real store, this is where you’d get an order confirmation and pickup or delivery details.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="btn-accent">
                Message us to buy
              </a>
            )}
            <Link to="/shop" className="btn-primary">
              Back to the shop
            </Link>
          </div>
          {!hasAnyContact() && (
            <p className="mt-6">
              <Placeholder>Add a contact method in brand.ts so visitors can reach you</Placeholder>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          body="Add a few stickers first, then come back to preview checkout."
          action={
            <Link to="/shop" className="btn-primary">
              Go shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Checkout preview' }]} />
      <h1 className="mt-4 text-5xl font-extrabold md:text-6xl">Checkout preview</h1>
      <div className="mt-6 max-w-3xl">
        <Notice tone="demo">
          <strong>Demo mode.</strong> This shows how checkout will work once {brand.displayName} is ready to take orders. Nothing you type is sent or saved,
          there’s no payment step, and no order will be created.
        </Notice>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <form noValidate onSubmit={handleSubmit} className="space-y-8" aria-label="Checkout preview form">
          <fieldset className="space-y-4">
            <legend className="mb-2 text-2xl font-extrabold">Your details</legend>
            <Field id="checkout-name" label="Name" error={errors.name}>
              <input {...inputProps('name')} className="field-input" autoComplete="off" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field id="checkout-contact" label="Phone or email" error={errors.contact} hint="So we could confirm your order — in the real store.">
              <input {...inputProps('contact')} className="field-input" autoComplete="off" inputMode="email" value={form.contact} onChange={(e) => set('contact', e.target.value)} />
            </Field>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-2xl font-extrabold">How you’d get it</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: 'pickup', title: 'Campus pickup', body: 'Collect from an agreed spot on campus. Details to be confirmed.' },
                  { value: 'delivery', title: 'Delivery', body: 'Delivered to your address in Hyderabad. Charges to be confirmed.' },
                ] as const
              ).map((o) => (
                <label
                  key={o.value}
                  className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-colors ${form.delivery === o.value ? 'border-ink bg-white' : 'border-ink/15 hover:border-ink/40'}`}
                >
                  <input type="radio" name="delivery" value={o.value} checked={form.delivery === o.value} onChange={() => set('delivery', o.value)} className="mt-1 accent-ink" />
                  <span>
                    <span className="block font-bold">{o.title}</span>
                    <span className="text-sm text-ink-soft">{o.body}</span>
                  </span>
                </label>
              ))}
            </div>
            {form.delivery === 'delivery' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
                <Field id="checkout-address" label="Address" error={errors.address}>
                  <input {...inputProps('address')} className="field-input" autoComplete="off" value={form.address} onChange={(e) => set('address', e.target.value)} />
                </Field>
                <Field id="checkout-pincode" label="PIN code" error={errors.pincode}>
                  <input {...inputProps('pincode')} className="field-input" autoComplete="off" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))} />
                </Field>
              </div>
            )}
          </fieldset>

          <Field id="checkout-notes" label="Notes (optional)">
            <textarea id="checkout-notes" rows={3} className="field-input" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>

          <div className="rounded-2xl border-2 border-dashed border-ink/25 p-4 text-sm text-ink-soft">
            <strong className="text-ink">Payment:</strong> there’s no payment step in this prototype. The payment method will be decided when real ordering is set up.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn-primary px-8 py-4 text-base">
              Finish preview (no order placed)
            </button>
            <Link to="/shop" className="flex items-center gap-1 font-bold underline underline-offset-4">
              <LuArrowLeft aria-hidden /> Keep shopping
            </Link>
          </div>
        </form>

        <aside aria-labelledby="summary-title" className="h-fit rounded-[var(--radius-card)] border-2 border-ink bg-white p-6 lg:sticky lg:top-24">
          <h2 id="summary-title" className="text-2xl font-extrabold">
            Order summary <span className="text-base font-bold text-ink-soft">({pluralise(itemCount, 'item')})</span>
          </h2>
          <ul className="mt-4 divide-y-2 divide-ink/10">
            {lines.map((line) =>
              line.type === 'custom-wall' ? (
                <li key={line.key} className="py-3">
                  <WallCartLine line={line} compact />
                </li>
              ) : line.type === 'custom-sticker' ? (
                <li key={line.key} className="py-3">
                  <StickerCartLine line={line} compact />
                </li>
              ) : line.type === 'custom-pack' ? (
                <li key={line.key} className="py-3">
                  <PackCartLine line={line} compact />
                </li>
              ) : (
                <li key={line.key} className="flex items-center gap-3 py-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border-2 border-ink/10">
                    <ProductImage product={line.product} className="size-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{line.product.name}</p>
                    <p className="text-sm text-ink-soft">
                      {line.variant ? `${line.variant.label} · ` : ''}
                      {line.quantity} × {formatPrice(line.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold tabular-nums">{formatPrice(line.lineTotal)}</span>
                </li>
              ),
            )}
          </ul>
          <dl className="mt-4 space-y-2 border-t-2 border-ink pt-4">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-bold tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-ink-soft">
              <dt>Pickup / delivery</dt>
              <dd className="text-right">To be confirmed</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-ink-soft">The final total will be confirmed once pickup and delivery are set up.</p>
          <button type="button" className="mt-4 text-sm font-bold underline underline-offset-4" onClick={openCart}>
            Edit cart
          </button>
        </aside>
      </div>
    </div>
  );
}
