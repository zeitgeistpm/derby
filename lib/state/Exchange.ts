import Decimal from "decimal.js";
import { Asset } from "@zeitgeistpm/types/dist/interfaces";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { ZTG } from "../constants";
import Market from "./Market";
import { calcInGivenOut, calcOutGivenIn, calcSpotPrice } from "../math";

export interface AssetOption {
  name: string;
  value: null | { [key: string]: null | number[] } | Asset;
}

export default class ExchangeStore {
  loaded = false;

  fromAsset: AssetOption | null = null;
  toAsset: AssetOption | null = null;

  fromAmount: Decimal | null = null;
  toAmount: Decimal | null = null;

  fromBalance: Decimal | null = null;
  toBalance: Decimal | null = null;

  async setAccountBalances() {
    const store = this.marketStore.store;

    const bal: { from: Decimal; to: Decimal } = {
      from: new Decimal(0),
      to: new Decimal(0)
    };

    for (const item of ["from", "to"]) {
      if (this[`${item}Asset`].name === "ztg") {
        bal[item] = store.wallets.activeBalance;
      } else {
        const balance = await store.sdk.api.query.tokens.accounts(
          store.wallets.activeAccount.address,
          this[`${item}Asset`].value
        );
        //@ts-ignore
        const { free } = balance;
        bal[item] = new Decimal(free.toNumber() / ZTG);
      }
    }

    runInAction(() => {
      this.fromBalance = bal.from;
      this.toBalance = bal.to;
    });
  }

  fromPoolBalance: Decimal | null = null;
  toPoolBalance: Decimal | null = null;

  async setPoolBalances() {
    const balIn = await this.marketStore.getPoolBalance(
      this.fromAsset.value as any
    );
    const balOut = await this.marketStore.getPoolBalance(
      this.toAsset.value as any
    );

    this.fromPoolBalance = balIn;
    this.toPoolBalance = balOut;
  }

  /**
   * Spot price for current fromAsset and toAsset
   */
  spotPrice: Decimal | null = null;

  /**
   * Price in Ztg as observable
   */
  get toPriceInZtg(): Decimal {
    return this.marketStore.ztgPrices.get(this.toAsset.name);
  }

  setFromAmount(amount?: string) {
    if (amount) {
      this.fromAmount = new Decimal(amount);
    }
  }

  setToAmount(amount?: string) {
    if (amount) {
      this.toAmount = new Decimal(amount);
    }
  }

  get weights() {
    return this.marketStore.pool.weights.toJSON();
  }

  get inWeight(): number | null {
    if (this.fromAsset == null) {
      return null;
    }

    const key = this.fromAsset.value.toString();
    return this.weights[key];
  }

  get outWeight(): number | null {
    if (this.toAsset == null) {
      return null;
    }

    const key = this.toAsset.value.toString();
    return this.weights[key];
  }

  get assetOptions(): AssetOption[] {
    const length = this.marketStore.pool.assets.length;
    return [...this.marketStore.pool.assets].map((c, index) => {
      if (index === length - 1) {
        return {
          value: c,
          name: "ztg"
        };
      }

      return {
        value: c,
        name: this.marketStore.categories[index]
      };
    });
  }

  constructor(
    public marketStore: Market,
    public options?: { fromAsset?: string; toAsset?: string }
  ) {
    makeAutoObservable(this, {}, { deep: false });
    this.initialize();
  }

  async initialize() {
    const { options } = this;
    const numAssets = this.assetOptions.length;
    const fromAsset =
      options?.fromAsset != null
        ? this.assetOptions.find((v) => v.name === options.fromAsset)
        : this.assetOptions[0];
    const toAsset =
      options?.toAsset != null
        ? this.assetOptions.find((v) => v.name === options.toAsset)
        : this.assetOptions[numAssets - 1];

    this.setAsset("From", fromAsset);
    this.setAsset("To", toAsset);
    this.setFromAmount("0");
    this.setToAmount("0");
    await this.initializeBalances();
    await this.setSpotPrice();

    runInAction(() => (this.loaded = true));
  }

