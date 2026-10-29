/**
 * VOTE FOR THE NEXT DROP — /vote-next-drop (also the packaging QR destination)
 *
 * A working prototype: choosing, voting and submitting all respond, but go
 * through the DEMO community API (src/services/community.ts), which sends
 * nothing and counts nothing. No vote totals are shown because none exist.
 */
import { useState, type FormEvent } from 'react';
import { LuCheck, LuInfo, LuSend, LuVote } from 'react-icons/lu';
import { brand } from '../config/brand';
import { dropProposals, upcomingDrop, VOTE_PATH } from '../data/drops';
import { usePageMeta } from '../hooks/usePageMeta';
import { communityApi } from '../services/community';
import { IDEA_MAX, validateIdea, type IdeaErrors } from '../utils/community';
import { isLocalAddress } from '../utils/qr';
import { motifs } from '../components/art/motifs';
import { DemoTag } from '../components/collectible/RarityBadge';
import { QrCode } from '../components/collectible/QrCode';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

function ThemeArt({ motif, color }: { motif: (typeof dropProposals)[number]['motif']; color: string }) {
  const Motif = motifs[motif];
  return (
    <svg viewBox="0 0 100 100" className="size-14 shrink-0 rounded-xl border-2 border-ink" style={{ backgroundColor: color }} aria-hidden>
      <g transform="translate(14 14) scale(0.72)">
        <Motif fg="#121212" bg={color} accent="#FFFFFF" />
      </g>
    </svg>
  );
}

