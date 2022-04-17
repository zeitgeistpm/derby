import { observer } from "mobx-react";
import React from "react";
import AccountButton from "../account/AccountButton";

const TopBar = observer(() => {

  return (
    <div className="flex w-full px-ztg-32 py-ztg-18 bg-sky-1000 sticky top-0 z-ztg-2 shadow-2xl">
      <div className="flex justify-between h-full w-full">
        <div className="flex h-full items-center">
          <AccountButton />
        </div>
      </div>
    </div>
  );
});

export default TopBar;
