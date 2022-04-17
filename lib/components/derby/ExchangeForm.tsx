import { observer } from "mobx-react";
import { Decimal } from "decimal.js";
import { FC, useEffect, useMemo, useState } from "react";
import { Swap } from "@zeitgeistpm/sdk/dist/models";
import { ExtSigner } from "@zeitgeistpm/sdk/dist/types";

import { useDerby } from "../../context/DerbyContext";
import { useModals } from "../../context/ModalsContext";

import TradeButton from "./TradeButton";
import ExchangeStore from "../../state/Exchange";
import { usePageStore } from "../../context/PageStoreContext";
import { ZTG } from "../../constants";
import AmountInput from "../ui/AmountInput";
import { extrinsicCallback } from "../../util";

type ExchangeFormProps = {
  catIndex: number;
  className?: string;
  type: "buy" | "sell";
  wide?: boolean;
  onTransaction?: () => void;
  onInvalidChange?: (invalid: boolean) => void;
};

const ConfirmDialogContent: FC<{
  amountIn: number;
  assetIn: string;
  amountOut: number;
  assetOut: string;
  fee: number;
}> = ({ amountIn, assetIn, amountOut, assetOut, fee }) => {
  const total = (): string => {
    if (assetIn.toLowerCase() === "ztg") {
      return (amountIn + fee).toFixed(4);
    }
    return fee.toFixed(4);
  };
  return (
    <div className="font-mono text-gray-light-1">
      <div className="text-xl font-bold mb-3">
        Do you want to proceed with the transaction?
      </div>
      <div className="mb-3">
        <span className="font-bold">Buying:</span> {amountOut.toFixed(4)}{" "}
        {assetOut}
      </div>
      <div className="mb-3">
        <span className="font-bold">Transaction fee:</span> {fee.toFixed(4)} ZTG
      </div>
      <div className="mb-3">
        <span className="font-bold">Total:</span> {total()} ZTG
      </div>
    </div>
  );
};

