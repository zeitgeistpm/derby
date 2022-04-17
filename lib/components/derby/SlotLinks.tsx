import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { Skeleton } from "@mui/material";
import { useDerby } from "../../context/DerbyContext";
import Derby from "../../state/Derby";

const SlotLinks = observer(() => {
  const router = useRouter();
  const derby = useDerby();

  if (derby.initialized === false) {
    return (
      <Skeleton
        className="md:mx-7 md:max-w-none max-w-xs mx-auto bg-black transform-none h-96"
        style={{
          boxShadow: "0px 4px 150px rgba(225, 1, 120, 0.6)"
        }}
      />
    );
  }

  const categories: string[][] = [...Array(Derby.config.marketIds.length)].map(
    (_, idx) => {
      const t = derby.getCategoriesForPage(idx);
      t.sort();
      return t;
    }
  );

  const links = [...Array(Derby.config.marketIds.length)].map((_, idx) => {
    return `${Derby.config.pageRootUrl}/${idx + 1}`;
  });

  return (
    categories && (
      <div
        id="slotsBox"
        className="md:mx-7 md:max-w-none max-w-xs mx-auto flex flex-col md:flex-row md:justify-between cursor-pointer"
        style={{
          boxShadow: "0px 4px 150px rgba(225, 1, 120, 0.6)"
        }}
      >
        <div
          className="md:flex md:flex-col md:px-8 md:flex-grow py-10 hover:bg-kusama-base transition-colors duration-500"
          id="slotBox1"
          onClick={() => router.push(links[0])}
        >
          <h3 className="w-24 lg:w-44 h-24 lg:h-44 font-mono text-2xl font-bold flex items-center justify-center mx-auto mb-3 bg-rectangle-red bg-contain">
            Slot 1
          </h3>
          <p className="w-44 lg:w-52 text-center text-xs lg:text-base leading-6 mx-auto md:mb-0 text-gray-dd">
            {categories[0].map((team, index) => {
              return (
                <span key={index} className="capitalize">
                  {team}
                  {index < categories[0].length - 1 && (
                    <span className="text-purple-1"> / </span>
                  )}
                </span>
              );
            })}
          </p>
        </div>
        <div
          className="md:flex md:flex-col md:px-8 md:flex-grow py-10 hover:bg-kusama-blue transition-colors duration-500"
          id="slotBox2"
          onClick={() => router.push(links[1])}
        >
          <h3 className="w-24 lg:w-44 h-24 lg:h-44 font-mono text-2xl font-bold flex items-center justify-center mx-auto mb-3 bg-blue-circle bg-contain">
            Slot 2
          </h3>
          <p className="w-44 lg:w-52 text-center text-xs lg:text-base leading-6 mx-auto md:mb-0 text-gray-dd">
            {categories[1].map((team, index) => {
              return (
                <span key={index} className="capitalize">
                  {team}
                  {index < categories[1].length - 1 && (
                    <span className="text-purple-1"> / </span>
                  )}
                </span>
              );
            })}
          </p>
        </div>
        <div
          className="md:flex md:flex-col md:px-8 md:flex-grow py-10 hover:bg-kusama-green transition-colors duration-500"
          id="slotBox3"
          onClick={() => router.push(links[2])}
        >
          <h3 className="w-24 lg:w-44 h-24 lg:h-44 font-mono text-2xl font-bold flex items-center justify-center mx-auto mb-3 bg-no-repeat bg-center bg-green-triangle bg-contain">
            Slot 3
          </h3>
          <p className="w-44 lg:w-52 text-center text-xs lg:text-base leading-6 mx-auto mb-5 md:mb-0 text-gray-dd">
            {categories[2].map((team, index) => {
              return (
                <span key={index} className="capitalize">
                  {team}
                  {index < categories[2].length - 1 && (
                    <span className="text-purple-1"> / </span>
                  )}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    )
  );
});

export default SlotLinks;
