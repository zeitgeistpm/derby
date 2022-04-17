import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDerby } from "../lib/context/DerbyContext";
import Derby from "../lib/state/Derby";
import ErrorPage from "next/error";
import Page from "../lib/components/derby/Page";

const SlotPage = observer(() => {
  const derby = useDerby();
  const { initialized: derbyInitialized } = derby;
  const { config } = Derby;
  const { marketIds } = config;
  const numPages = marketIds.length;
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState<number>(-1);
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    if (router.isReady && derbyInitialized) {
      const { slotNum } = router.query;
      const pageId = parseInt(slotNum as string);
      if (pageId > 0 && pageId <= numPages) {
        return setPageIndex(pageId - 1);
      }
      setIs404(true);
    }
  }, [derbyInitialized, router.isReady, router.asPath]);

  if (is404) {
    return <ErrorPage statusCode={404} />;
  }
  if (pageIndex === -1) {
    return null;
  }
  return <Page pageIndex={pageIndex} />;
});

export default SlotPage;