const ExchangeForm: FC<ExchangeFormProps> = observer(
  ({ type, wide = false, catIndex, className = "", onInvalidChange }) => {
    const [spotPrice, setSpotPrice] = useState("");
    const [slippagePercentage, setSlippagePercentage] = useState<string>("20");
    const [maxPrice, setMaxPrice] = useState<string>();

    const pageContext = usePageStore();
    const marketStore = pageContext.market;
    const { settings } = pageContext;

    const swap: Swap = marketStore.pool;

    const store = useDerby();
    const { wallets } = store;
    const modalStore = useModals();

    const exchangeStore = useMemo<ExchangeStore>(() => {
      return pageContext.createExchangeStore(type, catIndex);
    }, [type, catIndex]);

    const { notifications } = store;

    useEffect(() => {
      if (exchangeStore?.loaded) {
        exchangeStore.initializeBalances();
      }
    }, [wallets.activeBalance, exchangeStore?.loaded]);

    useEffect(() => {
      if (exchangeStore?.loaded) {
        if (exchangeStore.fromAsset.name === "ztg") {
          const ztgPrice = pageContext.ztgPrices.get(
            exchangeStore.toAsset.name
          );
          ztgPrice && setSpotPrice(ztgPrice.toFixed(4));
        } else {
          const price = pageContext.assetPrices.get(
            exchangeStore.fromAsset.name
          );
          price && setSpotPrice(price.toFixed(4));
        }
      }
    }, [exchangeStore?.loaded, pageContext.assetPrices, pageContext.ztgPrices]);

    useEffect(() => {
      if (spotPrice && slippagePercentage) {
        const slippageMul = 1 + Number(slippagePercentage) * 0.01;
        const max = Number(spotPrice) * slippageMul * ZTG;
        setMaxPrice(max.toString());
      }
    }, [spotPrice, slippagePercentage]);

    if (exchangeStore == null || exchangeStore.loaded === false) {
      return null;
    }

    const { fromAsset, toAsset, fromAmount, toAmount, fromBalance } =
      exchangeStore;

    const onInputAmountChange = (v: string) => {
      if (!v) {
        exchangeStore.setFromAmount("0");
      } else {
        exchangeStore.setFromAmount(v);
      }

      calcExchangeValues("From");
    };

    const onMaxClicked = async () => {
      if (exchangeStore.fromAsset.name === "ztg") {
        let balance = wallets.activeBalance.sub(0.1);
        if (balance.lt(0)) {
          balance = new Decimal(0);
        }
        exchangeStore.setFromAmount(balance.toFixed(5));
      } else {
        const balance = await store.sdk.api.query.tokens.accounts(
          wallets.activeAccount.address,
          exchangeStore.fromAsset.value
        );
        //@ts-ignore
        const { free } = balance;
        exchangeStore.setFromAmount((free.toNumber() / ZTG).toString());
      }

      calcExchangeValues("From");
    };

    const calcExchangeValues = (fromOrTo: string) => {
      if (fromOrTo === "From") {
        const assetAmountOut = exchangeStore.getAmountOut();
        exchangeStore.setToAmount(assetAmountOut.toString());
      } else {
        const assetAmountIn = exchangeStore.getAmountIn();
        exchangeStore.setFromAmount(assetAmountIn.toString());
      }
    };

    const processTransaction = async (tx) => {
      const { signer } = wallets.getActiveSigner() as ExtSigner;
      const address = wallets.activeAccount.address;
      const unsub = await tx.signAndSend(
        address,
        { signer: signer },
        extrinsicCallback({
          successCallback: async () => {
            notifications.pushNotification(
              `Swapped ${fromAmount.toFixed(4)} ${
                fromAsset.name.toLowerCase() === "ztg"
                  ? "ZBP"
                  : fromAsset.name.toUpperCase()
              } to ${toAmount.toFixed(4)} ${
                toAsset.name.toLowerCase() === "ztg"
                  ? "ZBP"
                  : toAsset.name.toUpperCase()
              }`,
              {
                type: "Success"
              }
            );
            await marketStore.fetchPrices();

            pageContext.updateExchangeBalances(catIndex);

            exchangeStore.setFromAmount("0");
            exchangeStore.setToAmount("0");
            unsub();
          },
          broadcastCallback: () => {
            notifications.pushNotification("Broadcasting transaction...", {
              autoRemove: true
            });
          },
          failCallback: ({ index, error }) => {
            notifications.pushNotification(
              store.getTransactionError(index, error),
              { type: "Error" }
            );
            unsub();
          }
        })
      );
    };

    const openTransactionModal = async () => {
      const { activeAccount } = store.wallets;
      if (!activeAccount) return;
      if (!swap) return;

      await marketStore.updatePrices(fromAsset.name);

      const tx = store.sdk.api.tx.swaps.swapExactAmountIn(
        swap.poolId,
        fromAsset.value,
        fromAmount.mul(ZTG).toString(),
        toAsset.value,
        "0",
        maxPrice.toString()
      );

      const paymentInfo = await tx.paymentInfo(activeAccount.address);

      const partialFee = paymentInfo.partialFee.toNumber() / ZTG;

      modalStore.openConfirmModal(
        <ConfirmDialogContent
          amountIn={fromAmount.toNumber()}
          assetIn={fromAsset.name}
          amountOut={toAmount.toNumber()}
          assetOut={toAsset.name}
          fee={partialFee}
        />,
        <></>,
        () => processTransaction(tx)
      );
    };

    const inputValidationCb = (val: string) => {
      const num = Number(val);

      return !isNaN(num) && num > 0;
    };

    const isOverbought = (() => {
      return fromAsset.name === "ztg" && Number(spotPrice) > 1;
    })();

    return (
      <div
        className={`${className} ${
          wide ? "hidden md:flex md:w-160 justify-center mx-auto" : ""
        }`}
      >
        {wide && (
          <h5
            className={`${settings.textColorClass} font-sans text-lg font-medium
                capitalize mb-3 md:text-xl mr-4 w-24 text-right`}
          >
            {type === "buy" ? "Buy with" : "Sell"}
          </h5>
        )}
        <div className={`${wide ? "flex-grow" : ""}`}>
          {!wide && (
            <h5
              className={`${settings.textColorClass} font-sans text-lg font-medium capitalize
              mb-3 md:text-xl`}
            >
              {type}
            </h5>
          )}
          <div className="flex flex-row">
            <div className="flex-grow">
              <AmountInput
                className="text-right p-2"
                containerClass="h-10 bg-white flex flex-row justify-center items-center"
                onChange={onInputAmountChange}
                disabled={isOverbought}
                leftComponent={
                  <div className="flex justify-around items-center font-black pl-1">
                    {type === "buy" ? (
                      <>
                        <img className="w-6 h-6 mr-2" src="/ztg_8.svg" />
                        <h2>ZBP</h2>
                      </>
                    ) : (
                      <h2>{fromAsset.name.toUpperCase()}</h2>
                    )}
                  </div>
                }
                max={fromBalance ? fromBalance.toFixed(4) : "0.0000"}
                value={exchangeStore?.fromAmount?.toString() ?? "0.0000"}
              />
              <p className="mb-4 text-white text-sm flex flex-row justify-end w-full">
                Balance: {fromBalance ? fromBalance.toFixed(4) : "0.0000"}
              </p>
              <AmountInput
                className="text-right p-2 !text-black"
                containerClass="h-10 bg-white flex flex-row justify-center items-center"
                disabled={true}
                leftComponent={
                  <div className="flex justify-around items-center font-black pl-1">
                    <h2>Amount</h2>
                  </div>
                }
                value={toAmount ? toAmount.toString() : ""}
              />
              <div className="m-0 mb-1 flex flex-row justify-end text-white text-sm">
                <p>Price: {spotPrice !== "" ? spotPrice : "0.000"}</p>
              </div>
              <div className="m-0 mb-3 flex flex-row justify-end text-white text-sm">
                <p>Maximum price: {(Number(maxPrice) / ZTG).toFixed(4)}</p>
              </div>
            </div>
            {wide && !isOverbought && (
              <p
                className={`text-white text-center font-bold mb-16 ml-4 items-end justify-start flex`}
              >
                Use&nbsp;
                <span
                  className={`cursor-pointer ${settings.textColorClass} underline`}
                  onClick={onMaxClicked}
                >
                  Max
                </span>
              </p>
            )}
          </div>
          {!isOverbought && (
            <>
              <div className="md:flex flex-row items-center mb-2">
                <div className="mb-1 md:mb-0 text-white text-sm mr-5">
                  Slippage tolerance (%)
                </div>
                <AmountInput
                  min="0.5"
                  className="h-8 w-full text-right px-3 text-sm !bg-white"
                  containerClass="h-8 mb-0 w-1/6"
                  value={slippagePercentage}
                  onChange={setSlippagePercentage}
                  regex={new RegExp(`^[0-9]+(\\.[0-9]{0,1})?`)}
                />
              </div>
              <div className="hidden md:block mb-3 text-xxs text-white">
                Slippage tolerance is defining maximum price to buy the asset at
                in case of higher network congestion situations. If the price
                get larger, transaction will fail.
              </div>
            </>
          )}
          <div className="md:flex">
            {!wide && !isOverbought && (
              <p
                className={`text-white text-center font-bold mb-3 md:ml-2
              md:mb-0 md:order-2 md:flex-grow md:flex md:items-center md:justify-center`}
              >
                Use&nbsp;
                <span
                  className={`cursor-pointer ${settings.textColorClass} underline`}
                  onClick={onMaxClicked}
                >
                  Max
                </span>
              </p>
            )}
            {!isOverbought && (
              <TradeButton
                isPrimary={true}
                className={`${
                  wide ? "w-48" : "w-full"
                } mb-1 md:mb-0 md:order-1 py-2`}
                onClick={openTransactionModal}
              >
                Sign Transaction
              </TradeButton>
            )}
            {isOverbought && (
              <div className="w-full text-red-500 font-bold">
                The outcome is overbought and cannot be purchased at this time.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default ExchangeForm;
