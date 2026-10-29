/**
 * ABOUT, FAQ, CONTACT, POLICIES and 404.
 * All copy here is a first draft. Policy pages are placeholders on purpose:
 * replace them with real, founder-approved terms before taking real orders.
 */
import type { ReactNode } from 'react';
import { LuInstagram, LuMail, LuMessageCircle } from 'react-icons/lu';
import { brand, hasAnyContact, whatsappLink } from '../config/brand';
import { usePageMeta } from '../hooks/usePageMeta';
import { Link, useParams } from '../router/router';
import { shopUrl } from '../utils/catalogue';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { Notice, Placeholder } from '../components/ui/Placeholder';

function Page({ title, crumb, intro, children }: { title: string; crumb: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: crumb }]} />
      <h1 className="mt-4 text-5xl leading-[0.95] font-extrabold md:text-7xl">{title}</h1>
      {intro && <p className="mt-5 text-xl text-ink-soft">{intro}</p>}
      <div className="mt-10 space-y-6 text-lg leading-relaxed [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-extrabold">{children}</div>
    </div>
  );
}

export function AboutPage() {
  usePageMeta('About', `What ${brand.displayName} is, who it’s for and how we’re starting.`);
  return (
    <Page title="Started small, on purpose." crumb="About" intro={`${brand.displayName} is a student-run sticker and poster brand starting out in ${brand.city}.`}>
      <p>
        We make original stickers — minis, sheets and themed packs — for the things you carry every day, and posters and wall packs for the rooms you live in:
        hostel rooms, PGs and desks.
      </p>
      <p>
        We’re at the very beginning. This website is our first draft, the products are demo designs, and we’re talking to students on our own campus to
        find out what they’d actually buy before we print anything at scale.
      </p>
      <h2>How we plan to work</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Every design is drawn by us. No copied artwork, logos or characters.</li>
        <li>We print in small batches with local suppliers, after testing samples ourselves.</li>
        <li>We’ll start with campus pickup and simple delivery, then grow if people like what we make.</li>
        <li>Stickers and posters are equal parts of the range. Custom photo collages may come later.</li>
      </ul>
      <h2>Help us decide</h2>
      <p>Tell us which designs you’d buy, what’s missing and what feels too expensive. Honest feedback is the most useful thing you can give us right now.</p>
      <div className="flex flex-wrap gap-3">
        <Link to={shopUrl({ category: 'stickers' })} className="btn-primary">
          Browse the demo range
        </Link>
        <Link to="/contact" className="btn-ghost">
          Get in touch
        </Link>
      </div>
    </Page>
  );
}

const faqs: { q: string; a: ReactNode }[] = [
  { q: 'Can I actually order right now?', a: 'Not yet. This is a prototype store: the cart and checkout preview work, but no orders or payments are processed. We’ll announce when real ordering opens.' },
  { q: 'What’s the difference between a sticker sheet and a pack?', a: 'A sticker sheet has several small stickers kiss-cut on one backing sheet — you peel them off one by one. A pack contains separate, individually cut stickers grouped around a theme.' },
  { q: 'What size and material are the stickers?', a: 'We’re still testing samples from suppliers, so sizes, materials and finishes aren’t confirmed. We’ll list them on each product once they are — we won’t claim things like waterproofing until we’ve tested it.' },
  { q: 'What poster sizes are there?', a: 'Single posters come in A5 (14.8 × 21 cm), A4 (21 × 29.7 cm) and A3 (29.7 × 42 cm). Wall packs and sets are A4. Paper type and finish will be confirmed after sampling.' },
  { q: 'How do I put posters up without damaging the wall?', a: 'Removable mounting putty or removable tape is usually the gentlest option for hostel and PG walls. Check what your accommodation allows first.' },
  { q: 'How will I get my order?', a: 'We plan to start with pickup on campus and simple local delivery in Hyderabad. Exact arrangements and any charges will be confirmed before launch.' },
  { q: 'Are the prices final?', a: 'No. The prices shown are test prices we’re using to learn what feels fair. They may change before launch.' },
  { q: 'Will you make custom stickers or photo posters?', a: 'Maybe later. A personalised photo collage is on our list, but we want to get the core range right first.' },
  { q: 'Are the designs original?', a: 'Yes. Every design is our own. We don’t use logos, characters or artwork from other brands, shows or games.' },
];

