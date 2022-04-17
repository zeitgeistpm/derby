import { observer } from "mobx-react";
import { FC, PropsWithChildren, useEffect } from "react";
import { DerbyContextProvider, useDerby } from "../context/DerbyContext";
import { ModalsContextProvider, useModals } from "../context/ModalsContext";
import ModalContainer from "./modal/ModalContainer";
import NotificationCenter from "./ui/NotificationCenter";
import TopBar from "./ui/TopBar";

const StateProvider: FC<PropsWithChildren<{}>> = observer(({ children }) => {
  return (
    <DerbyContextProvider>
      <ModalsContextProvider>{children}</ModalsContextProvider>
    </DerbyContextProvider>
  );
});

const AppContent: FC<PropsWithChildren<{}>> = observer(({ children }) => {
  const modals = useModals();

  return (
    <>
      {modals.modal && <ModalContainer>{modals.modal}</ModalContainer>}
      <TopBar />
      {children}
    </>
  );
});

const AppLayout: FC<PropsWithChildren<{}>> = observer(({ children }) => {
  return (
    <StateProvider>
      <AppContent>{children}</AppContent>
      <NotificationCenter />
    </StateProvider>
  );
});

export default AppLayout;
