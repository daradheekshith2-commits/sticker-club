import { useState } from 'react';
import { LuArrowLeft, LuArrowRight, LuHeart, LuImagePlus, LuMail, LuPackage, LuStamp } from 'react-icons/lu';
import { products } from '../data/products';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link } from '../router/router';
import type { Category } from '../types/product';
import { getProductBySlug, isPurchasable, shopUrl, sortProducts } from '../utils/catalogue';
import { formatPrice } from '../utils/format';
import { PosterSvg } from '../components/art/ProductArt';
import { StickerSvg } from '../components/art/Sticker';
import { ProductGrid } from '../components/product/ProductCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ShopByVibe } from '../components/vibes/ShopByVibe';
import { AnimatedStickerHero } from '../components/home/AnimatedStickerHero';

const orderable = (category: Category) => products.filter((p) => p.category === category && isPurchasable(p));
const lowestPrice = (category: Category) => Math.min(...orderable(category).map((p) => p.price));

// ---------- Shop categories ----------
function CategoryDoors() {
  const stickerProduct = getProductBySlug('campus-survival-sheet');
  const posterProduct = getProductBySlug('desk-wall-pack');
  const softDaysProduct = getProductBySlug('soft-days-sheet');

  const stickerDesigns = stickerProduct?.art.kind === 'sheet' ? stickerProduct.art.designs : [];
  const posterDesigns = posterProduct?.art.kind === 'poster-set' ? posterProduct.art.posters.slice(0, 2) : [];
  const customAccent = softDaysProduct?.art.kind === 'sheet'
    ? softDaysProduct.art.designs.find((design) => design.name.toLowerCase().includes('cat'))
    : undefined;

  const stickerPositions = [
    { top: '12%', left: '8%', width: '33%', transform: 'rotate(-12deg)', zIndex: 2 },
    { top: '2%', left: '34%', width: '35%', transform: 'rotate(6deg)', zIndex: 3 },
    { top: '16%', left: '58%', width: '30%', transform: 'rotate(12deg)', zIndex: 2 },
    { top: '42%', left: '32%', width: '34%', transform: 'rotate(-4deg)', zIndex: 4 },
  ];

  const posterPositions = [
    { left: '16%', transform: 'rotate(-10deg) translateY(4px)', zIndex: 1 },
    { left: '46%', transform: 'rotate(8deg) translateY(-2px)', zIndex: 2 },
  ];

  const cards = [
    {
      id: 'stickers',
      title: 'Stickers',
      eyebrow: 'STICKER ESSENTIALS',
      pitch: 'Mini designs, sheets and themed packs for your everyday things.',
      cta: 'SHOP STICKERS',
      to: shopUrl({ category: 'stickers' }),
      category: 'stickers' as const,
      color: '#FFD447',
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
      color: '#8FD3FF',
      countText: `${orderable('posters').length} designs · from ${formatPrice(lowestPrice('posters'))}`,
    },
    {
      id: 'gifts',
      title: 'Gifts',
      eyebrow: 'GIFTABLE GOODIES',
      pitch: 'Thoughtful little finds, collectible surprises and gifts worth sharing.',
      cta: 'EXPLORE GIFTS',
      to: '/collectibles',
      category: null,
      color: '#FFB3D1',
      countText: 'Curated sets · made to share',
    },
    {
      id: 'shop-your-own',
      title: 'Shop Your Own',
      eyebrow: 'MAKE IT PERSONAL',
      pitch: 'Turn your own photo, drawing or idea into a custom sticker.',
      cta: 'START CREATING',
      to: '/create-your-stickers',
      category: null,
      color: '#A8F0DC',
      countText: 'From 1 piece · custom die-cut',
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-cinema-bg py-12 sm:py-16 md:py-20" aria-label="Shop categories">
      <div aria-hidden className="cinema-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.06]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(7,27,24,0.65),transparent_70%)]" />

      {/* Decorative background doodles inspired by the reference */}
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
              Mini designs for laptops, archival wall prints, giftable mystery packs, or turn your own drawing into die-cuts.
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 lg:gap-6">
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
                <div className="relative my-3 flex h-[160px] sm:h-[175px] w-full items-center justify-center">
                  {card.id === 'stickers' && (
                    <div className="relative h-full w-full max-w-[220px] flex items-center justify-center">
                      <svg aria-hidden viewBox="0 0 24 24" className="absolute -top-1 -left-1 size-6 rotate-[-12deg] text-[#121212]/30">
                        <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                      {stickerDesigns.slice(0, 4).map((design, index) => (
                        <div
                          key={design.name}
                          className="absolute drop-shadow-[0_6px_8px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:scale-105"
                          style={stickerPositions[index]}
                        >
                          <StickerSvg design={design} className="h-auto w-full" />
                        </div>
                      ))}
                      <div className="absolute -left-1 top-2 rotate-[-15deg] rounded-md border border-[#121212] bg-white px-2 py-0.5 shadow-md text-[9px] font-black text-[#121212] leading-tight">
                        YOU'RE<br /><span className="text-[#D90A1F]">★</span> STAR
                      </div>
                      <div className="absolute -bottom-1 right-0 rotate-[8deg] rounded-full border border-[#121212] bg-[#121212] px-2.5 py-0.5 text-[8.5px] font-bold text-white shadow-md">
                        HERE WE GO AGAIN
                      </div>
                    </div>
                  )}

                  {card.id === 'posters' && (
                    <div className="relative h-full w-full max-w-[230px] flex items-center justify-center">
                      {posterDesigns.map((poster, index) => (
                        <div
                          key={poster.title + index}
                          className="absolute top-1 h-[125px] w-[34%] overflow-hidden rounded-[3px] border-[3px] border-[#F8F6EE] bg-white shadow-[0_8px_14px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:-translate-y-1"
                          style={posterPositions[index]}
                        >
                          <div className="washi-tape absolute -top-1.5 left-1/2 z-20 h-3 w-10 -translate-x-1/2 rotate-[-1deg] rounded-xs" />
                          <PosterSvg poster={poster} className="h-full w-full" />
                        </div>
                      ))}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 w-[130px] drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105">
                        <div className="rounded-xl border-2 border-white bg-[#D90A1F] px-2 py-0.5 text-center font-hero text-xs tracking-wider text-white shadow-lg rotate-[-3deg]">
                          SUPRA ★ GT
                        </div>
                      </div>
                      <svg aria-hidden viewBox="0 0 24 24" className="absolute -bottom-1 right-1 size-7 rotate-12 text-[#121212]/35">
                        <path d="M3 18h18l-3-11-5 5-4-8-4 8-5-5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {card.id === 'gifts' && (
                    <div className="relative h-full w-full max-w-[220px] flex items-center justify-center">
                      <svg aria-hidden viewBox="0 0 24 24" className="absolute -top-1 right-2 size-6 rotate-12 text-[#121212]/30">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                      <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="relative size-28 rounded-2xl border-2 border-[#121212] bg-[#FFFDF5] shadow-[0_8px_18px_rgba(18,18,18,0.14)] transition-transform duration-300 group-hover:rotate-[-2deg] group-hover:scale-105 flex items-center justify-center">
                          <div className="absolute inset-y-0 w-5 bg-[#D90A1F] border-x border-[#121212]/40" />
                          <div className="absolute inset-x-0 h-5 bg-[#D90A1F] border-y border-[#121212]/40" />
                          <div className="absolute -top-3.5 flex items-center justify-center z-20">
                            <div className="size-6 rounded-full border-2 border-[#121212] bg-[#D90A1F] -mr-1 rotate-[-20deg]" />
                            <div className="size-6 rounded-full border-2 border-[#121212] bg-[#D90A1F] -ml-1 rotate-[20deg]" />
                            <div className="absolute size-3.5 rounded-full border border-[#121212] bg-[#ff3b4e]" />
                          </div>
                          <div className="absolute -right-3 bottom-1 z-30 rotate-12 rounded-md border border-[#121212] bg-[#FFFDF5] px-2 py-1 text-[8px] font-extrabold leading-tight text-[#121212] shadow-md">
                            GOOD THINGS<br />INSIDE ♡
                          </div>
                        </div>
                        <div className="absolute -left-2 bottom-0 z-20 rotate-[-14deg] rounded-md border-2 border-[#121212] bg-[#D90A1F] px-2 py-0.5 text-[8.5px] font-black text-white shadow-md">
                          COKE
                        </div>
                      </div>
                    </div>
                  )}

                  {card.id === 'shop-your-own' && (
                    <div className="relative h-full w-full max-w-[220px] flex items-center justify-center">
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
                  <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-[#121212]/85 min-h-[2.6rem]">
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
