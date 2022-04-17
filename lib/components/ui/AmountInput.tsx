import { observer } from "mobx-react";
import React from "react";
import {
  FC,
  useState,
  useRef,
  useEffect,
  ChangeEventHandler,
  FocusEventHandler
} from "react";

const inputClasses =
  "bg-sky-200 text-ztg-14-150 w-full h-ztg-40 p-ztg-8 font-lato focus:outline-none border-0 text-black bg-transparent";
const disabledInputClasses =
  "disabled:bg-transparent dark:disabled:bg-transparent disabled:border-sky-200 border-0 ";

export interface AmountInputProps {
  value?: string;
  max?: string;
  min?: string;
  name?: string;
  onChange?: (val: string) => void;
  className?: string;
  containerClass?: string;
  leftComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  disabled?: boolean;
  regex?: RegExp;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

const prepareVal = (s: string) => {
  if (s === "" || s === "0") {
    return s;
  }
  if (s[0] !== "0" && s[s.length - 1] !== "0") {
    return s;
  }
  if (s === "0.") {
    return s;
  }
  const split = s.split(".");
  const arr1 = split[0].split("");
  let c: string;
  let idx1 = 0;
  for (c of arr1.slice(0, -1)) {
    if (idx1 === arr1.length - 1) {
      break;
    }
    if (c === "0") {
      idx1++;
    } else {
      break;
    }
  }
  if (split.length === 1) {
    return `${arr1.slice(idx1).join("")}`;
  }
  return `${arr1.slice(idx1).join("")}.${split[1]}`;
};
const checkVal = (v: string, amountRegex: RegExp): string => {
  if (v != null) {
    const m = amountRegex.exec(v);
    if (m) {
      const val = prepareVal(m[0]);
      return val;
    }
  }
  return "";
};

const AmountInput: FC<AmountInputProps> = observer(
  ({
    onChange,
    value,
    max,
    min,
    name,
    className = "",
    containerClass = "",
    leftComponent,
    rightComponent,
    disabled,
    regex = new RegExp(`^[0-9]+(\\.[0-9]{0,10})?`),
    isFocused = false,
    onFocusChange = () => {}
  }) => {
    const amountRegex = regex;

    const [val, setVal] = useState<string>(() => {
      if (["", "0"].includes(value)) {
        return value;
      }

      const v = checkVal(value, amountRegex);

      return v;
    });
    const [focused, setFocused] = useState<boolean>(false);
    const [initialBlur, setInitialBlur] = useState<boolean>(false);

    const _inputRef = useRef<HTMLInputElement>(null);

    const strip = (v: string) => {
      if (v.endsWith(".")) {
        return v.slice(0, -1);
      }
      return v;
    };

    useEffect(() => {
      if (["", "0"].includes(value)) {
        return setVal(value);
      }

      const v = checkVal(value, amountRegex);

      setVal(v);
    }, [value]);

    useEffect(() => {
      if (initialBlur === false) {
        return;
      }
      onFocusChange(focused);
    }, [focused]);

    useEffect(() => {
      if (isFocused) {
        _inputRef.current?.focus();
      }
    }, [isFocused]);

    useEffect(() => {
      if (val == null || val === value) {
        return;
      }
      if (val === "0" || val === "") {
        onChange && onChange(val);
        return;
      }
      const v = strip(val);

      onChange && onChange(v);
    }, [val]);

    const onChanged: ChangeEventHandler<HTMLInputElement> = (e) => {
      setVal(checkVal(e.currentTarget.value, amountRegex));
    };

    const onBlured: FocusEventHandler = (_) => {
      if (val != null) {
        // remove insiginificant trailing zeros
        let calcVal = val.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, "$1");
        const checked = checkVal(calcVal, amountRegex);
        if (+checked > +max) {
          return setVal(max);
        }
        if (+checked < +min) {
          return setVal(min);
        }
        setVal(checkVal(calcVal, amountRegex));
      }
      setFocused(false);
      !initialBlur && setInitialBlur(true);
    };

    return (
      <div className={`relative ${containerClass}`}>
        {leftComponent && leftComponent}
        <input
          name={name}
          value={val == null ? "" : val}
          disabled={disabled}
          type="text"
          autoComplete="off"
          onChange={onChanged}
          onBlur={onBlured}
          onFocus={() => setFocused(true)}
          className={`${inputClasses} !font-mono text-right ${disabledInputClasses} ${className}`}
        />
        {rightComponent && rightComponent}
      </div>
    );
  }
);

export default AmountInput;
