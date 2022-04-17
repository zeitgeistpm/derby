import { observer } from "mobx-react";
import { FC, useEffect } from "react";
import { useDerby } from "../../context/DerbyContext";
import { usePageStore } from "../../context/PageStoreContext";
import Button from "../ui/Button";
import Track, { Dots } from "./Track";

const Tracks: FC = observer(() => {
  const store = useDerby();
  const { wallets } = store;
  // const notificationStore = useNotificationStore();

  const pageContext = usePageStore();

  const marketStore = pageContext.market;
  const categories = marketStore.categories;
  const numCategories = categories.length;

  const pricesWithRanking = pageContext.pricesWithRanking;

  useEffect(() => {
    if (pageContext.pricesWithRanking == null) {
      return;
    }
    pageContext.setCanRedeem();
  }, [pageContext.pricesWithRanking, wallets?.activeAccount]);

  if (!pricesWithRanking) {
    return null;
  }

  const winner = pageContext.winner;

  const submitRedeemTx = async () => {
    // try {
    //   const activeSigner = await store.getActiveSigner();
    //   marketStore.market.redeemShares(
    //     activeSigner,
    //     extrinsicCallback({
    //       successCallback: () => {
    //         notificationStore.pushNotification(`Transaction complete.`, {
    //           type: "Success",
    //         });
    //         pageContext.setCanRedeem();
    //         store.updateBalancesForActive();
    //       },
    //       broadcastCallback: () => {
    //         notificationStore.pushNotification("Broadcasting transaction.", {
    //           autoRemove: true,
    //         });
    //       },
    //       failCallback: () => {
    //         notificationStore.pushNotification(`Transaction failed.`, {
    //           type: "Error",
    //         });
    //       },
    //     })
    //   );
    // } catch (err) {
    //   console.error("Error occured while sending transaction", err);
    // }
  };

  return (
    <div className="mt-16 lg:mt-8 max-w-lg md:max-w-3xl lg:max-w-6xl mx-auto">
      {winner && (
        <div className="mx-5 md:mx-2 mb-3">
          <span className="text-gray-light-1 font-mono">
            Market resolved. Winner is{" "}
            <span className="uppercase">{winner}</span>
          </span>
          {pageContext.canRedeem && (
            <Button
              className={`${pageContext.settings.backgroundColorClass} text-black ml-4`}
              onClick={submitRedeemTx}
            >
              Redeem
            </Button>
          )}
        </div>
      )}
      {categories.map((team, idx) => {
        const rankingObject = pricesWithRanking.get(team);
        return (
          <Track
            index={idx}
            key={idx}
            team={team}
            numCategories={numCategories}
            isLeader={rankingObject.isLeader}
            rank={rankingObject.rank}
          />
        );
      })}
      <Dots
        renderDotContent={(idx) => (
          <>
            <span>&bull;</span>
            <span
              style={
                {
                  "--tw-translate-x": "-50%",
                  opacity: `${idx * 25}%`,
                } as any
              }
              className={`absolute left-1/2 transform ${pageContext.settings.textColorClass}`}
            >
              &bull;
            </span>
            <span className="flex w-24 justify-center font-mono text-white text-sm opacity-100">{`${
              idx * 25
            }%`}</span>
          </>
        )}
        className="hidden md:flex md:ml-10% md:mr-0.5% lg:mr-6.5% lg:ml-7.1%"
      />
    </div>
  );
});


export default Tracks;
