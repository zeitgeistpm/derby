import React from "react";
import { observer } from "mobx-react";
import { Skeleton } from "@mui/material";

import { useDerby } from "../../context/DerbyContext";
import { formatNumberLocalized, shortenAddress } from "../../util";
import { useAccountModals } from "../../hooks";
import Avatar from "../ui/Avatar";

const AccountButton = observer(() => {
  const store = useDerby();
  const { wallets } = store;
  const { connected, activeAccount, activeBalance } = wallets;
  const accountModals = useAccountModals();

  if (store.initialized === false) {
    return <Skeleton className="bg-sky-700 h-ztg-40 w-ztg-168 rounded-full transform-none" />;
  }

  const connect = () => {
    accountModals.openWalletSelect();
  };

  return (
    <>
      {!connected ? (
        <div>
          <button
            className="flex w-ztg-168 h-ztg-40 bg-sky-700 text-white rounded-full text-ztg-14-150 font-medium items-center justify-center cursor-pointer"
            onClick={() => connect()}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="flex h-ztg-40">
          <div
            className="w-ztg-360 flex pl-ztg-25 h-full font-mono text-ztg-14-150 rounded-full cursor-pointer bg-sky-700 text-white"
            onClick={() => {
              accountModals.openAccontSelect();
            }}
          >
            <div className="font-bold mr-ztg-16 center w-ztg-176 ">
              {`${formatNumberLocalized(activeBalance?.toNumber())} ${
                store.chainConfig.tokenSymbol
              }`}
            </div>
            <div className="center bg-sky-500 dark:bg-black rounded-full h-full w-ztg-164 flex-grow text-white pl-ztg-6 pr-ztg-10">
              <Avatar address={activeAccount.address} />
              <div className="mr-auto text-black dark:text-white ml-ztg-10">
                {shortenAddress(activeAccount.address, 6, 4)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default AccountButton;
