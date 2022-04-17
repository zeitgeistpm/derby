import { makeAutoObservable, reaction } from "mobx";
import { JSONObject, Primitive } from "../types";
import Derby from "./Derby";

const getFromLocalStorage = (
  key: string,
  defaultValue: JSONObject
): JSONObject => {
  const val = window.localStorage.getItem(key);
  if (val == null && defaultValue) {
    return defaultValue;
  }
  return JSON.parse(val);
};

const setToLocalStorage = (key: string, value: JSONObject | Primitive) => {
  const val = JSON.stringify(value);
  window.localStorage.setItem(key, val);
};

export default class User {
  accountAddress: string | null = null;
  walletId: string | null = null;

  constructor(private derby: Derby) {
    makeAutoObservable(this, {}, { deep: false });

    reaction(
      () => this.derby.wallets?.activeAccount,
      (activeAccount) => {
        const newAddress = activeAccount?.address ?? null;
        setToLocalStorage("accountAddress", newAddress);
        this.accountAddress = newAddress;
      }
    );

    reaction(
      () => this.derby.wallets?.wallet,
      (wallet) => {
        const newWalletId = wallet?.extensionName ?? null;
        setToLocalStorage("walletId", newWalletId);
        this.walletId = newWalletId;
      }
    );
  }

  init() {
    this.accountAddress = getFromLocalStorage("accountAddress", "") as string;
    this.walletId = getFromLocalStorage("walletId", null) as string;
  }
}
