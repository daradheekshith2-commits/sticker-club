import { useState } from 'react';
import { LuArrowLeft, LuArrowRight, LuGift, LuHeart, LuImagePlus, LuMail, LuStamp } from 'react-icons/lu';
import { products } from '../data/products';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link } from '../router/router';
import type { Category } from '../types/product';
import { getProductBySlug, isPurchasable, shopUrl, sortProducts } from '../utils/catalogue';
import { formatPrice } from '../utils/format';
import { ProductImage } from '../components/art/ProductArt';
import { ProductGrid } from '../components/product/ProductCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ShopByVibe } from '../components/vibes/ShopByVibe';
import { AnimatedStickerHero } from '../components/home/AnimatedStickerHero';

const orderable = (category: Category) => products.filter((p) => p.category === category && isPurchasable(p));
const lowestPrice = (category: Category) => Math.min(...orderable(category).map((p) => p.price));

// ---------- Shop categories ----------
function CategoryDoors() {
  const doors: {
    id: string;
    title: string;
    pitch: string;
    eyebrow: string;
    cta: string;
    to: string;
    category: Category | null;
    slug: string | null;
    icon: 'gift' | 'image' | null;
    color: string;
  }[] = [
    {
      id: 'stickers',
      title: 'Stickers',
      pitch: 'Mini designs, sheets and themed packs for your everyday things.',
      eyebrow: 'STICKER ESSENTIALS',
      cta: 'SHOP STICKERS',
      to: shopUrl({ category: 'stickers' }),
      category: 'stickers',
      slug: 'campus-survival-sheet',
      icon: null,
      color: '#FFD447',
    },
    {
      id: 'posters',
      title: 'Posters',
      pitch: 'Give your room, hostel or workspace a little more personality.',
      eyebrow: 'WALL ART',
      cta: 'SHOP POSTERS',
      to: shopUrl({ category: 'posters' }),
      category: 'posters',
      slug: 'desk-wall-pack',
      icon: null,
      color: '#8FD3FF',
    },
    {
      id: 'gifts',
      title: 'Gifts',
      pitch: 'Thoughtful little finds, collectible surprises and gifts worth sharing.',
      eyebrow: 'GIFTABLE GOODIES',
      cta: 'EXPLORE GIFTS',
      to: '/collectibles',
      category: null,
      slug: null,
      icon: 'gift',
      color: '#FFB3D1',
    },
    {
      id: 'shop-your-own',
      title: 'Shop Your Own',
      pitch: 'Turn your own photo, drawing or idea into a custom sticker.',
      eyebrow: 'MAKE IT PERSONAL',
      cta: 'START CREATING',
      to: '/create-your-stickers',
      category: null,
      slug: null,
      icon: 'image',
      color: '#A8F0DC',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6" aria-label="Shop categories">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {doors.map((door) => {
          const product = door.slug ? getProductBySlug(door.slug) : undefined;
          return (
            <li key={door.id} className="min-w-0">
              <Link
                to={door.to}
                className="on-light group flex h-full min-h-[340px] flex-col overflow-hidden rounded-[var(--radius-card)] border-2 border-[#121212] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)] md:p-6"
                style={{ backgroundColor: door.color }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#121212]/75">{door.eyebrow}</p>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#121212] text-[#F4F0E8] transition-transform group-hover:translate-x-1">
                    <LuArrowRight aria-hidden className="size-4" />
                  </span>
                </div>
                <div className="flex min-h-[142px] flex-1 items-center justify-center py-5">
                  {product ? (
                    <div className="w-full max-w-[180px] overflow-hidden rounded-2xl border-2 border-[#121212] bg-white shadow-[0_8px_18px_rgba(18,18,18,0.14)] transition-transform duration-200 group-hover:rotate-[-2deg] group-hover:scale-[1.03]">
                      <ProductImage product={product} className="aspect-square w-full" />
                    </div>
                  ) : door.icon === 'gift' ? (
                    <div className="grid size-32 place-items-center rounded-[2rem] border-2 border-[#121212] bg-white/75 shadow-[0_8px_18px_rgba(18,18,18,0.12)] transition-transform duration-200 group-hover:rotate-[-4deg] group-hover:scale-105">
                      <LuGift aria-hidden className="size-[4.25rem] text-[#121212]" strokeWidth={1.6} />
                    </div>
                  ) : door.icon === 'image' ? (
                    <div className="grid size-32 place-items-center rounded-[2rem] border-2 border-[#121212] bg-white/75 shadow-[0_8px_18px_rgba(18,18,18,0.12)] transition-transform duration-200 group-hover:rotate-[4deg] group-hover:scale-105">
                      <LuImagePlus aria-hidden className="size-[4.25rem] text-[#121212]" strokeWidth={1.6} />
                    </div>
                  ) : null}
                </div>
                <div>
                  {door.category && (
                    <p className="text-[10px] font-bold tracking-wide text-[#121212]/70">
                      {orderable(door.category).length} designs · from {formatPrice(lowestPrice(door.category))}
                    </p>
                  )}
                  <h2 className="mt-1 font-display text-3xl leading-none font-extrabold tracking-tight text-[#121212]">{door.title}</h2>
                  <p className="mt-2 min-h-[2.8rem] text-sm leading-relaxed text-[#121212]/80">{door.pitch}</p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#121212] px-4 py-2.5 text-[11px] font-extrabold tracking-[0.08em] text-[#F4F0E8] transition-colors group-hover:bg-[#263b35]">
                    {door.cta} <LuArrowRight aria-hidden className="size-4" />
                  </span>
                </div>
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
  const features = [
    {
      to: '/matching-duos',
      eyebrow: 'BETTER TOGETHER',
      title: 'Matching Duos',
      description: 'Two original sticker designs made to go together. Keep both or share one with someone.',
      cta: 'EXPLORE DUOS',
      Icon: LuHeart,
      accent: '#A8F0DC',
    },
    {
      to: '/secret-messages',
      eyebrow: 'A LITTLE MYSTERY',
      title: 'Secret Messages',
      description: 'Pick a message sticker and discover the personal note sealed inside.',
      cta: 'OPEN THE SECRET',
      Icon: LuMail,
      accent: '#D90A1F',
    },
    {
      to: '/collector-passport',
      eyebrow: 'YOUR COLLECTION JOURNEY',
      title: 'Collector Passport',
      description: 'Preview the stamp-card idea and see how your Sticker Club collection could grow.',
      cta: 'VIEW PASSPORT',
      Icon: LuStamp,
      accent: '#8FD3FF',
    },
  ];

  return (
    <section aria-labelledby="collect-title" className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
      <SectionHeading
        id="collect-title"
        eyebrow="MORE TO EXPLORE"
        title="Little things worth discovering."
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <li key={feature.to} className="min-w-0">
            <Link
              to={feature.to}
              className="group flex h-full min-h-[270px] flex-col rounded-[var(--radius-card)] border border-[#315e53] bg-[#071b18] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#a8f0dc] hover:shadow-[0_14px_30px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-14 place-items-center rounded-2xl border border-[#f4f0e8]/15" style={{ backgroundColor: feature.accent }}>
                  <feature.Icon aria-hidden className={`size-7 ${feature.accent === '#D90A1F' ? 'text-[#F4F0E8]' : 'text-[#03110f]'}`} strokeWidth={1.8} />
                </span>
                <span className="grid size-9 place-items-center rounded-full border border-[#315e53] text-[#a8f0dc] transition-all group-hover:border-[#a8f0dc] group-hover:bg-[#a8f0dc] group-hover:text-[#03110f]">
                  <LuArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <p className="mt-6 text-[10px] font-extrabold tracking-[0.16em]" style={{ color: feature.accent }}>{feature.eyebrow}</p>
              <h3 className="mt-2 font-display text-2xl font-extrabold text-[#F4F0E8]">{feature.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#B5C7C1]">{feature.description}</p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-extrabold tracking-[0.08em] text-[#a8f0dc] transition-colors group-hover:text-[#F4F0E8]">
                {feature.cta} <LuArrowRight aria-hidden className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function shuffleItems<T,>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function FeaturedRow({ category, eyebrow, title, linkLabel }: { category: Category; eyebrow: string; title: string; linkLabel: string }) {
  const candidates = sortProducts(
    products.filter((p) => p.category === category && isPurchasable(p)),
    'featured',
  );
  const initialItems = candidates.slice(0, 4);
  const [randomItems, setRandomItems] = useState<typeof initialItems | null>(null);
  const items = randomItems ?? initialItems;
  const itemLabel = category === 'stickers' ? 'stickers' : 'posters';

  const showRandomItems = () => {
    if (candidates.length <= 4) return;

    const currentIds = new Set(items.map((product) => product.id));
    let nextItems = shuffleItems(candidates).slice(0, 4);

    // Guarantee that a shuffle changes at least one card when alternatives exist.
    if (nextItems.every((product) => currentIds.has(product.id))) {
      const alternatives = candidates.filter((product) => !currentIds.has(product.id));
      if (alternatives.length > 0) {
        nextItems = [
          ...shuffleItems(items).slice(0, 3),
          alternatives[Math.floor(Math.random() * alternatives.length)],
        ];
        nextItems = shuffleItems(nextItems);
      }
    }

    setRandomItems(nextItems);
  };

  const action = (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      <div
        className="inline-flex items-center gap-1 rounded-full border border-[#315e53] bg-[#071b18] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        aria-label={`Discover featured ${itemLabel}`}
      >
        <span className="hidden px-2 text-[10px] font-extrabold tracking-[0.16em] text-[#a8f0dc] sm:inline">DISCOVER</span>
        <button
          type="button"
          onClick={showRandomItems}
          disabled={candidates.length <= 4}
          className="grid size-10 place-items-center rounded-full border border-[#315e53] bg-[#0b2420] text-[#a8f0dc] transition duration-200 hover:border-[#a8f0dc] hover:bg-[#a8f0dc] hover:text-[#03110f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Show a random selection of ${itemLabel}`}
          title={`Discover random ${itemLabel}`}
        >
          <LuArrowLeft aria-hidden className="size-[18px]" />
        </button>
        <button
          type="button"
          onClick={showRandomItems}
          disabled={candidates.length <= 4}
          className="grid size-10 place-items-center rounded-full border border-[#d90a1f] bg-[#d90a1f] text-[#f4f0e8] shadow-[0_3px_12px_rgba(217,10,31,0.24)] transition duration-200 hover:border-[#a8f0dc] hover:bg-[#a8f0dc] hover:text-[#03110f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Show another random selection of ${itemLabel}`}
          title={`Discover more ${itemLabel}`}
        >
          <LuArrowRight aria-hidden className="size-[18px]" />
        </button>
      </div>
      <Link
        to={shopUrl({ category })}
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#5d9d8f] px-5 py-3 text-sm font-bold text-[#a8f0dc] transition hover:border-[#a8f0dc] hover:bg-[#a8f0dc] hover:text-[#03110f]"
      >
        {linkLabel} <LuArrowRight aria-hidden />
      </Link>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6" aria-labelledby={`featured-${category}`}>
      <SectionHeading
        id={`featured-${category}`}
        eyebrow={eyebrow}
        title={title}
        action={action}
      />
      <ProductGrid products={items} />
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
    </>
  );
}
