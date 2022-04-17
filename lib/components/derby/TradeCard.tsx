import { observer } from "mobx-react";
import { FC, useEffect, useState } from "react";
import { usePageStore } from "../../context/PageStoreContext";
import Derby from "../../state/Derby";
import Button from "../ui/Button";
import LogoImage from "../ui/LogoImage";
import ExchangeForm from "./ExchangeForm";
import Horse from "./Horse";
import TradeButton from "./TradeButton";

const TradeCard: FC<{
  team: string;
  index: number;
  className?: string;
  isLeader?: boolean;
}> = observer(({ team, index, isLeader = false, className = "" }) => {
  const { categoryConfig, staticRootUrl } = Derby.config;
  const [formShown, setFormShown] = useState(false);
  const [buyFormShown, setBuyFormShown] = useState<boolean>(false);
  const [sellFormShown, setSellFormShown] = useState<boolean>(false);

  const { color, info } = categoryConfig[team];

  const pageContext = usePageStore();

  const toggleBuyForm = () => {
    setBuyFormShown((val) => !val);
  };

  const toggleSellForm = () => {
    setSellFormShown((val) => !val);
  };

  const closeForm = () => {
    setBuyFormShown(false);
    setSellFormShown(false);
  };

  useEffect(() => {
    const show = buyFormShown || sellFormShown;
    setTimeout(() => setFormShown(show), show ? 0 : 700);
  }, [buyFormShown, sellFormShown]);

  return (
    <div
      className={`relative p-2.5 mb-2 md:mb-0 bg-gray-12 font-mono text-gray-light-1 ${className}`}
    >
      <div
        className={`flex flex-row flex-wrap ${
          formShown ? "md:h-16" : "md:h-auto"
        }`}
      >
        <div
          className={`flex mb-3 ${
            formShown ? "w-1/2" : "w-full"
          } md:mb-0 md:w-1/2 md:pr-4 md:flex md:justify-start
            items-center md:flex-col h-20 md:h-auto`}
        >
          <div
            className={`flex items-center justify-start md:justify-between md:items-center mr-3
              md:mr-0 h-9 md:h-12 md:w-full`}
            id="logoWrapper"
          >
            <LogoImage
              team={team}
              staticBaseUrl={staticRootUrl}
              className="max-h-9 md:max-h-10 max-w-150px lg:max-w-170px lg:max-h-40px"
            />
          </div>
          {!formShown && (
            <p
              className={`text-xs opacity-50 flex items-center ml-auto
              md:items-end font-bold w-1/2 md:w-full md:text-xxs md:h-12 lg:h-10`}
            >
              {info}
            </p>
          )}
        </div>
        {formShown && (
          <div className="flex justify-between w-1/2">
            <div className="w-full flex items-center relative">
              {isLeader && (
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full text-xs md:top-2 md:left-4
                  text-black font-sans flex items-center justify-center leader-indicator lg:left-12`}
                >
                  1
                </div>
              )}
              <div className="md:mx-auto h-14">
                <Horse color={color} className="h-14 md:h-14" />
              </div>
            </div>
            <div className="h-10 block">
              <span
                className={`${pageContext.settings.textColorClass} cursor-pointer inline-block h-10 leading-6
                  overflow-hidden`}
                onClick={closeForm}
                style={{
                  fontSize: "50px"
                }}
              >
                &#x2a09;
              </span>
            </div>
          </div>
        )}
        {!formShown && (
          <>
            {isLeader && (
              <div
                className={`absolute w-5 h-5 bg-white rounded-full text-xs md:top-6 md:left-36
                  text-black font-sans flex items-center justify-center leader-indicator lg:left-48`}
              >
                1
              </div>
            )}
            <div className="hidden md:block md:w-20 md:h-auto h-14 absolute top-6 left-42%">
              <Horse color={color} className="lg:h-16 md:h-12" />
            </div>
            <div className="flex w-full md:w-auto md:flex-col md:justify-between md:flex-grow md:ml-16">
              <TradeButton
                className="h-12 w-1/2 mr-2 md:mr-0 md:mb-1 md:w-full md:h-full"
                isPrimary={true}
                onClick={() => toggleBuyForm()}
              >
                Buy
              </TradeButton>
              <TradeButton
                className="h-12 w-1/2 md:w-full md:h-full"
                onClick={() => toggleSellForm()}
              >
                Sell
              </TradeButton>
            </div>
          </>
        )}
      </div>
      <div
        className={`md:bg-gray-12 md:left-0 md:z-10 md:w-full duration-700
        transition-height text-black overflow-hidden`}
        id="exchangeFormContainer"
      >
        <ExchangeForm
          className={`duration-700 transition-height text-black overflow-hidden ${
            buyFormShown
              ? "mt-3 md:mt-2 h-full max-h-96 md:mx-5 md:pb-3"
              : "h-0 max-h-0 md:mx-5"
          }`}
          type="buy"
          catIndex={index}
        />
        <ExchangeForm
          className={`duration-700 transition-all text-black overflow-hidden ${
            sellFormShown
              ? "mt-3 h-full max-h-96 md:mx-5 md:pb-3"
              : "h-0 max-h-0 md:mx-5"
          }`}
          type="sell"
          catIndex={index}
        />
      </div>
    </div>
  );
});

export default TradeCard;
