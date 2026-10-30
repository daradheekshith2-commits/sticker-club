import { useState } from 'react';
import { LuArrowLeft, LuArrowRight, LuHeart, LuMail, LuPackage, LuStamp } from 'react-icons/lu';
import { products } from '../data/products';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link } from '../router/router';
import type { Category } from '../types/product';
import { isPurchasable, shopUrl, sortProducts } from '../utils/catalogue';
import { formatPrice } from '../utils/format';
import { ProductGrid } from '../components/product/ProductCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ShopByVibe } from '../components/vibes/ShopByVibe';
import { AnimatedStickerHero } from '../components/home/AnimatedStickerHero';

const orderable = (category: Category) => products.filter((p) => p.category === category && isPurchasable(p));
const lowestPrice = (category: Category) => Math.min(...orderable(category).map((p) => p.price));

// ---------- Shop categories ----------
function CategoryDoors() {
  const cards = [
    { id: 'stickers', eyebrow: 'STICKER ESSENTIALS', title: 'Stickers', description: 'Mini designs, sheets and themed packs for your everyday things.', cta: 'SHOP STICKERS', to: shopUrl({ category: 'stickers' }), category: 'stickers' as const, color: '#FFE16B', image: '/category-art/stickers.webp', alt: 'Layered character sticker collage with playful text stickers and stars' },
    { id: 'posters', eyebrow: 'WALL ART', title: 'Posters', description: 'Give your room, hostel or workspace a little more personality.', cta: 'SHOP POSTERS', to: shopUrl({ category: 'posters' }), category: 'posters' as const, color: '#A6DFF4', image: '/category-art/posters.webp', alt: 'Three overlapping poster prints featuring superhero and automotive artwork' },
    { id: 'custom', eyebrow: 'MAKE IT PERSONAL', title: 'Shop Your Own', description: 'Turn your own photo, drawing or idea into a custom sticker.', cta: 'START CREATING', to: '/create-your-stickers', category: null, color: '#A8E8C4', image: '/category-art/custom.webp', alt: 'Custom sticker upload card with cat illustration and plus symbol' },
  ];

  return (
    <section className="category-showcase relative isolate overflow-hidden bg-[#06483D] py-6 sm:py-7" aria-label="Shop categories">
      <div aria-hidden="true" className="cinema-grain pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_25%,rgba(25,115,96,0.42),transparent_55%),radial-gradient(ellipse_at_85%_85%,rgba(0,23,20,0.5),transparent_48%)]" />
      <ul className="relative mx-auto grid max-w-[1040px] grid-cols-1 gap-5 px-4 sm:px-7 md:grid-cols-3 md:gap-5">
        {cards.map((card) => (
          <li key={card.id} className="min-w-0">
            <Link to={card.to} style={{ backgroundColor: card.color }} className="on-light group relative flex aspect-[1.14/1] min-h-[275px] flex-col overflow-hidden rounded-[12px] border border-[#14231D]/85 px-[15px] pb-3 pt-[13px] shadow-[0_8px_18px_rgba(0,0,0,.25)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_15px_28px_rgba(0,0,0,.28)] focus-visible:outline-4 focus-visible:outline-white">
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold tracking-[.08em] text-[#121212]">{card.eyebrow}</span>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#101312] text-white transition-transform group-hover:translate-x-1"><LuArrowRight aria-hidden="true" className="size-4" /></span>
              </div>
              <div className="relative my-1 flex min-h-[145px] flex-1 items-center justify-center overflow-visible" aria-hidden="true">
                <img src={card.image} alt={card.alt} className="h-full max-h-[180px] w-full max-w-[290px] object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,.18)] transition-transform duration-200 group-hover:scale-[1.035]" loading="lazy" decoding="async" />
              </div>
              <div className="relative z-10 mt-auto">
                {card.category && <p className="text-[9px] tracking-wide text-[#111]/80">{orderable(card.category).length} designs · from {formatPrice(lowestPrice(card.category))}</p>}
                <h2 className="mt-0.5 font-display text-[22px] font-extrabold leading-none tracking-tight text-[#111]">{card.title}</h2>
                <p className="mt-1 min-h-[2rem] text-[11px] leading-[1.25] text-[#111]/85">{card.description}</p>
                <span className="mt-1.5 inline-flex min-h-7 items-center gap-2 rounded-full bg-[#101312] px-4 py-1.5 text-[9px] font-extrabold tracking-[.03em] text-white group-hover:bg-[#263B35]">{card.cta}<LuArrowRight aria-hidden="true" className="size-3.5" /></span>
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
