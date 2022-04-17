import { createContext, useContext } from "react";
import PageStore from "../state/Page";

const PageStoreContext = createContext<PageStore | null>(null);

export const usePageStore = () => useContext(PageStoreContext);

export default PageStoreContext;