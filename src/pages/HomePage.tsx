import { useState } from 'react';
import { LuArrowLeft, LuArrowRight, LuHeart, LuImagePlus, LuMail, LuPackage, LuStamp } from 'react-icons/lu';
import { products } from '../data/products';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link } from '../router/router';
import type { Category } from '../types/product';
import { getProductBySlug, isPurchasable, shopUrl, sortProducts } from '../utils/catalogue';
import { formatPrice } from '../utils/format';
import { StickerSvg } from '../components/art/Sticker';
import { ProductGrid } from '../components/product/ProductCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ShopByVibe } from '../components/vibes/ShopByVibe';
import { AnimatedStickerHero } from '../components/home/AnimatedStickerHero';

const orderable = (category: Category) => products.filter((p) => p.category === category && isPurchasable(p));
const lowestPrice = (category: Category) => Math.min(...orderable(category).map((p) => p.price));

// ---------- Shop categories ----------
function CategoryDoors() {
  const softDaysProduct = getProductBySlug('soft-days-sheet');
  const customAccent = softDaysProduct?.art.kind === 'sheet'
    ? softDaysProduct.art.designs.find((design) => design.name.toLowerCase().includes('cat'))
    : undefined;

  const cards = [
    {
      id: 'stickers',
      title: 'Stickers',
      eyebrow: 'STICKER ESSENTIALS',
      pitch: 'Mini designs, sheets and themed packs for your everyday things.',
      cta: 'SHOP STICKERS',
      to: shopUrl({ category: 'stickers' }),
      category: 'stickers' as const,
      color: '#fcde62',
      countText: `${orderable('stickers').length} designs · from ${formatPrice(lowestPrice('stickers'))}`,
    },
    {
      id: 'posters',
      title: 'Posters',
      eyebrow: 'WALL ART',
      pitch: 'Give your room, hostel or workspace a little more personality.',
      cta: 'SHOP POSTERS',
      to: shopUrl({ category: 'posters' }),
      category: 'posters' as const,
      color: '#abdef9',
      countText: `${orderable('posters').length} designs · from ${formatPrice(lowestPrice('posters'))}`,
    },
    {
      id: 'shop-your-own',
      title: 'Shop Your Own',
      eyebrow: 'MAKE IT PERSONAL',
      pitch: 'Turn your own photo, drawing or idea into a custom sticker.',
      cta: 'START CREATING',
      to: '/create-your-stickers',
      category: null,
      color: '#a8f0dc',
      countText: 'From 1 piece · custom die-cut',
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-cinema-bg py-12 sm:py-16 md:py-20" aria-label="Shop categories">
      <div aria-hidden className="cinema-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.06]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(7,27,24,0.65),transparent_70%)]" />

      {/* Decorative background doodles */}
      <svg aria-hidden viewBox="0 0 48 48" className="pointer-events-none absolute left-[2%] top-8 hidden size-10 rotate-[-12deg] text-[#FFD447]/20 sm:block">
        <path d="M24 2 29 17 45 18 32 28 36 44 23 34 9 43 14 27 3 17 19 17Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      <svg aria-hidden viewBox="0 0 48 48" className="pointer-events-none absolute right-[2%] top-6 hidden size-12 rotate-[14deg] text-mint/20 sm:block">
        <path d="M24 2 29 17 45 18 32 28 36 44 23 34 9 43 14 27 3 17 19 17Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="eyebrow mb-2">START CREATING</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Pick your format. Make it yours.
            </h2>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
              Mini designs for laptops, archival wall prints, or turn your own drawing into die-cuts.
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {cards.map((card) => (
            <li key={card.id} className="min-w-0">
              <Link
                to={card.to}
                className="on-light group relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[26px] border border-[#101815]/90 p-5 sm:p-6 shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_38px_rgba(0,0,0,0.32)]"
                style={{ backgroundColor: card.color }}
              >
                {/* Top Row: Eyebrow + Pill Arrow */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#121212]/80 uppercase">
                    {card.eyebrow}
                  </p>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#121212] text-[#F4F0E8] shadow-sm transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-105">
                    <LuArrowRight aria-hidden className="size-4" />
                  </span>
                </div>

                {/* Center Artwork View */}
                <div className="relative my-3 flex h-[160px] sm:h-[175px] w-full items-center justify-center overflow-hidden">
                  {card.id === 'stickers' && (
                    <div className="relative flex h-full w-full items-center justify-center">
                      <img
                        src={import.meta.env.BASE_URL + 'category-art/stickers-cluster.jpg'}
                        alt="Stickers collection preview"
                        className="h-full max-h-[160px] sm:max-h-[175px] w-auto max-w-full object-contain rounded-xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}

                  {card.id === 'posters' && (
                    <div className="relative flex h-full w-full items-center justify-center">
                      <img
                        src={import.meta.env.BASE_URL + 'category-art/posters-cluster.jpg'}
                        alt="Posters collection preview"
                        className="h-full max-h-[160px] sm:max-h-[175px] w-auto max-w-full object-contain rounded-xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}

                  {card.id === 'shop-your-own' && (
                    <div className="relative flex h-full w-full max-w-[220px] items-center justify-center">
                      {customAccent && (
                        <div className="absolute -top-3 right-6 z-20 w-[54px] rotate-[8deg] drop-shadow-[0_4px_6px_rgba(0,0,0,0.18)]">
                          <StickerSvg design={customAccent} className="h-auto w-full" />
                        </div>
                      )}
                      <div className="relative grid h-[106px] w-[160px] rotate-[-4deg] place-items-center rounded-[14px] border-2 border-dashed border-[#121212] bg-[#F8F7F0] shadow-[0_8px_16px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:rotate-[-1deg]">
                        <div className="grid size-14 place-items-center rounded-lg bg-[#E2E4DE] text-[#121212]">
                          <LuImagePlus aria-hidden className="size-8 text-[#121212]" strokeWidth={1.8} />
                        </div>
                        <span className="absolute -right-2.5 -top-2.5 grid size-7 place-items-center rounded-full border-2 border-[#121212] bg-[#121212] text-white shadow-sm">
                          <span className="text-lg font-bold leading-none">+</span>
                        </span>
                      </div>
                      <span className="absolute bottom-1 right-2 rotate-[6deg] rounded-sm border border-[#121212]/30 bg-[#FFFDF5] px-2 py-0.5 text-[9px] font-extrabold leading-tight text-[#121212] shadow-sm">
                        YOUR IDEA<br />HERE ♡
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Details & CTA */}
                <div className="mt-auto pt-2">
                  <p className="text-[10px] font-bold tracking-wide text-[#121212]/75">
                    {card.countText}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#121212] sm:text-[25px] leading-tight">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 min-h-[2.6rem] text-xs leading-relaxed text-[#121212]/85 sm:text-[13px]">
                    {card.pitch}
                  </p>
                  <span className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-[#121212] px-4.5 py-2 text-xs font-extrabold tracking-[0.06em] text-[#F4F0E8] uppercase transition-all duration-200 group-hover:bg-[#20312c] group-hover:shadow-md">
                    {card.cta} <LuArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
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
    {
      to: '/product/mystery-pack',
      eyebrow: 'SURPRISE INSIDE',
      title: 'Mystery Shop',
      description: 'Choose a series, get five themed stickers you know, plus one extra mystery pick.',
      cta: 'SHOP MYSTERY PACK',
      Icon: LuPackage,
      accent: '#FFD447',
    },
  ];

  return (
    <section aria-labelledby="collect-title" className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
      <SectionHeading
        id="collect-title"
        eyebrow="MORE TO EXPLORE"
        title="Little things worth discovering."
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const isMystery = feature.to === '/product/mystery-pack';
          const isPassport = feature.to === '/collector-passport';
          return (
            <li key={feature.to} className="min-w-0">
              <Link
                to={feature.to}
                className={`group relative flex h-full min-h-[270px] flex-col rounded-[var(--radius-card)] border border-[#315e53] bg-[#071b18] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#a8f0dc] hover:shadow-[0_14px_30px_rgba(0,0,0,0.22)] ${isMystery ? 'holo-shimmer' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-14 place-items-center rounded-2xl border border-[#f4f0e8]/15 shadow-sm" style={{ backgroundColor: feature.accent }}>
                    <feature.Icon aria-hidden className={`size-7 ${feature.accent === '#D90A1F' ? 'text-[#F4F0E8]' : 'text-[#03110f]'}`} strokeWidth={1.8} />
                  </span>
                  <div className="flex items-center gap-2">
                    {isMystery && (
                      <span className="rubber-stamp text-[10px] py-0.5 px-2">5 + 1 ?</span>
                    )}
                    {isPassport && (
                      <span className="rounded border border-dashed border-mint/40 px-2 py-0.5 font-mono text-[9px] text-mint">STAMP CARD</span>
                    )}
                    <span className="grid size-9 place-items-center rounded-full border border-[#315e53] text-[#a8f0dc] transition-all group-hover:border-[#a8f0dc] group-hover:bg-[#a8f0dc] group-hover:text-[#03110f]">
                      <LuArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
                {isMystery && (
                  <div className="my-3 border-t border-dashed border-ink/20 relative">
                    <span className="absolute -top-2 right-2 bg-[#071b18] px-1.5 text-[8px] font-mono tracking-widest text-ink-soft">TEAR HERE ▶</span>
                  </div>
                )}
                <p className="mt-4 text-[10px] font-extrabold tracking-[0.16em]" style={{ color: feature.accent }}>{feature.eyebrow}</p>
                <h3 className="mt-1 font-display text-2xl font-extrabold text-[#F4F0E8]">{feature.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#B5C7C1]">{feature.description}</p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-extrabold tracking-[0.08em] text-[#a8f0dc] transition-colors group-hover:text-[#F4F0E8]">
                  {feature.cta} <LuArrowRight aria-hidden className="size-4" />
                </span>
              </Link>
            </li>
          );
        })}
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
