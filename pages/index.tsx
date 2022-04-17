import { observer } from "mobx-react";
import type { NextPage } from "next";
import { useState, useRef, useEffect } from "react";
import { debounceTime, fromEvent, Subscription } from "rxjs";
import SlotLinks from "../lib/components/derby/SlotLinks";

const IndexPage: NextPage = observer(() => {
  const [howToLineHeight, setHowtoLineHeight] = useState<number>();
  const howList = useRef<HTMLUListElement>(null);
  const resizeSub = useRef<Subscription>(null);

  const adjustHowtoLineDimensions = () => {
    if (howList.current == null) {
      return;
    }
    const liElems = Array.from(howList.current.querySelectorAll("li"));
    const len = liElems.length;
    const lastTop = liElems[len - 1].offsetTop;
    setHowtoLineHeight(lastTop);
  };

  useEffect(() => {
    resizeSub.current = fromEvent(window, "resize")
      .pipe(debounceTime(50))
      .subscribe(adjustHowtoLineDimensions);

    window.setTimeout(adjustHowtoLineDimensions, 100);

    return () => resizeSub.current.unsubscribe();
  }, []);

  return (
    <div
      id="landingPage"
      className="bg-black text-white md:bg-shapes-md-red lg:bg-shapes-lg-red bg-no-repeat bg-40-center"
    >
      <div className="md:max-w-3xl lg:max-w-6xl mx-auto">
        <div className="px-7 pt-5 bg-kusama-banner bg-no-repeat bg-365px bg-right pb-16 md:mr-4 lg:mr-10 lg:h-96 lg:bg-560px lg:mb-16">
          <div className="md:w-1/2 lg:w-4/5 lg:pt-10">
            <h1 className="text-3xl font-sans">Zeitgeist Presents:</h1>
            <h1 className="text-5xl md:text-6xl uppercase font-mono font-bold mt-3">
              <span className="text-kusama-base font-sans">The Kusama </span>
              parachain derby
            </h1>
          </div>
        </div>
        <div className="mt-1 font-mono">
          <p className="text-xs md:text-base leading-7 mx-5 my-7 md:mb-8 lg:mb-14 text-gray-ee">
            The Kusama Network is set to open the very first of its Parachain
            Slot Auctions soon, marking the first time that projects will be
            able to bid for a slot from which to launch on the Kusama mainnet.
            The auction will be held using the “candle auction” mechanism
            whereby bidders submit increasingly higher bids with no knowledge of
            when the auction will end, adding an element of urgency to their
            bidding while requiring them to make an informed estimate as to what
            a winning price could be.
          </p>
          <p className="text-xs md:text-base leading-7 mx-5 md:mb-8 lg:mb-14 text-gray-ee">
            This dynamic auction style will make for riveting twists and turns.
            Zeitgeist, an open prediction market ecosystem building on Kusama,
            will cover these plot twists with a unique prediction market
            campaign: “The Kusama Parachain Derby”!
          </p>
          <h3 className="uppercase text-2xl md:text-3xl mx-7 my-7 font-bold">
            <span className="text-kusama-base">Campaign </span>rules
          </h3>
          <ul className="text-xs md:text-base leading-7 mx-5 ml-9 mt-5 list-outside list-kusama-rectangle text-gray-ee lg:max-w-3xl lg:mx-auto lg:mb-14">
            <li className="pl-1 mb-5">
              You must sign up on the Gleam marketing campaign and submit your
              Zeitgeist address there. You cannot qualify if you don’t sign up
              via Gleam!
            </li>
            <li className="pl-1 mb-5">
              A total of 100,000 ZTG will be distributed to the community during
              this event (0.1% of the network’s token supply).
            </li>
            <li className="pl-1 mb-5">
              30,000 ZTG will be awarded to participants of the Gleam campaign.
            </li>
            <li className="pl-1 mb-5">
              50,000 ZTG will be awarded to participants of the Kusama Derby on
              the testnet.
            </li>
            <li className="pl-1 mb-5">
              20,000 ZTG will be awarded to node operators who participate by
              running nodes in the network and signing up for our future
              collator program.
            </li>
            <li className="pl-1 mb-5">
              A grand prize winner will be awarded in two different categories:
              The user who predicts the most accurate parachain slots with the
              most testnet tokens staked will receive a 10,000 ZTG bonus and a
              unique NFT! Additionally, the participant who gets the most points
              in our gleam campaign will be a grand prize winner of 5,000 ZTG
              and a unique NFT as well!
            </li>
            <li className="pl-1 mb-5">
              Beyond these winners the prizes will be split evenly among testnet
              participants and those competing in sharing the competition far
              and wide.
            </li>
            <li className="pl-1 mb-5">
              NOTE: ZTG Token will not be live until the genesis block of the
              network goes live, which is expected to happen in Q4 of 2021.
            </li>
          </ul>
          <div className="relative lg:flex">
            <h3 className="my-7 md:my-9 md:mt-14 uppercase text-2xl md:text-3xl mx-7 font-bold lg:m-0 lg:flex-grow lg:ml-7">
              <span className="text-kusama-base">How </span>it works
            </h3>
            <div className="relative lg:w-3/4">
              <div
                id="howVerticalLine"
                className="block left-9 absolute w-1 h-full bg-kusama-base list-outside z-10 top-5"
                style={{
                  height: `${howToLineHeight}px`
                }}
              ></div>
              <ul
                className="ml-20 mr-5 relative list-kusama-donut z-10"
                id="howList"
                ref={howList}
              >
                <li className="pl-7">
                  <h4 className="font-sans font-bold text-xl md:text-3xl mb-5 lg:mb-7">
                    Selecting A Team
                  </h4>
                  <p className="text-xs md:text-base mb-4 leading-7 text-gray-ee">
                    Selecting a team is like “backing a horse at a derby”, but
                    uses economics as a fundamental factor in the prediction
                    equation.
                  </p>
                  <p className="text-xs md:text-base mb-5 leading-7 text-gray-ee lg:mb-16">
                    In order to “back a horse”, you’ll need to buy or sell a
                    token, and when you do, you are purchasing a position that
                    reflects your belief in that represented team winning the
                    parachain slot. For example: If you think Karura is going to
                    win one of the parachain slots, you would purchase the
                    “Karura outcome token”. Once this purchase is made, it
                    removes some liquidity from the market, and therefore has an
                    impact on the price and prediction for all the “horses” in
                    the field.
                  </p>
                </li>
                <li className="pl-7">
                  <h4 className="font-sans font-bold text-xl md:text-3xl mb-5 lg:mb-7">
                    Making a Prediction
                  </h4>
                  <p className="text-xs md:text-base mb-5 leading-7 text-gray-ee lg:mb-16">
                    Purchasing the outcome token for a team&aposs horse equates to
                    predicting the likelihood that the represented team will win
                    the parachain slot. Since the outcome token is worth 1 ZBP
                    at the conclusion of the market, the price of the outcome
                    token reflects the prediction that the team will win. For
                    example, if the current price of an outcome token is 0.35
                    ZBP, that translates to a prediction of 35%. If you think
                    the likelihood is closer to 50%, you should buy the outcome
                    token at a price of 0.50 ZBP or below.
                  </p>
                </li>
                <li className="pl-7">
                  <h4 className="font-sans font-bold text-xl md:text-3xl mb-5 lg:mb-7">
                    The Winner takes it all
                  </h4>
                  <p className="text-xs md:text-base leading-7 text-gray-ee">
                    When the market resolves, the outcome token for the team who
                    actually won the parachain slot is redeemable for 1 ZBP. The
                    other outcome tokens will be instantly destroyed.
                  </p>
                </li>
              </ul>
            </div>
          </div>
          <h3 className="uppercase md:max-w-none mx-7 my-7 text-2xl md:text-3xl lg:mb-14 mt-12 lg:mt-20 font-bold">
            time to predict <span className="text-kusama-base">the winner</span>
          </h3>
          <p className="text-xs md:text-base leading-7 mx-5 my-7 md:mb-8 lg:mb-14 text-gray-ee">
            It’s time to take what you understand so far, and make your
            prediction in the inaugural Kusama Parachain Derby! Below, select
            which of the slot auctions you want to predict the outcome on, and
            on the next page purchase your outcome token representing each of
            the projects. Good luck!
          </p>
          <SlotLinks />
          <div className="flex justify-center my-12 lg:justify-end lg:max-w-5xl lg:mx-auto">
            <a
              className="cursor-pointer block"
              onClick={() => window.scroll({ top: 0, behavior: "smooth" })}
            >
              {/* <KusamaDerbyButtonUp pageIndex={0} /> */}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export default IndexPage;