function VoteSection() {
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [directionId, setDirectionId] = useState<string | null>(null);
  const [result, setResult] = useState<{ theme: string; direction: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const proposal = dropProposals.find((p) => p.id === proposalId);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!proposal) return setError('Choose a theme first.');
    const direction = proposal.directions.find((d) => d.id === directionId);
    if (!direction) return setError('Choose a design direction for that theme.');
    setError(null);
    const res = await communityApi.castVote({ proposalId: proposal.id, directionId: direction.id });
    if (res.ok) setResult({ theme: proposal.theme, direction: direction.name, message: res.message });
    else setError(res.message);
  };

  return (
    <section aria-labelledby="vote-title" className="rounded-[var(--radius-card)] border-2 border-ink bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="vote-title" className="text-2xl font-extrabold md:text-3xl">
          Vote on next month’s theme
        </h2>
        {communityApi.mode === 'demo' && <DemoTag>Demo voting</DemoTag>}
      </div>
      <p className="mt-1 text-sm text-ink-soft">Pick one theme, then the style you’d most like to see.</p>

      <form onSubmit={submit} className="mt-5 space-y-5">
        <fieldset className="min-w-0">
          <legend className="mb-2 font-bold">1. Theme</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {dropProposals.map((p) => (
              <label
                key={p.id}
                className={`relative flex cursor-pointer gap-3 rounded-xl border-2 p-3 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink ${proposalId === p.id ? 'border-ink bg-lime' : 'border-ink/15 hover:border-ink/40'}`}
              >
                <input
                  type="radio"
                  name="drop-theme"
                  className="sr-only"
                  checked={proposalId === p.id}
                  onChange={() => {
                    setProposalId(p.id);
                    setDirectionId(null);
                    setResult(null);
                  }}
                />
                <ThemeArt motif={p.motif} color={p.color} />
                <span className="min-w-0">
                  <span className="block font-bold">{p.theme}</span>
                  <span className="block text-xs text-ink-soft">{p.pitch}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="min-w-0" disabled={!proposal}>
          <legend className="mb-2 font-bold">2. Design direction {proposal ? `for ${proposal.theme}` : ''}</legend>
          {!proposal && <p className="text-sm text-ink-soft">Choose a theme above to see its directions.</p>}
          {proposal && (
            <div className="grid gap-2 sm:grid-cols-3">
              {proposal.directions.map((d) => (
                <label
                  key={d.id}
                  className={`relative cursor-pointer rounded-xl border-2 p-3 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink ${directionId === d.id ? 'border-ink bg-lime' : 'border-ink/15 hover:border-ink/40'}`}
                >
                  <input type="radio" name="drop-direction" className="sr-only" checked={directionId === d.id} onChange={() => setDirectionId(d.id)} />
                  <span className="block font-bold">{d.name}</span>
                  <span className="block text-xs text-ink-soft">{d.description}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {error && (
          <p role="alert" className="text-sm font-bold text-danger">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full sm:w-auto">
          <LuVote aria-hidden /> {communityApi.mode === 'demo' ? 'Submit demo vote' : 'Submit vote'}
        </button>
      </form>

      {result && (
        <div role="status" className="mt-4 rounded-xl border-2 border-ink bg-paper p-4 text-sm">
          <p className="flex items-center gap-2 font-bold">
            <LuCheck aria-hidden /> You picked {result.theme} · {result.direction}
          </p>
          <p className="mt-1 text-ink-soft">{result.message} No totals are shown because there are no real votes yet — results will appear here once live voting starts.</p>
        </div>
      )}
    </section>
  );
}

function IdeaSection() {
  const [proposalId, setProposalId] = useState('');
  const [idea, setIdea] = useState('');
  const [name, setName] = useState('');
  const [original, setOriginal] = useState(false);
  const [errors, setErrors] = useState<IdeaErrors>({});
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const input = { proposalId, idea, name, originalConfirmed: original };
    const found = validateIdea(input);
    setErrors(found);
    if (Object.keys(found).length) return;
    const res = await communityApi.submitIdea(input);
    setDone(res.message);
    setIdea('');
    setName('');
    setOriginal(false);
  };

  const err = (k: keyof IdeaErrors) =>
    errors[k] ? (
      <p id={`idea-${k}-error`} className="mt-1 text-sm font-bold text-danger">
        {errors[k]}
      </p>
    ) : null;

  return (
    <section aria-labelledby="idea-title" className="rounded-[var(--radius-card)] border-2 border-ink/10 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="idea-title" className="text-2xl font-extrabold">
          Submit a design idea
        </h2>
        {communityApi.mode === 'demo' && <DemoTag>Not sent</DemoTag>}
      </div>
      <p className="mt-1 text-sm text-ink-soft">Describe it in words. We draw every design ourselves, so please don’t send other people’s artwork, characters or logos.</p>
      <form onSubmit={submit} noValidate className="mt-4 space-y-4">
        <div>
          <label htmlFor="idea-theme" className="field-label">
            Theme
          </label>
          <select id="idea-theme" value={proposalId} onChange={(e) => setProposalId(e.target.value)} className="field-input" aria-invalid={Boolean(errors.proposalId)} aria-describedby={errors.proposalId ? 'idea-proposalId-error' : undefined}>
            <option value="">Choose a theme</option>
            {dropProposals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.theme}
              </option>
            ))}
          </select>
          {err('proposalId')}
        </div>
        <div>
          <label htmlFor="idea-text" className="field-label">
            Your idea
          </label>
          <textarea
            id="idea-text"
            rows={3}
            maxLength={IDEA_MAX + 50}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="field-input"
            placeholder="e.g. A sleepy samosa on a hostel bunk bed"
            aria-invalid={Boolean(errors.idea)}
            aria-describedby={errors.idea ? 'idea-idea-error' : 'idea-count'}
          />
          <p id="idea-count" className="mt-1 text-xs text-ink-soft">
            {idea.trim().length}/{IDEA_MAX}
          </p>
          {err('idea')}
        </div>
        <div>
          <label htmlFor="idea-name" className="field-label">
            Name or handle to credit <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <input id="idea-name" value={name} onChange={(e) => setName(e.target.value)} className="field-input" aria-invalid={Boolean(errors.name)} />
          {err('name')}
        </div>
        <div>
          <label className="flex cursor-pointer gap-2.5 text-sm">
            <input type="checkbox" checked={original} onChange={(e) => setOriginal(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-ink" aria-invalid={Boolean(errors.originalConfirmed)} />
            <span className="font-bold">This is my own idea and doesn’t copy existing characters, logos or artwork.</span>
          </label>
          {err('originalConfirmed')}
        </div>
        <button type="submit" className="btn-primary">
          <LuSend aria-hidden /> {communityApi.mode === 'demo' ? 'Check idea (demo)' : 'Send idea'}
        </button>
      </form>
      {done && (
        <p role="status" className="mt-4 rounded-xl note-success p-3 text-sm font-bold">
          {done}
        </p>
      )}
    </section>
  );
}

function QrSection() {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const base = brand.publicUrl ?? origin;
  const target = `${base.replace(/\/$/, '')}${VOTE_PATH}`;
  const local = isLocalAddress(target);
  return (
    <section aria-labelledby="qr-title" className="grid gap-5 rounded-[var(--radius-card)] border border-mint/15 bg-paper-deep p-5 text-ink sm:grid-cols-[auto_1fr] sm:p-6">
      <div className="relative mx-auto w-44 rounded-2xl bg-paper p-3 text-ink">
        <QrCode value={target} className={`h-auto w-full ${local ? 'opacity-40' : ''}`} label={`QR code linking to ${target}`} />
        <p className="mt-2 text-center text-[10px] font-bold tracking-widest uppercase">Scan to vote</p>
        {local && <span className="absolute inset-x-2 top-[38%] rounded-md bg-tomato px-2 py-1 text-center text-xs font-bold text-on-light">Preview only</span>}
      </div>
      <div className="min-w-0">
        <p className="eyebrow text-cinema-red">Packaging insert</p>
        <h2 id="qr-title" className="mt-1 text-2xl font-extrabold">
          The QR card in every package
        </h2>
        <p className="mt-2 text-sm text-ink/85">
          Each order is planned to include a small card with a QR code that opens this page, so customers can vote on the next drop straight from the unboxing.
        </p>
        <p className="mt-3 text-sm break-words">
          This code points to <code className="rounded bg-ink/10 px-1">{target}</code>.
        </p>
        <p className="mt-2 text-sm text-ink/85">
          {local
            ? 'That address only works on this computer, so this code is a preview — it would not open for customers. Once the site is deployed, set publicUrl in src/config/brand.ts and the printed code will use your public address.'
            : brand.publicUrl
              ? 'This uses the public address set in src/config/brand.ts, which is what the printed insert should use.'
              : 'This is the address of the current deployment. Before printing, set publicUrl in src/config/brand.ts to your final domain so the code doesn’t point at a temporary preview link.'}
        </p>
      </div>
    </section>
  );
}

export function VotePage() {
  usePageMeta('Vote for the next drop', 'Help choose the theme and style of the next sticker drop.');
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Collectibles', to: '/collectibles' }, { label: 'Vote for the next drop' }]} />
      <h1 className="mt-4 text-4xl leading-none font-extrabold md:text-6xl">Design the next drop</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Vote on a theme, choose a style and send us your ideas. The most-wanted direction shapes what we draw next.</p>
      <p className="mt-4 flex max-w-3xl gap-2 rounded-xl bg-white p-3 text-sm">
        <LuInfo aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Prototype.</strong> Voting and idea submission work on this page, but nothing is sent or saved, and votes from different people and devices aren’t combined yet. That’s why no vote counts are shown.
        </span>
      </p>

      <section aria-labelledby="upcoming-title" className="panel-glow mt-8 rounded-[var(--radius-card)] p-5">
        <p className="eyebrow">Upcoming</p>
        <h2 id="upcoming-title" className="mt-1 text-2xl font-extrabold">
          {upcomingDrop.code}
        </h2>
        <p className="mt-1 text-sm font-bold">{upcomingDrop.status}</p>
        <p className="mt-2 max-w-2xl">{upcomingDrop.summary}</p>
      </section>

      <div className="mt-6 space-y-6">
        <VoteSection />
        <IdeaSection />
        <QrSection />
      </div>
    </div>
  );
}
