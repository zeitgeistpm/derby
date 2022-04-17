import { flatten } from "lodash";
import marketsConfig from "../markets.json";

const categoryNames = marketsConfig.categoryNames;

/**
 * All category names from `markets.json` flattened.
 */
const categoriesFlattened = flatten(categoryNames);

/**
 * Configuration object for each category.
 * Keys of this object must match category names from `market.json`.
 * Contains:
 * - info: information about the category e.g. for a sports or development team,
 * public person or similar.
 * - color: color used in the ui to represent the category.
 */
type CategoryConfiguration = {
  [K in typeof categoriesFlattened[number]]: { info: string; color: string };
};

/**
 * Derby slot configuration.
 * Each item contains configuration for a derby market.
 * e.g. `config.pages[0]` contains configuration for first derby page
 *
 * For `Class` config items, put tailwindcss classes to configure colors for
 * each page.
 */
export type SlotConfig = {
  /**
   * Base color for the slot
   */
  color: string;

  /**
   * Top section image.
   * For `Image` config items, ideally add two images: first in regular
   * resolution, second in high res for retina displays.
   */
  topImage: string[];

  /**
   * Tailwind class for background of the top section.
   */
  topBackgroundColorClass: string;

  /**
   * Tailwind class for background color.
   */
  backgroundColorClass: string;

  /**
   * Tailwind class for background image.
   */
  backgroundImageClass: string;

  /**
   * Tailwind class for base text color.
   */
  textColorClass: string;

  /**
   * Tailwind class for finish line color.
   * It is set as a background image, so it must start with `bg-`.
   */
  finishLineBackgroundColorClass: string;

  /**
   * Tailwind class for default border color.
   */
  borderColorClass: string;
};

const config: {
  /**
   * Identifiers for markets created on zeitgeistpm blockchain.
   * Size of this array determines the number of slots.
   */
  marketIds: number[];

  /**
   * Specify the root url for assets.
   * This is the name of the subdirectory in `public` directory.
   */
  staticRootUrl: string;

  /**
   * Specify the root url for the pages.
   * Default is "".
   */
  pageRootUrl: string;

  /**
   * Derby slot configurations.
   */
  slots: SlotConfig[];

  /**
   * Configuration for categories.
   */
  categoryConfig: CategoryConfiguration;
} = {
  // Set up derby configuration here
  marketIds: [15, 16, 17],

  staticRootUrl: "",

  pageRootUrl: "",

  slots: [
    {
      color: "#E10178",
      topImage: ["top-section-art_slot-1.jpg", "top-section-art_slot-1@2x.jpg"],
      topBackgroundColorClass: "bg-rectangle-red",
      backgroundColorClass: "bg-kusama-base",
      backgroundImageClass:
        "md:bg-kusama-bg-slot-1-md lg:bg-kusama-bg-slot-1-lg",
      textColorClass: "text-kusama-base",
      finishLineBackgroundColorClass:
        "md:bg-finishline-slot-1-md lg:bg-finishline-slot-1-lg",
      borderColorClass: "border-kusama-base"
    },
    {
      color: "#00B0E7",
      topImage: ["top-section-art_slot-2.jpg", "top-section-art_slot-2@2x.jpg"],
      topBackgroundColorClass: "bg-blue-circle",
      backgroundColorClass: "bg-kusama-blue",
      backgroundImageClass:
        "md:bg-kusama-bg-slot-2-md lg:bg-kusama-bg-slot-2-lg",
      textColorClass: "text-kusama-blue",
      finishLineBackgroundColorClass:
        "md:bg-finishline-slot-2-md lg:bg-finishline-slot-2-lg",
      borderColorClass: "border-kusama-blue"
    },
    {
      color: "#00E7BD",
      topImage: ["top-section-art_slot-3.jpg", "top-section-art_slot-3@2x.jpg"],
      topBackgroundColorClass: "bg-blue-circle",
      backgroundColorClass: "bg-kusama-blue",
      backgroundImageClass:
        "md:bg-kusama-bg-slot-2-md lg:bg-kusama-bg-slot-2-lg",
      textColorClass: "text-kusama-blue",
      finishLineBackgroundColorClass:
        "md:bg-finishline-slot-2-md lg:bg-finishline-slot-2-lg",
      borderColorClass: "border-kusama-blue"
    }
  ],

  categoryConfig: {
    karura: {
      info: "The DeFi hub of KusamaNetwork. Sister network of AcalaNetwork.",
      color: "#F12B4C"
    },
    moonriver: {
      info: "Solidity Smart Contracts on Kusama.",
      color: "#F2B80B"
    },
    khala: {
      info: "Blockchain Confidentiality by Trusted Computing",
      color: "#36FFFE"
    },
    robonomics: {
      info: "Created to integrate Cyber Physical Systems (CPSs) into AIRA.",
      color: "#5CBED3"
    },
    genshiro: {
      info: "Cross-chain money market that combines pooled lending with synthetic assets.",
      color: "#A4D8FF"
    },
    hydradx: {
      info: "Cross-chain liquidity protocol built on substrate.",
      color: "#52B2ED"
    },
    shiden: {
      info: "Shiden Network, a canary network of Plasm.",
      color: "#592AB1"
    },
    shyft: {
      info: "Public protocol designed to validate identity and power compliance directly into blockchain data.",
      color: "#341529",
    },
    darwinia: {
      info: "A decentralized heterogeneous cross-chain bridge protocol.",
      color: "#DE4E96"
    },
    kilt: {
      info: "Credentials for Web 3.0",
      color: "#F05A28"
    },
    maker: {
      info: "Utility token, governance token, and recapitalization resource of the Maker system.",
      color: "#1BAB9B"
    },
    mina: {
      info: "Mina is creating the infrastructure for the secure, democratic future we all deserve.",
      color: "#FEFDFF",
    },
    none: {
      info: "A catch-all option for none of these teams obtaining the full slot.",
      color: "#A2A2A2"
    }
  }
};

export default config;
