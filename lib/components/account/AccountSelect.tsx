import { useDerby } from "../../context/DerbyContext";
import { observer } from "mobx-react";
import React, { FC, useEffect, useRef, useState } from "react";
import Select, { components } from "react-select";

import CopyIcon from "../ui/CopyIcon";
import AccountSelectOption from "./AccountSelectOption";
import AccountSelectValue from "./AccountSelectValue";

const Control = observer(({ children, ...rest }) => {
  return (
    <components.Control {...rest as any}>
      <div className="flex items-center bg-black justify-between cursor-pointer rounded-ztg-10">
        {children}
      </div>
    </components.Control>
  );
});

const Option = observer((props) => {
  const { label, value } = props.data;

  return (
    <components.Option {...props} className="bg-black">
      <AccountSelectOption name={label} address={value} />
    </components.Option>
  );
});

const SingleValue = observer((props) => {
  return (
    <AccountSelectValue name={props.data.label} address={props.data.value} />
  );
});

const DropdownIndicator = () => {
  return null;
};

const IndicatorSeparator = () => {
  return <></>;
};

const customStyles = {
  valueContainer: () => {
    return {
      "input[readonly]": {
        display: "block",
      },
      height: "50px",
    };
  },
  control: (provided) => {
    return {
      borderWidth: 0,
      outline: 0,
    };
  },
  option: () => {
    return {};
  },
  input: () => {
    return { height: 0 };
  },
  menu: (provided) => {
    return {
      ...provided,
      marginTop: "3px",
      marginBottom: 0,
      backgroundColor: "black",
    };
  },
};

const AccountSelect: FC = observer(() => {
  const store = useDerby();
  const { wallets } = store;
  const { accountSelectOptions: options, activeAccount } = wallets;

  useEffect(() => {
    if (activeAccount) {
      const def = options.find((o) => o.value === activeAccount.address);
      setDefaultOption(def);
    }
  }, [activeAccount, options]);

  const [defaultOption, setDefaultOption] =
    useState<{ value: string; label: string }>();

  const onSelectChange = (opt) => {
    wallets.setActiveAccount(opt.value);
  };

  return (
    <div className="flex h-ztg-50 items-center bg-black rounded-ztg-10 w-full">
      <Select
        isSearchable={false}
        options={options}
        styles={customStyles}
        value={defaultOption}
        components={{
          Control,
          Option,
          SingleValue,
          DropdownIndicator,
          IndicatorSeparator,
        }}
        onChange={onSelectChange}
      />

      <CopyIcon
        copyText={wallets.activeAccount?.address}
        className="flex-grow pr-ztg-8"
        size={16}
      />
    </div>
  );
});

export default AccountSelect;
