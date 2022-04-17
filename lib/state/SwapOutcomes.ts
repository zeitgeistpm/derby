import { makeAutoObservable } from "mobx";

export default class SwapOutcomes {
  constructor() {
    makeAutoObservable(this, {}, { deep: false });
  }
}
