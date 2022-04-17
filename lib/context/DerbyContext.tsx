import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react";
import { observer } from "mobx-react";
import { flowResult } from "mobx";

import Derby from "../state/Derby";

const DerbyContext = createContext<Derby | null>(null);

export default DerbyContext;

export const useDerby = () => {
  return useContext(DerbyContext);
};

export const DerbyContextProvider: FC<PropsWithChildren<{}>> = observer(
  ({ children }) => {
    const [derby] = useState<Derby>(new Derby());

    useEffect(() => {
      if (derby.initialized) {
        return;
      }
      const promise = flowResult(derby.initialize());
      return () => promise.cancel();
    }, [derby]);

    return (
      <DerbyContext.Provider value={derby}>{children}</DerbyContext.Provider>
    );
  }
);
