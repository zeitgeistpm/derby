import { observer } from "mobx-react";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useDerby } from "../../context/DerbyContext";
import PageStoreContext from "../../context/PageStoreContext";
import PageStore from "../../state/Page";
import { getSlotConfig } from "../../util";
import ButtonUp from "../ui/ButtonUp";
import TopSection from "./TopSection";
import Tracks from "./Tracks";
import TradeCards from "./TradeCards";

const Page: FC<PropsWithChildren<{ pageIndex: number }>> = observer(
  ({ pageIndex }) => {
    const derby = useDerby();
    const [pageStore, setPageStore] = useState<PageStore>();

    const settings = getSlotConfig(pageIndex);

    const scrollUp = () => {
      window.scroll({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
      const pageStore = derby.pageStores[pageIndex];
      setPageStore(pageStore);
      if (!pageStore.marketLoaded) {
        return;
      }
      pageStore.setPricesWithRanking(pageStore.ztgPrices);
      const sub = pageStore.market
        .periodicPriceUpdate(60 * 5 * 1000)
        .subscribe((v) => {
          pageStore.setPricesWithRanking(v[0]);
        });
      return () => sub.unsubscribe();
    }, [pageIndex, pageStore?.marketLoaded]);

    if (!pageStore) {
      return null;
    }

    return (
      <>
        <PageStoreContext.Provider value={pageStore}>
          <div
            className={`bg-black bg-no-repeat bg-center-675px ${settings.backgroundImageClass}`}
          >
            <TopSection pageIndex={pageIndex} />
            <Tracks />
            {pageStore.market.is("Active") && (
              <TradeCards className="mt-14 md:w-176 mx-auto lg:w-240" />
            )}
            <div className="flex justify-center my-5 md:my-8 lg:justify-end lg:max-w-5xl lg:mx-auto">
              <ButtonUp onClick={scrollUp} pageIndex={pageIndex} />
            </div>
          </div>
        </PageStoreContext.Provider>
      </>
    );
  }
);

export default Page;
