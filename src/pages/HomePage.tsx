import { LuArrowRight } from 'react-icons/lu';
import { productTypeLabels } from '../data/collections';
import { products } from '../data/products';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link } from '../router/router';
import type { Category, ProductType } from '../types/product';
import { allSizes, getProductBySlug, getStartingPrice, isPurchasable, shopUrl, sortProducts } from '../utils/catalogue';
import { formatPrice } from '../utils/format';
import { ProductImage } from '../components/art/ProductArt';
import { ProductGrid } from '../components/product/ProductCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ShopByVibe } from '../components/vibes/ShopByVibe';
import { AnimatedStickerHero } from '../components/home/AnimatedStickerHero';
import { packSizes, packSurprise } from '../data/packBuilder';

const orderable = (category: Category) => products.filter((p) => p.category === category && isPurchasable(p));
const lowestPrice = (category: Category) => Math.min(...orderable(category).map((p) => p.price));

// ---------- Two equal doors: stickers and posters ----------
function CategoryDoors() {
  const doors: { category: Category; title: string; pitch: string; slug: string; color: string; extra: string }[] = [
    {
      category: 'stickers',
      title: 'Stickers',
      pitch: 'Mini stickers, sheets and themed packs for laptops, notebooks, bottles and phone cases.',
      slug: 'campus-survival-sheet',
      color: '#FFD447',
      extra: 'Minis · sheets · packs',
    },
    {
      category: 'posters',
      title: 'Posters',
      pitch: 'Bold prints and ready-made wall packs for your room, hostel or PG.',
      slug: 'desk-wall-pack',
      color: '#8FD3FF',
      extra: `${allSizes().join(' · ')} · wall packs`,
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6" aria-label="Shop by category">
      <ul className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
        {doors.map((d) => {
          const product = getProductBySlug(d.slug);
          return (
            <li key={d.category}>
              <Link
                to={shopUrl({ category: d.category })}
                className="on-light group flex h-full flex-col-reverse gap-4 overflow-hidden rounded-[var(--radius-card)] border-2 border-ink p-6 transition-transform hover:-translate-y-1 sm:grid sm:grid-cols-[1fr_auto] sm:items-end md:p-8"
                style={{ backgroundColor: d.color }}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-widest uppercase">{d.extra}</p>
                  <h2 className="mt-2 text-5xl font-extrabold md:text-6xl">{d.title}</h2>
                  <p className="mt-3 max-w-xs">{d.pitch}</p>
                  <p className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper">
                    {orderable(d.category).length} designs · from {formatPrice(lowestPrice(d.category))} <LuArrowRight aria-hidden />
                  </p>
                </div>
                {product && (
                  <div className="w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-ink sm:w-36 lg:w-44">
                    <ProductImage product={product} className="aspect-square w-full transition-transform group-hover:scale-105" />
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Collectibles: the two main pack purchases get real space; the other ideas
 * are a quiet row of links so the homepage doesn't turn into eight banners.
 */
function Collect() {
  const mystery = getProductBySlug('mystery-pack');
  const more = [
    { label: 'Matching duos', to: '/matching-duos' },
    { label: 'Secret messages', to: '/secret-messages' },
    { label: 'Rare collections', to: '/rare-collections' },
    { label: 'Collector passport', to: '/collector-passport' },
    { label: 'Vote for the next drop', to: '/vote-next-drop' },
  ];
  return (
    <section aria-labelledby="collect-title" className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
      <SectionHeading
        id="collect-title"
        eyebrow="Collect them all"
        title="Packs with a little surprise."
        action={
          <Link to="/collectibles" className="btn-ghost">
            All collectibles <LuArrowRight aria-hidden />
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
        {mystery && (
          <Link to="/product/mystery-pack" className="group grid items-center overflow-hidden rounded-[var(--radius-card)] border-2 border-ink bg-white sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ProductImage product={mystery} className="aspect-square w-full transition-transform group-hover:scale-[1.03]" />
            <span className="p-5 md:p-6">
              <span className="eyebrow">Mystery sticker pack</span>
              <span className="mt-2 block font-display text-3xl leading-none font-extrabold md:text-4xl">5 guaranteed + 1 mystery</span>
              <span className="mt-2 block text-ink-soft">Pick a series theme. You’ll know where the five come from — only the sixth is a surprise.</span>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper">
                {formatPrice(mystery.price)} · choose a theme <LuArrowRight aria-hidden />
              </span>
            </span>
          </Link>
        )}
        <Link to="/build-your-pack" className="group flex flex-col justify-between rounded-[var(--radius-card)] border-2 border-ink bg-lime p-5 md:p-6">
          <span>
            <span className="eyebrow">Build your own pack</span>
            <span className="mt-2 block font-display text-3xl leading-none font-extrabold">Your picks, plus one on us</span>
            <span className="mt-2 block">
              Choose {packSizes.map((x) => x.count).join(' or ')} designs from the range and get {packSurprise.count} surprise sticker in your theme.
            </span>
          </span>
          <span className="mt-5 inline-flex items-center gap-1 font-bold group-hover:underline">
            From {formatPrice(Math.min(...packSizes.map((x) => x.price)))} · start building <LuArrowRight aria-hidden />
          </span>
        </Link>
      </div>
      <nav aria-label="More collectibles" className="mt-4 flex flex-wrap gap-2">
        {more.map((m) => (
          <Link key={m.to} to={m.to} className="chip">
            {m.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}

function FeaturedRow({ category, eyebrow, title, linkLabel }: { category: Category; eyebrow: string; title: string; linkLabel: string }) {
  const items = sortProducts(
    products.filter((p) => p.featured && p.category === category && isPurchasable(p)),
    'featured',
  ).slice(0, 4);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6" aria-labelledby={`featured-${category}`}>
      <SectionHeading
        id={`featured-${category}`}
        eyebrow={eyebrow}
        title={title}
        action={
          <Link to={shopUrl({ category })} className="btn-ghost">
            {linkLabel} <LuArrowRight aria-hidden />
          </Link>
        }
      />
      <ProductGrid products={items} />
    </section>
  );
}

const formats: { type: ProductType; slug: string; pitch: string }[] = [
  { type: 'single', slug: 'chai-first', pitch: 'One design, one sticker.' },
  { type: 'sheet', slug: 'campus-survival-sheet', pitch: 'Several minis on one sheet.' },
  { type: 'pack', slug: 'garage-pack', pitch: 'A themed bundle of separate stickers.' },
  { type: 'poster', slug: 'redline-poster', pitch: `Pick a size: ${allSizes().join(', ')}.` },
  { type: 'poster-set', slug: 'room-reset-poster-set', pitch: 'Matching prints that hang together.' },
];

function Formats() {
  return (
    <section className="mt-24 border-y-2 border-ink bg-white" aria-labelledby="formats-title">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading id="formats-title" eyebrow="Pick your format" title="Small, medium or the whole wall." />
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {formats.map((f, i) => {
            const product = getProductBySlug(f.slug);
            const from = getStartingPrice(f.type);
            if (!product) return null;
            return (
              <li key={f.type} className={i === 0 ? 'col-span-2 md:col-span-1' : ''}>
                <Link to={shopUrl({ types: [f.type] })} className="group block">
                  <div className="overflow-hidden rounded-[var(--radius-card)] border-2 border-ink">
                    <ProductImage product={product} className={`w-full ${i === 0 ? 'aspect-[2/1] md:aspect-square' : 'aspect-square'}`} />
                  </div>
                  <p className="mt-3 text-xs font-bold tracking-wide text-ink-soft uppercase">{product.category}</p>
                  <h3 className="text-xl font-extrabold group-hover:underline">{productTypeLabels[f.type].plural}</h3>
                  <p className="text-sm text-ink-soft">{f.pitch}</p>
                  {from && <p className="mt-1 text-sm font-bold">from {formatPrice(from)}</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Bundles() {
  // Two sticker bundles + two poster bundles, so both lines get equal space.
  const pick = (category: Category) =>
    sortProducts(
      products.filter((p) => p.category === category && ['sheet', 'pack', 'poster-set'].includes(p.productType) && isPurchasable(p) && p.featured),
      'featured',
    ).slice(0, 2);
  const bundles = [...pick('stickers'), ...pick('posters')];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6" aria-labelledby="bundles-title">
      <SectionHeading
        id="bundles-title"
        eyebrow="Packs, sheets & wall packs"
        title="More designs, one price."
        action={
          <Link to={shopUrl({ types: ['sheet', 'pack', 'poster-set'] })} className="btn-ghost">
            See all bundles <LuArrowRight aria-hidden />
          </Link>
        }
      />
      <ProductGrid products={bundles} />
      <p className="mt-6 text-sm text-ink-soft">
        Coming later: <Link to="/product/photo-collage" className="font-bold underline">personalised photo collages</Link> — tell us if you’d want them.
      </p>
    </section>
  );
}

function Story() {
  const steps = [
    { title: 'We draw it', body: 'Every design is original — drawn by us, not borrowed from brands, shows or games.' },
    { title: 'We print small', body: 'Small batches with a local printer, so we only make what people actually want.' },
    { title: 'You stick it or hang it', body: 'We’re starting on our own campus, with pickup or delivery arrangements we’ll confirm before launch.' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6" aria-labelledby="story-title">
      <div className="panel-glow grid gap-10 rounded-[var(--radius-card)] p-6 md:grid-cols-[1fr_1.2fr] md:p-12">
        <div>
          <p className="eyebrow mb-3">The idea</p>
          <h2 id="story-title" className="text-4xl leading-[1] font-extrabold md:text-5xl">
            A small brand, made by students, for students.
          </h2>
          <p className="mt-5 max-w-md text-lg">
            We’re building an affordable collection of original stickers and posters for people who like their stuff — and their walls — to look like theirs.
            We’re just getting started; this site is our first draft.
          </p>
          <Link to="/about" className="btn-primary mt-6">
            Read our story
          </Link>
        </div>
        <ol className="grid gap-4 self-end">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl border-2 border-ink bg-paper p-5">
              <span className="font-display text-3xl font-extrabold">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-xl font-extrabold">{s.title}</h3>
                <p className="mt-1 text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function HomePage() {
  usePageMeta(null);
  return (
    <>
      <AnimatedStickerHero />
      <CategoryDoors />
      <Collect />
      <ShopByVibe />
      <FeaturedRow category="stickers" eyebrow="Featured stickers" title="Start small. Collect them all." linkLabel="All stickers" />
      <FeaturedRow category="posters" eyebrow="Featured posters" title="Walls deserve personality too." linkLabel="All posters" />
      <Formats />
      <Bundles />
      <Story />
    </>
  );
}
