## What is "Derby"?

Nextjs application showcasing usage of categorical markets. A number of markets ending at the same time and have categories from a set of category names can be created. After all markets resolve with, traders are able to redeem all their winnings. 

## Install dependencies

`yarn install`

## Market creation

For this, mnemonic seed of a wallet funded with ZTG tokens is needed. Place such mnemonic seed in `.env` file:

```
WALLET_SEED=menmonic seed of a wallet with some ztg in it
```

Create `markets.json` modeled on `markets.json.example`. The `categoryNames` array needs to have the size of `numSlots` configuration entry and each of items is an array of fixed size representing category names used for each market respectively.

`endTimestamp` configuration field represents time in the future at which all created markets will end and after which trading will be disabled.

Easy way to get timestamp is by using following command in browser console: `(new Date('May 16 2023 15:00 UTC')).valueOf()`


After creating `markets.json` configuration item, run `yarn create-markets`. On successful execution the script will output the market ids of the created markets that has to be entered in the `lib/config.ts` file.

## App configuration

Configuring app visual identity is done through the `lib/config.ts` file. This file is already populated for the configuration setting set in `markets.json.example` and following documantation inside the file will help customize it according to your needs.
Classes that are set as configuration entries in `lib/config.ts` are tailwind classes existing in `tailwind.config.js` file.
