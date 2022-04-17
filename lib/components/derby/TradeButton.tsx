import { observer } from "mobx-react";
import { ButtonHTMLAttributes, FC } from "react";
import { usePageStore } from "../../context/PageStoreContext";

const TradeButton: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isPrimary?: boolean;
  }
> = observer(
  ({ isPrimary = false, children, className, disabled, ...restProps }) => {
    const { settings } = usePageStore();

    return (
      <button
        {...restProps}
        className={`font-sans border-2 box-border ${
          isPrimary
            ? `${settings.borderColorClass} ${settings.textColorClass}`
            : "border-white text-white"
        } ${disabled ? "opacity-20 pointer-events-none" : ""} ${
          className || ""
        }`}
      >
        {children}
      </button>
    );
  }
);

export default TradeButton;
