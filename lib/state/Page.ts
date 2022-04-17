import Decimal from "decimal.js";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { SlotConfig } from "../config";
import ExchangeStore from "./Exchange";
import MarketStore from "./Market";

class PageStore {
  /** prices of market category assets in ztg */
  get ztgPrices() {
    return this.market.ztgPrices;
  }

  /** prices for ztg in asset category */
  get assetPrices() {
    return this.market.assetPrices;
  }

  pricesWithRanking: Map<
    string,
    { rank: number; price: number; isLeader: boolean }
  > = null;

  setPricesWithRanking(prices: Map<string, Decimal>) {
    this.pricesWithRanking = this.getPricesWithRanking(prices);
  }

  get marketLoaded() {
    return this.market.loaded;
  }

  constructor(
    public market: MarketStore,
    public settings: SlotConfig
  ) {
    makeAutoObservable<PageStore>(this);
  }

  canRedeem = false;

  async setCanRedeem() {
    if (this.winner === false) {
      runInAction(() => (this.canRedeem = false));
      return;
    }
    const cat = this.getLeadingCategory();
    const bal = await this.market.getAccountBalance(cat);
    runInAction(() => {
      this.canRedeem = bal.gt(0);
    });
  }

  getLeadingCategory() {
    const winningCategory = Array.from(this.pricesWithRanking.entries()).find(
      (item) => {
        return item[1].isLeader;
      }
    )[0];

    return winningCategory;
  }

  get winner(): boolean | string {
    if (!this.market.is("Resolved")) {
      return false;
    }

    const winningCategory = this.getLeadingCategory();

    return winningCategory.toLowerCase() === "equilibrium"
      ? "genshiro"
      : winningCategory.toLowerCase();
  }

  exchangeStores: Map<string, ExchangeStore> = new Map();

  createExchangeStore(
    type: "buy" | "sell",
    categoryIndex: number
  ): ExchangeStore {
    let exStore = this.exchangeStores.get(
      JSON.stringify({ type, categoryIndex })
    );
    if (exStore) {
      return exStore;
    }

    const category = this.market.categories[categoryIndex];

    exStore = new ExchangeStore(this.market, {
      fromAsset: type === "buy" ? "ztg" : category,
      toAsset: type === "buy" ? category : "ztg"
    });

    this.exchangeStores.set(JSON.stringify({ type, categoryIndex }), exStore);

    return exStore;
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

  updateExchangeBalances(categoryIndex: number) {
    const buyExchangeStore = this.exchangeStores.get(
      JSON.stringify({
        type: "buy",
        categoryIndex
      })
    );
    const sellExchangeStore = this.exchangeStores.get(
      JSON.stringify({
        type: "sell",
        categoryIndex
      })
    );

    buyExchangeStore.initializeBalances();
    sellExchangeStore.initializeBalances();
  }
}

export default PageStore;
