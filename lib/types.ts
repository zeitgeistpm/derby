import { AssetId } from "@zeitgeistpm/sdk/dist/types";

export type Primitive = null | number | string | boolean;
export type JSONObject =
  | Primitive
  | { [key: string]: JSONObject }
  | JSONObject[];

export enum EMarketStatus {
  Proposed = "Proposed",
  Active = "Active",
  // Warning: Ended is not an actual MarketStatus in the Substrate code. It's
  // provided here as a convenience.
  Ended = "Ended",
  Reported = "Reported",
  Disputed = "Disputed",
  Resolved = "Resolved"
}

export type MarketStatus = keyof typeof EMarketStatus;

export interface SelectOption {
  value: number | string;
  label: string;
}

export interface OutcomeSelectOption extends SelectOption {
  value: number;
}
