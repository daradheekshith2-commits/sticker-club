/**
 * STICKER COLLECTOR PASSPORT — /collector-passport
 *
 * 1. The physical card we plan to pack with orders (the real first version).
 * 2. A digital DEMO with mock stamps held in page state only. It is not
 *    linked to purchases, isn't saved, and its "reward" can't be redeemed.
 *    Real progress must come from server records (src/services/rewards.ts).
 */
import { useState } from 'react';
import { LuInfo, LuRotateCcw, LuStamp } from 'react-icons/lu';
import { brand } from '../config/brand';
import { passportConfig } from '../config/passport';
import { series } from '../data/rarity';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link } from '../router/router';
import { passportProgress } from '../utils/community';
import { DemoTag } from '../components/collectible/RarityBadge';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

/** The printed passport card, drawn in HTML. `stamps` fills the first N stamp spaces. */
function PassportCard({ stamps = [], seriesDone = [] }: { stamps?: string[]; seriesDone?: string[] }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border-2 border-ink bg-paper p-4 shadow-[0_10px_20px_rgba(42,32,22,0.18)] sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase">{brand.name}</p>
          <p className="font-display text-2xl leading-none font-extrabold">Collector Passport</p>
        </div>
        <p className="text-right text-[10px] leading-tight font-bold uppercase">
          Name
          <span className="mt-1 block h-4 w-24 border-b border-ink/50" />
        </p>
      </div>
      <p className="mt-3 text-xs font-bold tracking-wide uppercase">Stamps · {passportConfig.stampsGoal} for a reward</p>
      <ol className="mt-2 grid grid-cols-4 gap-2" aria-label="Stamp spaces">
        {Array.from({ length: passportConfig.stampsGoal }, (_, i) => {
          const date = stamps[i];
          return (
            <li key={i} className="text-center">
              <span
                className={`mx-auto grid aspect-square w-full max-w-16 place-items-center rounded-full border-2 ${date ? 'rotate-[-8deg] border-ink bg-lime' : 'border-dashed border-ink/40'}`}
              >
                {date ? <LuStamp aria-label="Stamped" className="size-6" /> : <span className="text-xs font-bold text-ink-soft">{i + 1}</span>}
              </span>
              <span className="mt-1 block text-[10px] text-ink-soft">{date ?? 'date ____'}</span>
            </li>
          );
        })}
      </ol>
      {passportConfig.seriesGoal && (
        <>
          <p className="mt-4 text-xs font-bold tracking-wide uppercase">Series collected</p>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 text-sm">
            {series.map((s) => {
              const done = seriesDone.includes(s.id);
              return (
                <li key={s.id} className="flex items-center gap-2">
                  <span aria-hidden className={`grid size-4 place-items-center rounded border-2 border-ink text-[10px] font-bold ${done ? 'bg-ink text-lime' : 'bg-white'}`}>
                    {done ? '✓' : ''}
                  </span>
                  <span>
                    <strong>{s.id}</strong> {s.name}
                    <span className="sr-only">{done ? ' (collected)' : ' (not yet)'}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <p className="mt-4 rounded-lg bg-white p-2 text-xs">
        <strong>Full card:</strong> {passportConfig.rewardDescription}. <span className="text-ink-soft">(Proposed reward.)</span>
      </p>
    </div>
  );
}

/** Demo stamps carry no dates, so they can't be mistaken for real orders. */
const demoDates = Array.from({ length: passportConfig.stampsGoal }, () => 'demo stamp');

function DigitalDemo() {
  const [stamps, setStamps] = useState(2);
  const [seriesDone, setSeriesDone] = useState<string[]>(['S01']);
  const progress = passportProgress(stamps, passportConfig.stampsGoal);
  return (
    <section aria-labelledby="digital-title" className="rounded-[var(--radius-card)] border-2 border-dashed border-ink bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="digital-title" className="text-2xl font-extrabold">
          Digital passport preview
        </h2>
        <DemoTag>Demonstration · mock data</DemoTag>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        A preview of how an online passport could look. These stamps are made up and live only on this page — they reset when you leave, aren’t linked to any purchase, and can’t earn a real reward.
      </p>
      <div className="mt-5 grid items-start gap-6 md:grid-cols-[1fr_1fr]">
        <PassportCard stamps={demoDates.slice(0, progress.count)} seriesDone={seriesDone} />
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-bold">Demo progress</span>
              <span className="tabular-nums" aria-live="polite">
                {progress.count} / {progress.goal} stamps
              </span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-paper-deep" role="progressbar" aria-valuemin={0} aria-valuemax={progress.goal} aria-valuenow={progress.count} aria-label="Demo stamps">
              <div className="h-full rounded-full bg-ink transition-[width]" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary px-4 py-2" disabled={progress.complete} onClick={() => setStamps((n) => n + 1)}>
              <LuStamp aria-hidden /> Add a demo stamp
            </button>
            <button
              type="button"
              className="btn-ghost px-4 py-2"
              onClick={() => {
                setStamps(0);
                setSeriesDone([]);
              }}
            >
              <LuRotateCcw aria-hidden /> Reset demo
            </button>
          </div>
          <fieldset className="min-w-0">
            <legend className="text-sm font-bold">Demo series ticks</legend>
            <div className="mt-1 grid grid-cols-2 gap-1.5 text-sm">
              {series.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-ink"
                    checked={seriesDone.includes(s.id)}
                    onChange={(e) => setSeriesDone((d) => (e.target.checked ? [...d, s.id] : d.filter((x) => x !== s.id)))}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </fieldset>
          {progress.complete && (
            <p role="status" className="rounded-xl note-success p-3 text-sm font-bold">
              Demo card complete. In the real programme this is where the reward would unlock — this demo reward can’t be redeemed.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function PassportPage() {
  usePageMeta('Sticker Collector Passport', 'A collector card that fills up with stamps as you order.');
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Collectibles', to: '/collectibles' }, { label: 'Collector Passport' }]} />
      <h1 className="mt-4 text-4xl leading-none font-extrabold md:text-6xl">Sticker Collector Passport</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">A pocket-sized card that fills up as you collect. Get a stamp with each order, tick off every series, and a full card earns a small reward.</p>
      <p className="mt-4 flex max-w-3xl gap-2 rounded-xl bg-white p-3 text-sm">
        <LuInfo aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Planned programme.</strong> The passport isn’t running yet. Stamp rules, the goal and the reward below are proposals and may change.
        </span>
      </p>

      <section aria-labelledby="physical-title" className="mt-8 grid items-center gap-8 md:grid-cols-[1fr_1fr]">
        <PassportCard />
        <div>
          <p className="eyebrow">Version 1 · printed card</p>
          <h2 id="physical-title" className="mt-1 text-3xl font-extrabold">
            How it’s meant to work
          </h2>
          <ol className="mt-4 space-y-3">
            {[
              ['Get your card', 'A blank passport comes in your first eligible order.'],
              ['Collect stamps', passportConfig.stampRule],
              ['Tick off series', 'Mark each series once you own a design from it.'],
              ['Fill the card', `${passportConfig.stampsGoal} stamps earn ${passportConfig.rewardDescription.toLowerCase()} (proposed).`],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-lime">{i + 1}</span>
                <span>
                  <strong>{t}.</strong> <span className="text-ink-soft">{b}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-ink-soft">
            Stamps are added by us when we pack your order, so the paper card is the record for now. Rewards stay small on purpose, so the programme stays affordable for a new brand.
          </p>
        </div>
      </section>

      <div className="mt-12">
        <DigitalDemo />
      </div>

      <section aria-labelledby="honest-title" className="mt-10 rounded-[var(--radius-card)] bg-paper-deep p-5 sm:p-6">
        <h2 id="honest-title" className="text-xl font-extrabold">
          Why the online version isn’t real yet
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
          <li>Progress saved in a browser can be edited by anyone and doesn’t move between phones and laptops, so it can’t prove what someone bought.</li>
          <li>A real digital passport needs accounts and server records of completed orders. Rewards will only ever be given from those records — never from a counter on a web page.</li>
          <li>
            Until then, the printed card is the passport. See what you can collect in the <Link to="/rare-collections" className="font-bold underline">collection explorer</Link>.
          </li>
        </ul>
      </section>
    </div>
  );
}
