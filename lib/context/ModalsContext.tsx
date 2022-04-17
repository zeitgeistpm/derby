import Modals from "../state/Modals";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState
} from "react";
import { observer } from "mobx-react";

const ModalsContext = createContext<Modals>(null);

export default ModalsContext;

export const useModals = () => {
  return useContext(ModalsContext);
};

export const ModalsContextProvider: FC<PropsWithChildren<{}>> = observer(
  ({ children }) => {
    const [modals] = useState<Modals>(() => new Modals());

    return (
      <ModalsContext.Provider value={modals}>{children}</ModalsContext.Provider>
    );
  }
);
