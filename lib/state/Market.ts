import { makeAutoObservable, runInAction } from "mobx";
import MarketRaw from "@zeitgeistpm/sdk/dist/models/market";
import Swap from "@zeitgeistpm/sdk/dist/models/swaps";
import Decimal from "decimal.js";
import Derby from "./Derby";
import { MarketStatus, OutcomeSelectOption } from "../types";
import {
  forkJoin,
  from,
  interval,
  Observable,
  Subject,
  switchMap,
  tap
} from "rxjs";
import { MarketDispute } from "@zeitgeistpm/sdk/dist/types";
import { ZTG } from "../constants";
import { calcSpotPrice } from "../math";

export default class Market {
  // is market data loaded
  loaded = false;

  loaded$ = new Subject<boolean>();

  endTimestamp: number;

  disputes: MarketDispute[] = [];

  pool: Swap | null;

  get title() {
    return this.market.slug;
  }

  get endDateFormatted() {
    return new Date(this.endTimestamp).toLocaleString();
  }

  get endPassed(): boolean {
    return this.endTimestamp < this.store.blockTimestamp;
  }

  get market(): MarketRaw {
    return this._market;
  }

  get id(): number {
    return this.market.marketId;
  }

  get status(): MarketStatus {
    if (this.endPassed && this.market.status === "Active") {
      return "Ended";
    }
    return this.market.status as MarketStatus;
  }

  get reportedOutcome(): number | null {
    return (
      //@ts-ignore
      this.market.report && this.market.report.outcome.categorical
    );
  }

  get hasReport(): boolean {
    return this.reportedOutcome != null;
  }

  get reportedOutcomeText(): string | null {
    return this.hasReport ? this.categories[this.reportedOutcome] : null;
  }

  // get disputedOutcomeText(): string | null {
  //   return (
  //     this.lastDispute &&
  //     this.categories[this.lastDispute.outcome.asCategorical.toNumber()]
  //   );
  // }

  // get resolvedOutcomeText(): string | null {
  //   if (this.is("Resolved")) {
  //     return this.categories[this.market.resolvedOutcome];
  //   }
  //   return null;
  // }

  get canResolve(): boolean {
    return this.is("Ended");
  }

  get categories(): string[] {
    return this.market.categories.map((c) => c.name);
  }

  get assets(): any {
    return this.pool.assets;
  }

  get categoryAssetMap(): Map<string, any> {
    const map = new Map<string, any>();
    this.categories.forEach((category, idx) => {
      map.set(category, this.assets[idx]);
    });
    map.set("ztg", this.assets.slice(-1)[0]);
    return map;
  }

  get weights(): { [key: string]: number } | undefined {
    if (this.pool == null) {
      return;
    }
    const weights = this.pool.weights.toJSON();
    let res = {};
    for (const [name, asset] of this.categoryAssetMap) {
      if (name === "ztg") {
        res["ztg"] = weights["Ztg"];
      } else {
        const assetStr = asset.toString();
        res[name] = weights[assetStr];
      }
    }
    return res;
  }

  get ranking(): Map<
    string,
    { rank: number; price: number; isLeader: boolean }
  > {
    return this.getPricesWithRanking(this.ztgPrices);
  }

  get leadingAsset(): { asset: string; price: number } | null {
    const leader = Array.from(this.ranking.entries()).find((item) => {
      return item[1].isLeader;
    });
    if (!leader) {
      return null;
    }
    return {
      asset: leader[0],
      price: leader[1].price
    };
  }

  private getPricesWithRanking(
    prices: Map<string, Decimal>
  ): Map<string, { rank: number; price: number; isLeader: boolean }> {
    const mapArr: [string, number][] = Array.from(prices.entries()).map(
      (el) => {
        return [el[0], el[1].toNumber()];
      }
    );

    const sortedMapArr = mapArr.sort((a, b) => b[1] - a[1]);

    const map = new Map();

    let rank = 1;

    sortedMapArr.forEach(([category, price], index) => {
      const isLast = index === sortedMapArr.length - 1;
      const val = { rank, price, isLeader: false };
      if (!isLast) {
        const [_, nextPrice] = sortedMapArr[index + 1];
        if (nextPrice < price) {
          rank++;
        }
        if (index === 0 && rank === 2) {
          val["isLeader"] = true;
        }
      }
      map.set(category, val);
    });

    return map;
  }

  /**
   * Prices of all market assets in ZTG
   */
  ztgPrices = new Map<string, Decimal>();

  /**
   * Prices for 1 ZTG in category assets
   */
  assetPrices = new Map<string, Decimal>();

  async getSpotPrice(assetIn: string, assetOut: string) {
    if (this.pool == null) {
      return new Decimal(0);
    }
    const assetInPoolBalance = await this.getPoolBalance(assetIn);
    const assetInWeight = this.weights[assetIn];
    const assetOutPoolBalance = await this.getPoolBalance(assetOut);
    const assetOutWeight = this.weights[assetOut];
    const price = calcSpotPrice(
      assetInPoolBalance,
      assetInWeight,
      assetOutPoolBalance,
      assetOutWeight,
      "0"
    );
    return price;
  }

