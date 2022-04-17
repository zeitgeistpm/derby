import SDK from "@zeitgeistpm/sdk";
import type { Codec } from "@polkadot/types-codec/types";
import { ISubmittableResult, IEventRecord } from "@polkadot/types/types";
import Derby from "../state/Derby";
import Notifications from "../state/Notifications";

/**
 * Creates SDK from supplied parameters.
 *
 * Warning: Changing endpoint url to other than official zeitgeistpm networks is
 * not recommended
 *
 * @param endpoint Chain endpoint (default: Zeitgeist Battery Station Testnet)
 */
export const getSdk = async (endpoint: string = "wss://bsr.zeitgeist.pm") => {
  return await SDK.initialize(endpoint, {
    ipfsClientUrl: "http://localhost:5001"
  });
};

/**
 * @returns a number representation of a {@link Codec} object
 */
export const codecToNumber = (codec: Codec): number => {
  return Number(codec.toString());
};

/**
 *
 * @param address Address to shorten
 * @param start How many characters to show at start of the address
 * @param end How many characters to show at end of the address
 * @returns Shortened address
 */
export const shortenAddress = (
  address: string,
  start: number = 6,
  end: number = 4
) => {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * @param num Number for which localized version should be made
 * @param locale Locale (default: "en-US")
 * @returns Localized version of a number
 */
export const formatNumberLocalized = (
  num: number,
  locale: string = "en-US"
) => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * @param pageIndex index of the derby slot page
 * @returns {@link SlotConfig} object for pageIndex
 */
export const getSlotConfig = (pageIndex: number) => {
  return Derby.config.slots[pageIndex];
}


type GenericCallback = (...args: any[]) => void;

const processEvents = (
  events: IEventRecord<any>[],
  {
    failCallback,
    successCallback,
  }: { failCallback?: GenericCallback; successCallback?: GenericCallback },
  successMethod: string = "ExtrinsicSuccess",
  unsub?: () => void
) => {
  for (const event of events) {
    const { data, method } = event.event;
    if (method === "ExtrinsicFailed" && failCallback) {
      const { index, error } = data.toHuman()[0].Module;
      failCallback({ index, error });
    }
    if (method === "BatchInterrupted" && failCallback) {
      const { index, error } = data.toHuman()[1].Module;
      failCallback({ index, error }, +data.toHuman()[0]);
    } else if (successCallback && method === successMethod) {
      const res = data.toHuman();
      successCallback(res);
    }
    unsub && unsub();
  }
};

export const extrinsicCallback = ({
  successCallback,
  broadcastCallback,
  failCallback,
  finalizedCallback,
  retractedCallback,
  notificationStore,
  successMethod = "ExtrinsicSuccess",
}: {
  successCallback?: GenericCallback;
  broadcastCallback?: GenericCallback;
  failCallback?: GenericCallback;
  finalizedCallback?: GenericCallback;
  retractedCallback?: GenericCallback;
  successMethod?: string;
  notificationStore?: Notifications;
}): ((res: ISubmittableResult, unsub?: () => void) => void) => {
  return (result, unsub) => {
    const { status, events } = result;
    if (status.isInBlock && successCallback) {
      processEvents(
        events,
        { failCallback, successCallback: () => successCallback(result) },
        successMethod,
        unsub
      );
    } else if (status.isFinalized) {
      processEvents(
        events,
        { failCallback, successCallback: finalizedCallback },
        successMethod,
        unsub
      );
    } else if (status.isRetracted) {
      retractedCallback
        ? retractedCallback()
        : notificationStore?.pushNotification(
            "Transaction failed to finalize and has been retracted",
            { type: "Error" }
          );
      unsub();
    } else {
      broadcastCallback
        ? broadcastCallback()
        : notificationStore?.pushNotification("Broadcasting transaction...", {
            autoRemove: true,
          });
    }
  };
};