export function FaqPage() {
  usePageMeta('FAQ', 'Answers to common questions about our stickers, ordering and delivery.');
  return (
    <Page title="Questions, answered." crumb="FAQ">
      <div className="divide-y-2 divide-ink/10 border-y-2 border-ink/10">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-extrabold">
              {f.q}
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
    </Page>
  );
}

export function ContactPage() {
  usePageMeta('Contact', `How to reach ${brand.displayName}.`);
  const { email, instagramUrl, instagramHandle } = brand.contact;
  const wa = whatsappLink('Hi! I found your sticker store.');
  return (
    <Page title="Say hi." crumb="Contact" intro="Questions, design requests, feedback on prices — we want to hear all of it.">
      {hasAnyContact() ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {instagramUrl && (
            <li>
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-white p-5 font-bold hover:bg-lime">
                <LuInstagram aria-hidden className="size-6" /> {instagramHandle ?? 'Instagram'}
              </a>
            </li>
          )}
          {wa && (
            <li>
              <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-white p-5 font-bold hover:bg-lime">
                <LuMessageCircle aria-hidden className="size-6" /> WhatsApp
              </a>
            </li>
          )}
          {email && (
            <li>
              <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-white p-5 font-bold hover:bg-lime">
                <LuMail aria-hidden className="size-6" /> {email}
              </a>
            </li>
          )}
        </ul>
      ) : (
        <Notice>
          <p className="font-bold">Contact details aren’t set up yet.</p>
          <p className="mt-1">
            <Placeholder>Founders: add an email, Instagram or WhatsApp number in src/config/brand.ts</Placeholder>
          </p>
        </Notice>
      )}
    </Page>
  );
}

const policies: Record<string, { title: string; points: string[] }> = {
  shipping: {
    title: 'Shipping & pickup',
    points: ['Delivery areas and charges', 'Campus pickup locations and times', 'How long orders take to be ready', 'What happens if you miss a pickup'],
  },
  returns: {
    title: 'Returns & cancellations',
    points: ['Cancelling an order before it is printed', 'What to do if a sticker arrives damaged or misprinted', 'Reprints and refunds', 'Time limits for reporting a problem'],
  },
  privacy: {
    title: 'Privacy',
    points: ['What personal details are collected at checkout', 'How they are stored and for how long', 'Who they are shared with (e.g. a payment provider)', 'How to ask for your data to be deleted'],
  },
  terms: {
    title: 'Terms',
    points: ['Who runs the store', 'Pricing and payment terms', 'Ownership of the designs', 'Limits of liability'],
  },
};

export function PolicyPage() {
  const { slug } = useParams();
  const policy = policies[slug ?? ''];
  usePageMeta(policy ? policy.title : 'Policy not found');
  if (!policy) return <NotFoundPage />;
  return (
    <Page title={policy.title} crumb={policy.title}>
      <Notice tone="demo">
        <strong>Placeholder — not a final policy.</strong> {brand.displayName} isn’t taking real orders yet, so this policy hasn’t been written. It must be completed
        and checked by the founders before launch.
      </Notice>
      <p>This page will explain:</p>
      <ul className="list-disc space-y-2 pl-6 text-ink-soft">
        {policy.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </Page>
  );
}

export function NotFoundPage() {
  usePageMeta('Page not found');
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        title="This page came unstuck."
        body="The link might be old, or the page doesn’t exist."
        action={
          <Link to="/" className="btn-primary">
            Go home
          </Link>
        }
      />
    </div>
  );
}
