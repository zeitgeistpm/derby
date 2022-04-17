import Decimal from "decimal.js";
import { observer } from "mobx-react";
import { FC, useEffect, useState } from "react";
import { usePageStore } from "../../context/PageStoreContext";
import TradeCard from "./TradeCard";

const TradeCards: FC<{ className?: string }> = observer(
  ({ className = "" }) => {
    const [prices, setPrices] = useState<Map<string, Decimal> | null>(null);
    const pageContext = usePageStore();
    const marketStore = pageContext.market;

    let categories = [];

    marketStore.categories.forEach((item, index) => {
      if (categories.length === 0) {
        categories = [[item]];
        return;
      }
      if (categories.length === 1) {
        categories = [...categories, [item]];
        return;
      }
      if (index % 2 === 0) {
        categories = [[...categories[0], item], categories[1]];
      }
      else {
        categories = [categories[0], [...categories[1], item]];
      }
    });

    useEffect(() => {
      setPrices(marketStore.ztgPrices);
    }, [pageContext.ztgPrices, marketStore.id]);

    if (prices == null) {
      return null;
    }

    const pricesWithRanking = pageContext.pricesWithRanking;

    if (!pricesWithRanking) {
      return null;
    }

    return (
      <div className={`hidden md:flex ${className}`}>
        <div className={`w-1/2 px-1.5`}>
          {categories[0].map((category: string, idx: number) => {
            const index = marketStore.categories.findIndex(
              (cat) => cat.toLowerCase() == category.toLowerCase()
            );
            return <div className="mb-3" key={idx}>
              <TradeCard
                index={index}
                team={category.toLowerCase()}
                isLeader={pricesWithRanking.get(category).isLeader}
              />
            </div>
          })}
        </div>
        <div className={`w-1/2 px-1.5`}>
          {categories[1].map((category: string, idx: number) => {
            const index = marketStore.categories.findIndex(
              (cat) => cat.toLowerCase() == category.toLowerCase()
            );
            return <div className="mb-3" key={idx}>
              <TradeCard
                index={index}
                team={category.toLowerCase()}
                isLeader={pricesWithRanking.get(category).isLeader}
              />
            </div>
          })}
        </div>
      </div>
    );
  }
);

export default TradeCards;