  /**
   * Sets asset options for fromAsset or toAsset based on arguments.
   * If the assets end up same changes toAsset into next.
   *
   * @param fieldName - determines field for which to change currency
   * @param asset - currency as [[AssetOption]] or [[string]]
   */
  setAsset(fieldName: "From" | "To", asset: AssetOption | string) {
    let c: AssetOption;
    if (typeof asset === "string") {
      c = this.assetOptions.find((c) => c.name === asset);
    } else {
      c = asset;
    }
    let fromAsset: AssetOption;
    let toAsset: AssetOption;

    let same = false;

    if (fieldName === "From") {
      fromAsset = { ...c };
      same = fromAsset.name === this.toAsset?.name;
    } else if (fieldName === "To") {
      toAsset = { ...c };
      same = toAsset.name === this.fromAsset?.name;
    }

    if (same) {
      const idx = this.assetOptions.findIndex((curr) => curr.name === c.name);

      const otherAsset =
        idx === this.assetOptions.length - 1
          ? this.assetOptions[0]
          : this.assetOptions[this.assetOptions.length - 1];

      fieldName === "From" ? (toAsset = otherAsset) : (fromAsset = otherAsset);
    }

    if (fromAsset) {
      this.fromAsset = fromAsset;
    }
    if (toAsset) {
      this.toAsset = toAsset;
    }
  }

  /*
   * Swaps values for fromAmount and toAmount
   */
  swapAssets() {
    const fromAsset = { ...this.fromAsset };
    this.fromAsset = { ...this.toAsset };
    this.toAsset = { ...fromAsset };
    this.setFromAmount("");
    this.setToAmount("");
    this.setSpotPrice();
    this.initializeBalances();
  }

  async initializeBalances(): Promise<void> {
    await this.setPoolBalances();
    await this.setAccountBalances();
  }

  /**
   * @returns asset amount for current state
   */
  getAmountOut(): Decimal {
    return calcOutGivenIn(
      this.fromPoolBalance.toString(),
      this.inWeight,
      this.toPoolBalance.toString(),
      this.outWeight,
      this.fromAmount.toString(),
      this.marketStore.pool.swapFee
    );
  }

  getAmountIn(): Decimal {
    return calcInGivenOut(
      this.fromPoolBalance.toString(),
      this.inWeight,
      this.toPoolBalance.toString(),
      this.outWeight,
      this.toAmount.toString(),
      this.marketStore.pool.swapFee
    );
  }

  /**
   * Sets spotPrice and returns the value
   *
   * @returns Spot price for currently set from and to assets
   */
  async setSpotPrice(): Promise<Decimal | null> {
    const price = await this.marketStore.getSpotPrice(
      this.fromAsset.name as any,
      this.toAsset.name as any
    );

    runInAction(() => {
      this.spotPrice = price;
    });

    return price;
  }

  cost(): any {
    if (this.spotPrice == null) return null;
    return this.spotPrice.mul(this.fromAmount);
  }

  /**
   * Percentage of difference between current price and the price after the
   * exchange is executed
   */
  async calcImpact(): Promise<number> {
    const balIn = await this.marketStore.getPoolBalance(
      this.fromAsset.value as Asset
    );
    const balOut = await this.marketStore.getPoolBalance(
      this.toAsset.value as Asset
    );

    const balInAfter = balIn.sub(this.fromAmount);
    const balOutAfter = balOut.sub(this.toAmount);

    const priceBefore = calcSpotPrice(
      balIn,
      this.inWeight,
      balOut,
      this.outWeight,
      this.marketStore.pool.swapFee
    );

    const priceAfter = calcSpotPrice(
      balInAfter,
      this.inWeight,
      balOutAfter,
      this.outWeight,
      this.marketStore.pool.swapFee
    );

    const diff = priceAfter.sub(priceBefore);
    const impact = diff.div(priceBefore);
    const percent = impact.toNumber() * 100;
    return percent;
  }

  /**
   * Calculates the maximum profit by exchanging `fromAsset` to
   * `toAsset`. NOTE: only works with ZTG as `fromAsset`.
   */
  get maxProfit(): string | null {
    if (this.fromAsset.value.isZtg) {
      return this.toAmount.sub(this.fromAmount).toFixed(4);
    }
    return null;
  }
}
