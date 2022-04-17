import { observer } from "mobx-react";
import React, { FC } from "react";
import { LogOut } from "react-feather";
import Image from "next/image";
import { useDerby } from "../../context/DerbyContext";
import AccountSelect from "./AccountSelect";
import { useModals } from "../../context/ModalsContext";

const AccountModalContent: FC = observer(() => {
  const { wallets } = useDerby();
  const modals = useModals();

  const { activeBalance, disconnectWallet } = wallets;

  return (
    <div className="flex flex-col">
      <AccountSelect />
      <div className="flex items-center justify-between h-ztg-50 mt-ztg-15">
        <div className="rounded-ztg-10 h-full bg-black flex items-center flex-grow">
          <div className="px-ztg-8 flex items-center">
            <div className="center rounded-full w-ztg-28 h-ztg-28 bg-sky-1000">
              <div className="center rounded-full w-ztg-22 h-ztg-22 bg-black">
                <div className="center rounded-full w-ztg-16 h-ztg-16 bg-sky-1000">
                  <Image
                    src="/icons/acc-balance.svg"
                    alt="Account balance"
                    style={{ marginTop: "-1px" }}
                    width={16}
                    height={16}
                  />
                </div>
              </div>
            </div>
            <div className="ml-ztg-16 flex flex-col">
              <div className="uppercase text-ztg-10-150 font-bold text-sky-600">
                balance
              </div>
              <div className="font-mono text-ztg-14-120 font-bold text-sheen-green">
                {activeBalance?.toFixed(4) ?? "---"}
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex justify-evenly items-center w-ztg-176 bg-sky-700 ml-ztg-16 rounded-ztg-10 h-full text-white cursor-pointer"
          onClick={() => {
            disconnectWallet();
            modals.closeModal();
          }}
        >
          <div className="font-lato text-ztg-16-150 capitalize">disconnect</div>
          <LogOut size={16} className="text-white -ml-ztg-30" />
        </div>
      </div>
    </div>
  );
});

export default AccountModalContent;
