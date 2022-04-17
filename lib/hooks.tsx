import { useEffect, useState } from "react";
import AccountModalContent from "../lib/components/account/AccountModalContent";
import AccountModalHead from "../lib/components/account/AccountModalHead";
import WalletSelect from "../lib/components/account/WalletSelect";
import { useModals } from "./context/ModalsContext";
import { usePageStore } from "./context/PageStoreContext";
import ExchangeStore from "./state/Exchange";

export const useAccountModals = () => {
  const modals = useModals();

  return {
    openAccontSelect: () => {
      modals.openModal(<AccountModalContent />, <AccountModalHead />, {
        styles: { width: "500px" }
      });
    },
    openWalletSelect: () => {
      modals.openModal(<WalletSelect />, "Connect wallet", {
        styles: { width: "500px" }
      });
    }
  };
};