  private async getAssetPrice(category: string): Promise<Decimal> {
    const price = await this.getSpotPrice(category, "ztg");
    return price;
  }

  private async getAssetPrices(): Promise<Map<string, Decimal>> {
    const map = new Map<string, Decimal>();
    for (const category of this.categories) {
      map.set(category, await this.getAssetPrice(category));
    }
    return map;
  }

  private async getZtgPrice(category: string): Promise<Decimal> {
    const price = await this.getSpotPrice("ztg", category);
    return price;
  }

  private async getZtgPrices(): Promise<Map<string, Decimal>> {
    const map = new Map<string, Decimal>();
    for (const category of this.categories) {
      map.set(category, await this.getZtgPrice(category));
    }
    return map;
  }

  /**
   * Updates all the prices - runs 2 x number of categories async calls to chain
   */
  async fetchPrices(): Promise<void> {
    const ztgPrices = await this.getZtgPrices();
    const assetPrices = await this.getAssetPrices();
    runInAction(() => {
      this.ztgPrices = ztgPrices;
      this.assetPrices = assetPrices;
    });
  }

  /**
   * Updates both price of the asset in ztg and price of the ztg in asset.
   * Runs two async calls
   *
   * @param category - asset name
   */
  async updatePrices(category: string): Promise<void> {
    const ztgprice = await this.getZtgPrice(category);
    const ztgmap = this.ztgPrices;
    ztgmap.set(category, ztgprice);
    const assetprice = await this.getAssetPrice(category);
    const assetmap = this.assetPrices;
    assetmap.set(category, assetprice);
    runInAction(() => {
      this.ztgPrices = ztgmap;
      this.assetPrices = assetmap;
    });
  }

  /**
   * @param asset - asset type for balance
   * @returns balance of a pool asset
   */
  async getPoolBalance(asset?: any | string): Promise<Decimal | null> {
    if (this.pool == null) {
      return null;
    }
    const store = this.store;
    const account = await this.pool.accountId();
    if (asset == null || asset.isZtg || asset === "ztg") {
      const b = (await store.sdk.api.query.system.account(account)) as any;
      return new Decimal(b.data.free.toString()).div(ZTG);
    }
    const assetObj =
      typeof asset === "string" ? this.categoryAssetMap.get(asset) : asset;
    const b = (await store.sdk.api.query.tokens.accounts(
      account.toString(),
      assetObj.toJSON()
    )) as any;

    return new Decimal(b.toJSON().free.toString()).div(ZTG);
  }

  /**
   * Returns token balance for active user
   * @param asset - asset for which to get balance
   *
   * @returns balance as Decimal
   */
  async getAccountBalance(asset: any | string): Promise<Decimal> {
    const assetObj =
      typeof asset === "string" ? this.categoryAssetMap.get(asset) : asset;
    const store = this.store;
    const balance = (await store.sdk.api.query.tokens.accounts(
      store.wallets.activeAccount.address,
      assetObj
    )) as any;
    return new Decimal(balance.free.toString());
  }

  get lastDispute(): MarketDispute | null {
    const len = this.disputes.length;
    if (len === 0) {
      return null;
    }
    return this.disputes[len - 1];
  }

  get outcomeSelectOptions(): OutcomeSelectOption[] {
    return this.categories.map((category, idx) => ({
      value: idx,
      label: category
    }));
  }

  get numDisputes(): number {
    return this.disputes.length;
  }

  is(status: MarketStatus): boolean {
    return this.status === status;
  }

  constructor(public store: Derby, private _market: MarketRaw) {
    makeAutoObservable(this, {}, { deep: false });
  }

  private setLoaded() {
    this.loaded = true;
    this.loaded$.next(true);
    this.loaded$.complete();
  }

  async init() {
    const endTs = await this._market.getEndTimestamp();
    const disputes = await this._market.getDisputes();
    const pool = await this._market.getPool();
    runInAction(() => {
      this.endTimestamp = endTs;
      this.disputes = disputes;
      this.pool = pool;
      if (this.pool) {
        this.fetchPrices().then((_) => {
          this.setLoaded();
        });
        return;
      }
      this.setLoaded();
    });
  }

  periodicPriceUpdate(
    cycleMs: number
  ): Observable<[Map<string, Decimal>, Map<string, Decimal>]> | null {
    if (!this.pool) {
      return null;
    }
    return interval(cycleMs).pipe(
      switchMap(() => {
        return forkJoin([
          from(this.getZtgPrices()),
          from(this.getAssetPrices())
        ]);
      }),
      tap((prices) => {
        runInAction(() => {
          this.ztgPrices = prices[0];
          this.assetPrices = prices[1];
        });
      })
    );
  }
}
