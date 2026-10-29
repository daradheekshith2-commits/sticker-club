/**
 * COLLECTOR PASSPORT REWARDS — INTEGRATION POINT.
 *
 * Real stamps and rewards must come from server-side records of completed,
 * eligible orders. The browser can never be the source of truth: anything in
 * page state or localStorage can be edited by the visitor and doesn't sync
 * between devices. Until a backend exists, `rewardsApi.connected` is false
 * and the website only shows a demonstration passport.
 */

export interface PassportRecord {
  /** Stamps earned from completed, eligible orders. */
  stamps: { orderRef: string; date: string; seriesIds: string[] }[];
  rewardsRedeemed: number;
}

export interface RewardsApi {
  readonly connected: boolean;
  /** The signed-in customer's passport, from the server. */
  getPassport(): Promise<PassportRecord | null>;
}

export const rewardsApi: RewardsApi = {
  connected: false,
  async getPassport() {
    return null;
  },
};
