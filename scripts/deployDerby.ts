import "dotenv/config";
import SDK, { util } from "@zeitgeistpm/sdk";
import {
  DecodedMarketMetadata,
  MarketDisputeMechanism,
  MarketPeriod,
  MarketTypeOf
} from "@zeitgeistpm/sdk/dist/types";
import { range } from "lodash";
import config from "../markets.json";

const { numSlots, endTimestamp, oracleAddress, categoryNames } = config;

let numCategories = -1;

for (const categories of categoryNames) {
  if (numCategories === -1) {
    numCategories = categories.length;
  } else if (categories.length !== numCategories) {
    throw Error("Eache array in `categoryNames` must be of equal length");
  }
}
const catIdxs = range(numCategories);

const seed = process.env["WALLET_SEED"];

if (seed == null) {
  throw Error("Cannot read WALLET_SEED environment variable.");
}

const endpoint = "ws://127.0.0.1:9944";
const ZTG = 10 ** 10;

const deployMarkets = async (): Promise<void> => {
  const sdk = await SDK.initialize(endpoint, {
    ipfsClientUrl: "http://127.0.0.1:5001"
  });

  const signer = util.signerFromSeed(seed);
  console.log("sending transactions from", signer.address);

  const marketIds = [];
  const nowTimestamp = new Date().valueOf();

  const period: MarketPeriod = { timestamp: [nowTimestamp, endTimestamp] };
  const marketType: MarketTypeOf = { Categorical: numCategories };
  const mdm: MarketDisputeMechanism = { SimpleDisputes: null };
  const baseAmount = (100 * ZTG).toString();
  const amounts = catIdxs.map((_) => {
    return baseAmount;
  });
  const baseWeight = (1 / numCategories) * 10 * ZTG;
  const weightsNums = catIdxs.map((_) => {
    return baseWeight;
  });
  const totalWeight = weightsNums.reduce<number>((acc, curr) => {
    return acc + curr;
  }, 0);
  const weights = [
    ...weightsNums.map((w) => Math.floor(w).toString()),
    totalWeight.toString()
  ];

  for (let i = 0; i < numSlots; i++) {
    const categories = config.categoryNames[i].map((name) => {
      return { name };
    });
    const metadata = {
      categories,
    };
    console.log("METADATA", JSON.stringify(metadata));
    const marketId = await sdk.models.createCpmmMarketAndDeployAssets(
      signer,
      oracleAddress,
      period,
      marketType,
      mdm,
      amounts,
      baseAmount,
      weights,
      metadata as DecodedMarketMetadata,
      false
    );

    marketIds.push(marketId.toString());
  }

  console.log("created derby markets with following ids: ", marketIds);

  sdk.api.disconnect();
};

deployMarkets();
