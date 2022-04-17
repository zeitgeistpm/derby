import Image from "next/image";
import { flowResult } from "mobx";
import { observer } from "mobx-react";
import { Download } from "react-feather";
import { useAccountModals } from "../../hooks";
import { useDerby } from "../../context/DerbyContext";
import Wallets from "../../state/wallets";
import { Wallet } from "../../state/wallets/types";

const WalletSelect = observer(() => {
  const store = useDerby();
  const { wallets } = store;
  const { errorMessages } = wallets;
  const accountModals = useAccountModals();

  const onWalletClick = async (wallet: Wallet, hasError: boolean) => {
    if (!wallet.installed) {
      window.open(wallet.installUrl);
    } else if (!hasError) {
      wallets.stopEnableLoop();
      wallets.clearErrorMessages();

      try {
        const errors = await flowResult(
          wallets.connectWallet(wallet.extensionName)
        );

        if (errors == null) {
          accountModals.openAccontSelect();
        }
      } catch (err) {}
    }
  };

  return (
    <div className="flex flex-col">
      {Wallets.supportedWallets.map((wallet, idx) => {
        const error = errorMessages.find(
          (e) => e.extensionName === wallet.extensionName
        );
        const hasError = error != null;
        return (
          <div key={wallet.extensionName}>
            <div
              className={
                "flex flex-row h-ztg-64 items-center rounded-ztg-12 bg-sky-700 px-ztg-12 " +
                (idx < 2 ? "mb-ztg-12 " : "") +
                (!hasError ? "cursor-pointer" : "")
              }
              onClick={() => {
                onWalletClick(wallet, hasError);
              }}
            >
              <Image
                alt={wallet.logo.alt}
                src={wallet.logo.src}
                width={32}
                height={32}
              />
              <div className="flex items-center font-lato text-ztg-18-150 ml-ztg-10">
                {wallet.title}
              </div>
              {!wallet.installed && (
                <div className="ml-auto">
                  <Download size={24} />
                </div>
              )}
              {hasError && (
                <div className="text-vermilion ml-auto font-lato text-ztg-12-120 w-ztg-275">
                  {error.message}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default WalletSelect;
