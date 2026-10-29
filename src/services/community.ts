/**
 * COMMUNITY API — votes and design ideas for the next drop.
 *
 * INTEGRATION POINT. The site talks to `communityApi`; today that is a demo
 * implementation that keeps everything in this browser tab's memory. Nothing
 * is sent anywhere, nothing is counted, and it's gone on refresh.
 *
 * To go live, write a `CommunityApi` that calls your backend and assign it
 * below. The backend must: validate input again (never trust the browser),
 * limit repeat voting (e.g. one vote per verified order or account),
 * moderate idea submissions for unsafe or infringing content, and store
 * results in one place. Only then may vote totals be shown.
 */

export interface VoteInput {
  proposalId: string;
  directionId: string;
}

export interface IdeaInput {
  proposalId: string;
  idea: string;
  /** Optional name or handle to credit. */
  name: string;
  /** The person confirmed it's their own idea and doesn't copy anyone else's work. */
  originalConfirmed: boolean;
}

export type SubmitResult = { ok: true; mode: 'demo' | 'live'; message: string } | { ok: false; message: string };

export interface CommunityApi {
  readonly mode: 'demo' | 'live';
  castVote(vote: VoteInput): Promise<SubmitResult>;
  submitIdea(idea: IdeaInput): Promise<SubmitResult>;
  /** Live totals; the demo returns null because it has no real votes to count. */
  getResults(): Promise<Record<string, number> | null>;
}

/** Demo: remembers only this tab's latest choice so the page can show it. */
export function createDemoCommunityApi(): CommunityApi & { lastVote: VoteInput | null; ideas: IdeaInput[] } {
  return {
    mode: 'demo',
    lastVote: null,
    ideas: [],
    async castVote(vote) {
      this.lastVote = vote;
      return { ok: true, mode: 'demo', message: 'Demo only: your choice is shown here but was not sent or counted.' };
    },
    async submitIdea(idea) {
      this.ideas.push(idea);
      return { ok: true, mode: 'demo', message: 'Demo only: your idea was checked on this page but not sent to us.' };
    },
    async getResults() {
      return null;
    },
  };
}

export const communityApi: CommunityApi = createDemoCommunityApi();
