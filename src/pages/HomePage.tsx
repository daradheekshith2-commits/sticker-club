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
  const posterDesigns = posterProduct?.art.kind === 'poster-set' ? posterProduct.art.posters.slice(0, 3) : [];
  const customAccent = softDaysProduct?.art.kind === 'sheet'
    ? softDaysProduct.art.designs.find((design) => design.name.toLowerCase().includes('cat'))
    : undefined;

  const stickerPositions = [
    { top: '19%', left: '12%', width: '31%', transform: 'rotate(-13deg)', zIndex: 2 },
    { top: '1%', left: '33%', width: '34%', transform: 'rotate(8deg)', zIndex: 3 },
    { top: '18%', left: '58%', width: '29%', transform: 'rotate(13deg)', zIndex: 2 },
    { top: '39%', left: '35%', width: '30%', transform: 'rotate(-5deg)', zIndex: 4 },
  ];

  const posterPositions = [
    { left: '17%', transform: 'rotate(-12deg) translateY(7px)', zIndex: 1 },
    { left: '34%', transform: 'rotate(1deg) translateY(-5px)', zIndex: 3 },
    { left: '51%', transform: 'rotate(12deg) translateY(8px)', zIndex: 2 },
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
    },
    {
      id: 'shop-your-own',
      title: 'Shop Your Own',
      eyebrow: 'MAKE IT PERSONAL',
      pitch: 'Turn your own photo, drawing or idea into a custom sticker.',
      cta: 'START CREATING',
      to: '/create-your-stickers',
      category: null,
      color: '#A8E8C4',
    },
  ];

  return (
    <section className="category-showcase relative isolate overflow-hidden bg-[#06483D] py-6 sm:py-7" aria-label="Shop categories">
      <div aria-hidden className="cinema-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_20%,rgba(27,127,103,0.38),transparent_44%),radial-gradient(ellipse_at_88%_85%,rgba(3,25,21,0.3),transparent_45%)]" />

      <svg aria-hidden viewBox="0 0 48 48" className="pointer-events-none absolute left-[1.5%] top-7 hidden size-9 rotate-[-13deg] text-[#F4D35E] sm:block">
        <path d="M24 2 29 17 45 18 32 28 36 44 23 34 9 43 14 27 3 17 19 17Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      <svg aria-hidden viewBox="0 0 48 48" className="pointer-events-none absolute right-[2%] top-3 hidden size-12 rotate-[12deg] text-[#A8D7C8]/40 sm:block">
        <path d="M24 2 29 17 45 18 32 28 36 44 23 34 9 43 14 27 3 17 19 17Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <svg aria-hidden viewBox="0 0 80 40" className="pointer-events-none absolute bottom-5 left-[1%] hidden w-16 text-[#A8D7C8]/35 sm:block">
        <path d="M3 29c12-20 24-24 34-16S54 30 76 4M8 36c14-15 26-19 39-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <ul className="relative mx-auto grid max-w-[1180px] grid-cols-1 gap-5 px-4 sm:px-6 md:grid-cols-3 md:gap-5">
        {cards.map((card) => (
          <li key={card.id} className="min-w-0">
            <Link
              to={card.to}
              className="on-light group relative flex min-h-[260px] aspect-[1.14/1] flex-col overflow-hidden rounded-[15px] border border-[#101815]/90 p-3.5 shadow-[0_9px_18px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_15px_28px_rgba(0,0,0,0.28)] sm:p-4"
              style={{ backgroundColor: card.color }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold tracking-[0.09em] text-[#121212]/80">{card.eyebrow}</p>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#101312] text-[#F4F0E8] transition-transform duration-200 group-hover:translate-x-0.5">
                  <LuArrowRight aria-hidden className="size-3.5" />
                </span>
              </div>

              <div className="relative mx-auto my-1 flex min-h-0 w-full max-w-[250px] flex-1 items-center justify-center">
                {card.id === 'stickers' && (
                  <div className="relative h-[120px] w-full max-w-[230px]">
                    {stickerDesigns.slice(0, 4).map((design, index) => (
                      <div key={design.name} className="absolute drop-shadow-[0_5px_5px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:scale-105" style={stickerPositions[index]}>
                        <StickerSvg design={design} className="h-auto w-full" />
                      </div>
                    ))}
                    <svg aria-hidden viewBox="0 0 36 36" className="absolute -bottom-1 right-1 size-8 rotate-12 text-[#13856C]">
                      <path d="M18 2 21 13 33 15 23 22 25 34 16 26 5 32 10 21 2 13 14 13Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {card.id === 'posters' && (
                  <div className="relative h-[128px] w-full max-w-[245px]">
                    <div className="washi-tape absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 h-3.5 w-16 -rotate-1 rounded-xs" />
                    {posterDesigns.map((poster, index) => (
                      <div key={poster.title + index} className="absolute top-0 h-[122px] w-[28%] overflow-hidden rounded-[2px] border-[3px] border-[#F8F6EE] bg-white shadow-[0_6px_8px_rgba(0,0,0,0.25)] transition-transform duration-200 group-hover:-translate-y-1" style={posterPositions[index]}>
                        <PosterSvg poster={poster} className="h-full w-full" />
                      </div>
                    ))}
                    <svg aria-hidden viewBox="0 0 32 32" className="absolute -right-1 bottom-0 size-8 rotate-12 text-[#121212]">
                      <path d="M16 2 19 12 30 15 20 20 18 30 13 21 2 24 9 16 5 6 15 11Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {card.id === 'shop-your-own' && (
                  <div className="relative flex h-[128px] w-full max-w-[240px] items-center justify-center">
                    <div className="relative grid h-[100px] w-[178px] rotate-[-5deg] place-items-center rounded-[13px] border-2 border-dashed border-[#141414] bg-[#F8F7F0] shadow-[0_7px_12px_rgba(0,0,0,0.16)] transition-transform duration-200 group-hover:rotate-[-2deg]">
                      <div className="grid size-[66px] place-items-center rounded-md bg-[#D7D8D5] text-[#121212]">
                        <LuImagePlus aria-hidden className="size-12" strokeWidth={1.8} />
                      </div>
                      <span className="absolute -right-2 -top-3 grid size-8 place-items-center rounded-full border-2 border-[#121212] bg-white text-[#121212] shadow-sm">
                        <span className="text-2xl leading-none">+</span>
                      </span>
                    </div>
                    {customAccent && (
                      <div className="absolute -right-0 top-0 w-[64px] -rotate-[7deg] drop-shadow-[0_3px_3px_rgba(0,0,0,0.18)]">
                        <StickerSvg design={customAccent} className="h-auto w-full" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-0 rotate-[5deg] rounded-sm bg-[#FFFDF5] px-2 py-1 text-[9px] font-extrabold leading-tight text-[#121212] shadow-sm">YOUR IDEA<br />HERE ♡</span>
                    <svg aria-hidden viewBox="0 0 32 32" className="absolute left-0 top-1 size-7 -rotate-12 text-[#121212]">
                      <path d="M16 2 19 12 30 15 20 20 18 30 13 21 2 24 9 16 5 6 15 11Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="relative mt-auto">
                {card.category && (
                  <p className="text-[9px] font-medium tracking-wide text-[#121212]/75">
                    {orderable(card.category).length} designs · from {formatPrice(lowestPrice(card.category))}
                  </p>
                )}
                <h2 className="mt-0.5 font-display text-[21px] leading-none font-extrabold tracking-tight text-[#121212] sm:text-[22px]">{card.title}</h2>
                <p className="mt-1.5 min-h-[2.2rem] text-[11px] leading-[1.45] text-[#121212]/85 sm:text-xs">{card.pitch}</p>
                <span className="mt-2 inline-flex min-h-8 items-center gap-2 rounded-full bg-[#101312] px-4 py-2 text-[9px] font-extrabold tracking-[0.06em] text-[#F4F0E8] transition-colors group-hover:bg-[#263b35] sm:text-[10px]">
                  {card.cta} <LuArrowRight aria-hidden className="size-3.5" />
                </span>
              </div>
            </Link>
          </li>
        ))}
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
