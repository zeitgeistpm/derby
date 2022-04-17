import { observer } from "mobx-react";
import { FC, ReactElement, useEffect, useState } from "react";
import { usePageStore } from "../../context/PageStoreContext";
import Derby from "../../state/Derby";
import LogoImage from "../ui/LogoImage";
import ExchangeForm from "./ExchangeForm";
import Horse from "./Horse";
import TradeCard from "./TradeCard";

const useExchangeFormToggle = () => {
  const [formShown, setFormShown] = useState(false);
  const [buyFormShown, setBuyFormShown] = useState<boolean>(false);
  const [sellFormShown, setSellFormShown] = useState<boolean>(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const toggleBuyForm = () => {
    setIsAnimating(true);
    setSellFormShown(false);
    setBuyFormShown(!buyFormShown);
  };

  const toggleSellForm = () => {
    setIsAnimating(true);
    setBuyFormShown(false);
    setSellFormShown(!sellFormShown);
  };

  const closeForm = () => {
    setIsAnimating(true);
    setBuyFormShown(false);
    setSellFormShown(false);
  };

  useEffect(() => {
    const show = buyFormShown || sellFormShown;

    if (formShown && show) {
      setIsAnimating(false);
      return setFormShown(show);
    }
    if ((formShown && !show) || (!formShown && show)) {
      setTimeout(() => {
        setFormShown(show);
        setIsAnimating(false);
      }, 700);
    }
  }, [buyFormShown, sellFormShown]);

  return {
    formShown,
    buyFormShown,
    sellFormShown,
    toggleBuyForm,
    toggleSellForm,
    isAnimating,
    closeForm
  };
};

export const Dots = observer(
  ({
    style = {},
    className = "",
    colorClass = "",
    renderDotContent
  }: {
    style?: object;
    className?: string;
    colorClass?: string;
    renderDotContent?: (idx: number) => ReactElement;
  }) => {
    return (
      <div
        className={`flex justify-center text-xl text-white
        flex-grow text-center relative ${className}`}
        style={style}
      >
        <div className="w-3/4 md:w-88% lg:w-90% flex justify-between text-center">
          <div className="hidden md:block relative">
            {renderDotContent ? renderDotContent(0) : <>&bull;</>}
          </div>
          <div className={`relative`}>
            {renderDotContent ? (
              renderDotContent(1)
            ) : (
              <span className="md:opacity-50">&bull;</span>
            )}
          </div>
          <div className={`relative`}>
            {renderDotContent ? (
              renderDotContent(2)
            ) : (
              <span className="md:opacity-50">&bull;</span>
            )}
          </div>
          <div className={`relative`}>
            {renderDotContent ? (
              renderDotContent(3)
            ) : (
              <span className="md:opacity-50">&bull;</span>
            )}
          </div>
          <div className={`hidden md:inline relative`}>
            {renderDotContent ? (
              renderDotContent(4)
            ) : (
              <span className={`${colorClass}`}>&bull;</span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const PriceIndicator: FC<{
  onBuy: () => void;
  onSell: () => void;
  color: string;
  colorClass: string;
  percent: string;
  isLeader: boolean;
  disableActions: boolean;
  hideButtons: boolean;
  isOverbought: boolean;
}> = observer(
  ({
    onBuy,
    onSell,
    colorClass,
    color,
    percent,
    isLeader,
    disableActions,
    hideButtons,
    isOverbought
  }) => {
    return (
      <div
        className="absolute mt-1 md:mt-0"
        style={{
          top: "-5px",
          left: `${percent}%`
        }}
      >
        <div className="relative ml-5">
          {isLeader && (
            <div className="md:hidden absolute w-5 h-5 bg-white rounded-full text-xs text-black font-sans flex items-center justify-center leader-indicator">
              1
            </div>
          )}
          <Horse color={color} className="w-10 h-8 md:h-10 md:w-20" />
          {!hideButtons && (
            <div
              className="absolute md:flex font-sans font-bold z-10 hidden mt-0.5"
              style={{ top: "-5px", left: "-20px", fontSize: "8px" }}
            >
              <div
                className={`w-6 h-6 text-white bg-black rounded-full uppercase flex items-center
              justify-center ${
                disableActions ? "pointer-events-none" : "cursor-pointer"
              } box-border border-2 border-white`}
                onClick={onSell}
              >
                sell
              </div>
              {!isOverbought && (
                <div
                  className={`${colorClass} w-6 h-6 rounded-full uppercase flex items-center justify-center ${
                    disableActions ? "pointer-events-none" : "cursor-pointer"
                  } box-border text-black`}
                  onClick={onBuy}
                >
                  buy
                </div>
              )}
              {/* {isOverbought && (
                <Tooltip content={
                  [<span key="tooltip" className="text-xs">The outcome is overbought and cannot be purchased at this time.</span>]
                  }>
                  <div
                    className={`${colorClass} w-6 h-6 rounded-full uppercase flex items-center
                    justify-center ${
                      disableActions ? "pointer-events-none" : "cursor-help"
                    } box-border text-black`}
                  >
                    <i className="fas fa-info-circle text-lg"></i>
                  </div>
                </Tooltip>
              )} */}
            </div>
          )}
        </div>
      </div>
    );
  }
);

const Track: FC<{
  team: string;
  index: number;
  numCategories: number;
  isLeader: boolean;
  rank: number;
}> = observer(({ team, index, numCategories, isLeader, rank }) => {
  const [pricePercentage, setPricePercentage] = useState("");
  const [isOverbought, setIsOverbought] = useState(false);
  const pageContext = usePageStore();
  const marketStore = pageContext.market;
  const settings = pageContext.settings;

  useEffect(() => {
    if (isLeader && marketStore.is("Resolved")) {
      setPricePercentage("100.00");
      return;
    }
    const category = marketStore.categories[index];
    const v = pageContext.ztgPrices.get(category);
    setIsOverbought(false);
    if (v.gt(1)) {
      setIsOverbought(true);
      return setPricePercentage(Number(100).toFixed(2));
    }
    setPricePercentage(v.mul(100).toFixed(2));
  }, [marketStore.id, pageContext.ztgPrices, marketStore.status]);

  const {
    formShown,
    buyFormShown,
    sellFormShown,
    toggleBuyForm,
    toggleSellForm,
    closeForm,
    isAnimating
  } = useExchangeFormToggle();

  const { staticRootUrl, categoryConfig } = Derby.config;

  const { color } = categoryConfig[team];

  const finishLineBg = settings.backgroundColorClass;
  const finishLineBgImage = settings.finishLineBackgroundColorClass;

  const baseFinishLinePercent = 100 / numCategories;

  const trackBgColor = index % 2 === 0 ? "bg-gray-1a" : "bg-gray-42";

  const topPercentages = (
    <Dots
      className="mb-8 mt-1 -mr-14 ml-6 lg:ml-7 lg:mr-4"
      renderDotContent={(idx) => (
        <>
          <span className="flex w-24 justify-center font-mono text-white text-sm opacity-100">{`${
            idx * 25
          }%`}</span>
        </>
      )}
    />
  );

  return (
    <div className="mx-5 text-gray-light-1 font-mono md:mx-2 relative">
      <div
        className={`h-10 ${trackBgColor} mb-2 md:mb-1.5 flex justify-between items-center
          relative md:h-12 lg:h-12.5`}
      >
        <div
          className={`hidden md:flex w-28 mx-auto bg-gray-1a h-full items-center`}
        >
          <div>
            <LogoImage
              team={team}
              staticBaseUrl={staticRootUrl}
              className="px-3 py-1"
            />
          </div>
        </div>
        <div className={"w-2 h-full"} style={{ background: color }}></div>
        <div className="flex-grow flex relative">
          <Dots colorClass={settings.textColorClass} />
          <div className="w-85% lg:w-88% md:w-85% absolute">
            <PriceIndicator
              colorClass={settings.backgroundColorClass}
              hideButtons={!marketStore.is("Active")}
              color={color}
              onBuy={toggleBuyForm}
              onSell={toggleSellForm}
              percent={pricePercentage}
              isLeader={isLeader}
              disableActions={isAnimating}
              isOverbought={isOverbought}
            />
          </div>
        </div>
        <div
          className={`w-2 h-full ${finishLineBg} ${finishLineBgImage}
            flex justify-center items-center font-bold text-xs md:w-12 md:bg-cover lg:w-29`}
          style={{
            backgroundPosition: `0 ${index * baseFinishLinePercent}%`
          }}
        >
          <span className="hidden md:inline">
            {!formShown ? (
              rank
            ) : (
              <span
                className={`text-white cursor-pointer inline-block h-8 leading-7
                  overflow-hidden`}
                onClick={closeForm}
                style={{
                  fontSize: "40px"
                }}
              >
                &#x2a09;
              </span>
            )}
          </span>
        </div>
      </div>
      {marketStore.is("Active") && (
        <div
          className="hidden md:block px-12 bg-gray-12 z-20 w-full"
          id="trackFormContainer"
        >
          {!isOverbought && (
            <div
              className={`${
                isAnimating ? "transition-all duration-700" : ""
              } text-black overflow-hidden
              ${buyFormShown ? "pb-5 h-full max-h-96" : "h-0 max-h-0"}`}
            >
              {topPercentages}
              <ExchangeForm
                type="buy"
                wide
                catIndex={index}
              />
            </div>
          )}
          <div
            className={`${
              isAnimating ? "transition-all duration-700" : ""
            } text-black overflow-hidden
              ${sellFormShown ? "pb-5 h-full max-h-96" : "h-0 max-h-0"}`}
          >
            {topPercentages}
            <ExchangeForm
              type="sell"
              wide
              catIndex={index}
            />
          </div>
        </div>
      )}
      {marketStore.is("Active") && (
        <TradeCard team={team} index={index} className="md:hidden px-3" />
      )}
    </div>
  );
});

export default Track;
