import Decimal from "decimal.js";

type MathInput = string | number | Decimal;

export const calcSpotPrice = (
  tokenBalanceIn: MathInput,
  tokenWeightIn: MathInput,
  tokenBalanceOut: MathInput,
  tokenWeightOut: MathInput,
  swapFee: MathInput
): Decimal => {
  const numer = new Decimal(tokenBalanceIn).div(new Decimal(tokenWeightIn));
  const denom = new Decimal(tokenBalanceOut).div(new Decimal(tokenWeightOut));
  const ratio = numer.div(denom);
  const scale = new Decimal(1).div(new Decimal(1).sub(new Decimal(swapFee)));
  const spotPrice = ratio.mul(scale);
  return spotPrice;
};

export const calcOutGivenIn = (
  tokenBalanceIn: MathInput,
  tokenWeightIn: MathInput,
  tokenBalanceOut: MathInput,
  tokenWeightOut: MathInput,
  tokenAmountIn: MathInput,
  swapFee
) => {
  const weightRatio = new Decimal(tokenWeightIn).div(new Decimal(tokenWeightOut));
  const adjustedIn = new Decimal(tokenAmountIn).times(
    new Decimal(1).minus(new Decimal(swapFee))
  );
  const y = new Decimal(tokenBalanceIn).div(
    new Decimal(tokenBalanceIn).plus(adjustedIn)
  );
  const foo = y.pow(weightRatio);
  const bar = new Decimal(1).minus(foo);
  const tokenAmountOut = new Decimal(tokenBalanceOut).times(bar);
  return tokenAmountOut;
}

export const calcInGivenOut = (
  tokenBalanceIn: MathInput,
  tokenWeightIn: MathInput,
  tokenBalanceOut: MathInput,
  tokenWeightOut: MathInput,
  tokenAmountOut: MathInput,
  swapFee
) => {
  const weightRatio = new Decimal(tokenWeightOut).div(new Decimal(tokenWeightIn));
  const diff = new Decimal(tokenBalanceOut).minus(tokenAmountOut);
  const y = new Decimal(tokenBalanceOut).div(diff);
  const foo = y.pow(weightRatio).minus(new Decimal(1));
  const tokenAmountIn = new Decimal(tokenBalanceIn)
    .times(foo)
    .div(new Decimal(1).minus(new Decimal(swapFee)));
  return tokenAmountIn;
}