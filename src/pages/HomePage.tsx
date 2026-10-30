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
// Keep the three category destinations tied to the existing catalogue and custom editor.
function DoodleStar({ className = '' }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"><path d="m24 3 5.6 15.1L45 22l-13.3 9.4L34 46 23.1 36 9 43l5-15L3 18l16-1z" /></svg>;
}

function CategoryDoors() {
  const stickerProduct = getProductBySlug('campus-survival-sheet');
  const posterProduct = getProductBySlug('desk-wall-pack');
  const softDaysProduct = getProductBySlug('soft-days-sheet');
  const stickerDesigns = stickerProduct?.art.kind === 'sheet' ? stickerProduct.art.designs : [];
  const posterDesigns = posterProduct?.art.kind === 'poster-set' ? posterProduct.art.posters.slice(0, 3) : [];
  const catDesign = softDaysProduct?.art.kind === 'sheet'
    ? softDaysProduct.art.designs.find((design) => design.name.toLowerCase().includes('cat'))
    : undefined;
  const cards = [
    { id: 'stickers', eyebrow: 'STICKER ESSENTIALS', title: 'Stickers', description: 'Mini designs, sheets and themed packs for your everyday things.', cta: 'SHOP STICKERS', to: shopUrl({ category: 'stickers' }), category: 'stickers' as const, color: '#FFE16B' },
    { id: 'posters', eyebrow: 'WALL ART', title: 'Posters', description: 'Give your room, hostel or workspace a little more personality.', cta: 'SHOP POSTERS', to: shopUrl({ category: 'posters' }), category: 'posters' as const, color: '#A6DFF4' },
    { id: 'custom', eyebrow: 'MAKE IT PERSONAL', title: 'Shop Your Own', description: 'Turn your own photo, drawing or idea into a custom sticker.', cta: 'START CREATING', to: '/create-your-stickers', category: null, color: '#A8E8C4' },
  ];
  return (
    <section className="category-showcase relative isolate overflow-hidden bg-[#06483D] py-6 sm:py-7" aria-label="Shop categories">
      <div aria-hidden="true" className="cinema-grain pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_25%,rgba(25,115,96,0.42),transparent_55%),radial-gradient(ellipse_at_85%_85%,rgba(0,23,20,0.5),transparent_48%)]" />
      <DoodleStar className="pointer-events-none absolute left-[1%] top-[12%] hidden size-10 -rotate-12 text-[#FFD85F] lg:block" />
      <DoodleStar className="pointer-events-none absolute right-[1%] top-[7%] hidden size-12 rotate-12 text-[#7FC0AF]/35 lg:block" />
      <svg aria-hidden="true" className="pointer-events-none absolute bottom-6 left-3 hidden w-16 text-[#7FC0AF]/35 lg:block" viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 35q20-40 36-15T78 4M12 39q18-18 35-10" /></svg>
      <ul className="relative mx-auto grid max-w-[1040px] grid-cols-1 gap-5 px-4 sm:px-7 md:grid-cols-3 md:gap-5">
        {cards.map((card) => (
          <li key={card.id} className="min-w-0">
            <Link to={card.to} style={{ backgroundColor: card.color }} className="on-light group relative flex aspect-[1.14/1] min-h-[275px] flex-col overflow-hidden rounded-[12px] border border-[#14231D]/85 px-[15px] pb-3 pt-[13px] shadow-[0_8px_18px_rgba(0,0,0,.25)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_15px_28px_rgba(0,0,0,.28)] focus-visible:outline-4 focus-visible:outline-white">
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold tracking-[.08em] text-[#121212]">{card.eyebrow}</span>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#101312] text-white transition-transform group-hover:translate-x-1"><LuArrowRight aria-hidden="true" className="size-4" /></span>
              </div>
              <div className="relative my-1 min-h-[145px] flex-1" aria-hidden="true">
                {card.id === 'stickers' && (
                  <div className="absolute inset-0 mx-auto w-full max-w-[265px]">
                    <DoodleStar className="absolute left-[3%] top-[4%] z-10 size-7 -rotate-12 text-[#111]" />
                    <DoodleStar className="absolute right-[8%] top-[8%] z-10 size-5 rotate-12 text-[#111]" />
                    <DoodleStar className="absolute right-[0%] bottom-[7%] z-10 size-9 rotate-12 text-[#138970]" />
                    {stickerDesigns.slice(0, 4).map((design, index) => (
                      <div key={design.name} className="absolute drop-shadow-[0_5px_3px_rgba(0,0,0,.28)] transition-transform group-hover:scale-105" style={[
                        { top: '8%', left: '32%', width: '39%', transform: 'rotate(12deg)', zIndex: 1 },
                        { top: '30%', left: '8%', width: '40%', transform: 'rotate(-17deg)', zIndex: 2 },
                        { top: '29%', left: '55%', width: '37%', transform: 'rotate(15deg)', zIndex: 2 },
                        { top: '50%', left: '31%', width: '37%', transform: 'rotate(-9deg)', zIndex: 3 },
                      ][index]}><StickerSvg design={design} className="h-auto w-full" /></div>
                    ))}
                    <div className="absolute left-[1%] top-[35%] z-[4] -rotate-[14deg] rounded-[8px] border-[3px] border-white bg-[#F7B83B] px-2 py-1 text-center text-[11px] font-black leading-[1.02] text-[#302000] shadow-[0_4px_6px_#0004]">YOU'RE<br />A STAR ★</div>
                    <div className="absolute bottom-[3%] right-[12%] z-[5] -rotate-[8deg] rounded-[8px] border-[3px] border-white bg-[#1B1C1B] px-2 py-1 text-center text-[12px] font-black leading-[.99] text-white shadow-[0_4px_6px_#0004]">oh shit..<br />here we<br />go again</div>
                  </div>
                )}
                {card.id === 'posters' && (
                  <div className="absolute inset-0 mx-auto w-full max-w-[265px]">
                    <DoodleStar className="absolute left-[4%] top-[2%] size-5 -rotate-12 text-[#131313]" />
                    <DoodleStar className="absolute right-[2%] bottom-[8%] size-8 rotate-12 text-[#131313]" />
                    <svg className="absolute right-[14%] top-[5%] size-8" viewBox="0 0 40 40" fill="none" stroke="#111" strokeWidth="1.8"><path d="m5 20 9-8 1 11 16-13-5 17 9-2" /></svg>
                    {posterDesigns.map((poster, index) => (
                      <div key={poster.title + index} className="absolute top-[9%] h-[82%] w-[35%] overflow-hidden border-[5px] border-[#FFFCF4] bg-white shadow-[0_7px_10px_#0005] transition-transform duration-200 group-hover:-translate-y-1" style={[
                        { left: '15%', transform: 'rotate(-13deg)', zIndex: 1 },
                        { left: '34%', transform: 'rotate(3deg)', zIndex: 3 },
                        { left: '54%', transform: 'rotate(13deg)', zIndex: 2 },
                      ][index]}>
                        <PosterSvg poster={poster} className="h-full w-full" />
                      </div>
                    ))}
                    <span className="absolute left-[46%] top-[5%] z-[5] h-3 w-10 -rotate-2 bg-[#E5D5AC]/90 shadow-sm" />
                    <span className="absolute bottom-[2%] right-[21%] h-4 w-4 rounded-full border-2 border-[#141414]" />
                  </div>
                )}
                {card.id === 'custom' && (
                  <div className="absolute inset-0 mx-auto w-full max-w-[265px]">
                    <DoodleStar className="absolute left-[5%] top-[26%] size-7 -rotate-12 text-[#101010]" />
                    <DoodleStar className="absolute right-[4%] top-[15%] size-5 rotate-12 text-[#101010]" />
                    <DoodleStar className="absolute left-[12%] bottom-[3%] size-6 rotate-12 text-[#138970]" />
                    <div className="absolute left-[18%] top-[29%] grid h-[63%] w-[66%] -rotate-[7deg] place-items-center rounded-xl border-2 border-dashed border-[#222] bg-[#FFFDF6] shadow-[0_7px_10px_#0003] transition-transform group-hover:rotate-[-3deg]">
                      <div className="grid size-[65px] place-items-center rounded-[7px] bg-[#D7D8D6] text-[#111]"><LuImagePlus aria-hidden="true" className="size-11" strokeWidth={1.8} /></div>
                    </div>
                    {catDesign && <div className="absolute right-[15%] top-[3%] z-10 w-[70px] -rotate-12 drop-shadow-[0_4px_3px_#0003]"><StickerSvg design={catDesign} className="h-auto w-full" /></div>}
                    <span className="absolute right-[12%] top-[20%] z-20 grid size-9 place-items-center rounded-full border-2 border-[#121212] bg-[#111] text-[28px] font-semibold leading-none text-white shadow-[0_3px_5px_#0004]">+</span>
                    <span className="absolute bottom-[7%] right-[3%] z-10 rotate-[5deg] rounded-md border border-[#DEDCBE] bg-[#FFFDF5] px-2 py-1 text-[10px] font-extrabold leading-tight text-[#111] shadow-[0_4px_5px_#0003]">YOUR IDEA<br />HERE ♡</span>
                  </div>
                )}
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
