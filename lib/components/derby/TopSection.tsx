import { useRouter } from 'next/router';
import { observer } from "mobx-react";
import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';

import Image from '../ui/Image';

import { useDerby } from "../../context/DerbyContext";
import Derby from '../../state/Derby';
import { getSlotConfig } from '../../util';

const NavItem: FC<PropsWithChildren<{
  path: string;
  iconUrl: string;
  active: boolean;
}>> = observer(({ path, iconUrl, children, active }) => {

  return (
    <div className="flex flex-row items-center md:justify-end">
      <Link href={path}>
        <a className="leading-7 underline">
          <img
            className={`inline-block mr-2 leading-7 ${
              active ? "opacity-30" : "opacity-100"
            }`}
            src={iconUrl}
            alt="Navigation icon"
          />
          <span className={`${active ? "opacity-30" : "opacity-50"}`}>
            {children}
          </span>
        </a>
      </Link>
    </div>
  );
});


const TopSection: FC<{ pageIndex: number }> = observer(
  ({ pageIndex }) => {
    const derbyStore = useDerby();
    const { pageRootUrl, staticRootUrl, marketIds } = Derby.config;

    const router = useRouter();
    const numPages = marketIds.length;

    const settings = getSlotConfig(pageIndex);

    const artImages = settings.topImage;
    const bgClass = settings.topBackgroundColorClass;
    const textClass = settings.textColorClass;

    const isActive = (path: string): boolean => {
      return path === router.asPath;
    };

    const links = [...Array(numPages)].map((_, idx) => {
      return {
        label: `Slot ${idx + 1}`,
        path: `${pageRootUrl}/${idx + 1}`,
        iconUrl: (() => {
          switch (idx) {
            case 0:
              return "/icons/rectangle.svg";
            case 1:
              return "/icons/ellipse.svg";
            case 2:
              return "/icons/polygon.svg";
          }
        })(),
      };
    });

    const slotText = (() => {
      switch (pageIndex) {
        case 0:
          return "the first";
        case 1:
          return "the second";
        case 2:
          return "the third";
      }
    })();

    return (
      <div className="md:max-w-3xl md:mx-auto lg:max-w-6xl">
        <div className="px-3.5 md:px-7 mt-5 text-white font-mono font-bold">
          <ul className="flex flex-row justify-between md:justify-end">
            {links.map((l, idx) => {
              const { label, path, iconUrl } = l;
              const active = isActive(path);
              return (
                <li
                  key={idx}
                  className={`${
                    active ? "md:mr-auto md:order-1" : "md:order-2 md:w-1/6"
                  }`}
                >
                  <NavItem
                    path={path}
                    iconUrl={iconUrl}
                    active={active}
                  >
                    {label}
                  </NavItem>
                </li>
              );
            })}
          </ul>
        </div>
        <div
          className={`kusama-derby font-mono mt-5 px-7 bg-no-repeat bg-center-15 bg-165px
          md:flex md:flex-row md:bg-20-center md:bg-248px lg:h-80 lg:mt-10 ${bgClass}`}
        >
          <h1
            className={`text-white uppercase mb-7 text-lg-2
            md:text-4xl font-bold md:w-1/2`}
          >
            Which project will win
            <span className={textClass}> {slotText} </span>
            parachain slot?
          </h1>
          <div className="md:w-1/2 md:ml-2">
            <Image
              imageUrl1x={`${staticRootUrl}/${artImages[0]}`}
              imageUrl2x={`${staticRootUrl}/${artImages[1]}`}
              alt="Kusama derby artwork"
              className="hidden md:block mb-6 lg:ml-auto"
            />
            <p
              className={`text-xs lg:text-base md:text-sm leading-6 text-gray-dd`}
            >
              When you buy or sell, you&apos;re purchasing a outcome token that gives
              you a position on a parachain&apos;s horse. For example, if you think
              Moonriver is going to win the parachain slot, you would buy the
              Moonriver outcome token. When this is done it removes some
              liquidity from the market, and therefore adjusts the price and
              placement of the parachain&apos;s horse.
            </p>
            <div className="flex justify-between mt-3">
              <p
                className={`${textClass} underline hidden lg:block mt-3 font-bold`}
              >
                <Link href={pageRootUrl}>Campaign Rules</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default TopSection;