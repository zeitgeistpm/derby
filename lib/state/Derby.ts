import { range } from "lodash";
import SDK from "@zeitgeistpm/sdk";
import { makeAutoObservable, runInAction } from "mobx";
import config from "../config";
import { codecToNumber, getSdk, getSlotConfig } from "../util";
import Market from "./Market";
import PageStore from "./Page";
import User from "./User";
import Wallets from "./wallets";
import Notifications from "./Notifications";

interface ChainConfig {
  tokenSymbol: string;
  ss58Prefix: number;
}

export default class Derby {
  static readonly config = config;

  notifications = new Notifications();
  wallets = new Wallets(this);
  user = new User(this);

  markets?: Market[];
  pageStores?: PageStore[];

  chainConfig?: ChainConfig;
  sdk?: SDK;

  blockTimestamp?: number;

  subscribeBlock() {
    this.sdk.api.rpc.chain.subscribeNewHeads(async () => {
      const blockTs = await this.getBlockTimestamp();
      runInAction(() => {
        this.blockTimestamp = blockTs;
      });
    });
  }

  /**
   * Returns timestamp of the latest block
   */
  async getBlockTimestamp() {
    const now = await this.sdk.api.query.timestamp.now();
    return (now as any).toNumber();
  }

  constructor() {
    makeAutoObservable(this, {}, { deep: false });
  }

  private *loadChainConfig() {
    const [consts, properties] = yield Promise.all([
      this.sdk.api.consts,
      this.sdk.api.rpc.system.properties()
    ]);

    const config: ChainConfig = {
      tokenSymbol: properties.tokenSymbol
        .toString()
        .replace("[", "")
        .replace("]", ""),
      ss58Prefix: codecToNumber(consts.system.ss58Prefix)
    };

    this.chainConfig = config;
  }

  initialized = false;

  *initialize() {
    this.sdk = yield getSdk("ws://127.0.0.1:9944");
    (window as any).sdk = this.sdk;

    yield this.loadChainConfig();

    this.user.init();

    const storedWalletId = this.user.walletId;

    yield this.wallets.connectWallet(storedWalletId);

    const { marketIds } = config;

    this.markets = yield this.fetchMarkets(marketIds);

    let pageStores: PageStore[] = [];
    for (const index of range(marketIds.length)) {
      pageStores = [...pageStores, this.createPageStore(index)];
    }

    this.pageStores = pageStores;
    this.initialized = true;
  }

  private createPageStore(pageIndex: number): PageStore {
    const store = new PageStore(this.markets[pageIndex], getSlotConfig(pageIndex));

    return store;
  }

  private fetchMarkets = async (marketIds: number[]): Promise<Market[]> => {
    if (marketIds.length === 0) {
      throw Error("`config.marketIds` must contain at least one item.");
    }
    let markets: Market[] = [];

    for (const id of marketIds) {
      const rawMarket = await this.sdk.models.fetchMarketData(id);
      const market = new Market(this, rawMarket);
      market.init();
      markets.push(market);
    }
    return markets;
  };

  getCategoriesForPage(pageIndex: number) {
    return this.markets[pageIndex].categories;
  }

  getTransactionError(groupIndex: number, errorIndex: number): string {
    const { errorName, documentation } = this.sdk.errorTable.getEntry(
      groupIndex,
      errorIndex,
    );

    return documentation.length > 0
      ? documentation
      : `Transaction failed, error code: ${errorName}`;
  }
}
